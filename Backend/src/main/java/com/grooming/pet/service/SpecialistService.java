package com.grooming.pet.service;

import com.grooming.pet.dto.request.*;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpecialistService {
    private final SpecialistRepository specialistRepository;
    private final SlotRepository slotRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final AuthService authService;

    public SpecialistService(SpecialistRepository specialistRepository,
                             SlotRepository slotRepository,
                             BookingSlotRepository bookingSlotRepository,
                             AuthService authService) {
        this.specialistRepository = specialistRepository;
        this.slotRepository = slotRepository;
        this.bookingSlotRepository = bookingSlotRepository;
        this.authService = authService;
    }

    public SpecialistProfileResponse createProfile(SpecialistProfileRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.SPECIALIST) {
            throw new ForbiddenException("Only specialists can create a profile.");
        }
        if (specialistRepository.findByUser(currentUser).isPresent()) {
            throw new ConflictException("Specialist profile already exists.");
        }
        if (specialistRepository.existsByNameAndSpecialty(req.getName(), req.getSpecialty())) {
            throw new ConflictException("A specialist with this name and specialty combination already exists.");
        }
        Specialist specialist = new Specialist();
        specialist.setUser(currentUser);
        specialist.setName(req.getName());
        specialist.setSpecialty(req.getSpecialty());
        specialist.setQualificationLevel(req.getQualificationLevel());
        specialist.setBio(req.getBio());
        specialist.setPriceAmount(req.getFee());
        specialist.setStatus(Specialist.Status.PENDING);
        specialist = specialistRepository.save(specialist);
        return toProfileResponse(specialist);
    }

    public SpecialistProfileResponse updateProfile(SpecialistProfileRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.SPECIALIST) {
            throw new ForbiddenException("Only specialists can update their profile.");
        }
        Specialist specialist = specialistRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found."));
        specialist.setName(req.getName());
        specialist.setSpecialty(req.getSpecialty());
        specialist.setQualificationLevel(req.getQualificationLevel());
        specialist.setBio(req.getBio());
        specialist.setPriceAmount(req.getFee());
        specialist.setStatus(Specialist.Status.PENDING);
        specialist = specialistRepository.save(specialist);
        return toProfileResponse(specialist);
    }

    public SpecialistProfileResponse updateStatus(SpecialistStatusRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.SPECIALIST) {
            throw new ForbiddenException("Only specialists can update their own status.");
        }
        Specialist specialist = specialistRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found."));
        Specialist.Status newStatus;
        try {
            newStatus = Specialist.Status.valueOf(req.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status value. Allowed: ACTIVE, PAUSED.");
        }
        if (newStatus != Specialist.Status.ACTIVE && newStatus != Specialist.Status.PAUSED) {
            throw new BadRequestException("Specialist can only set status to ACTIVE or PAUSED.");
        }
        specialist.setStatus(newStatus);
        specialist = specialistRepository.save(specialist);
        return toProfileResponse(specialist);
    }

    public SpecialistProfileResponse getOwnProfile() {
        User currentUser = authService.getCurrentUser();
        Specialist specialist = specialistRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found."));
        return toProfileResponse(specialist);
    }

    public SpecialistProfileResponse getProfile(Long id) {
        Specialist specialist = specialistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist not found."));
        if (specialist.getStatus() != Specialist.Status.ACTIVE) {
            throw new ForbiddenException("This specialist profile is not active.");
        }
        return toProfileResponse(specialist);
    }

    public List<PendingSpecialistResponse> getPendingProfiles() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        return specialistRepository.findByStatus(Specialist.Status.PENDING).stream()
                .map(s -> new PendingSpecialistResponse(
                        s.getId(), s.getName(), s.getSpecialty(), s.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public SpecialistProfileResponse reviewProfile(Long id, ReviewRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        Specialist specialist = specialistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist not found."));
        String action = req.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            specialist.setStatus(Specialist.Status.ACTIVE);
        } else if ("REJECT".equals(action)) {
            if (req.getReason() == null || req.getReason().isBlank()) {
                throw new BadRequestException("A reason is required when rejecting a profile.");
            }
            specialist.setStatus(Specialist.Status.REJECTED);
        } else {
            throw new BadRequestException("Invalid action. Allowed: APPROVE, REJECT.");
        }
        specialist = specialistRepository.save(specialist);
        return toProfileResponse(specialist);
    }

    public List<SpecialistSummaryResponse> search(String name, String category, String level,
                                               LocalDate slotDate, LocalTime startTime, LocalTime endTime) {
        String nameParam = (name != null && !name.isBlank()) ? name : null;
        String categoryParam = (category != null && !category.isBlank()) ? category : null;
        String levelParam = (level != null && !level.isBlank()) ? level : null;

        List<Specialist> specialists;
        if (slotDate != null) {
            LocalTime startTimeParam = (startTime != null) ? startTime : null;
            LocalTime endTimeParam = (endTime != null) ? endTime : null;
            specialists = specialistRepository.searchWithTimeSlot(nameParam, categoryParam, levelParam,
                    slotDate, startTimeParam, endTimeParam);
        } else {
            specialists = specialistRepository.search(nameParam, categoryParam, levelParam);
        }

        return specialists.stream()
                .map(s -> new SpecialistSummaryResponse(
                        s.getId(), s.getName(), s.getSpecialty(), s.getQualificationLevel(), s.getPriceAmount()))
                .collect(Collectors.toList());
    }

    public ScheduleResponse getSchedule(Long specialistId) {
        Specialist specialist = specialistRepository.findById(specialistId)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist not found."));
        List<Slot> slots = slotRepository.findBySpecialist(specialist);
        List<SlotResponse> slotResponses = slots.stream().map(slot -> {
            List<BookingSlot> bookingSlots = bookingSlotRepository.findBySlot(slot);
            BookingSlot activeBookingSlot = bookingSlots.stream()
                    .filter(bs -> bs.getBooking().getStatus() == com.grooming.pet.model.Booking.Status.PENDING
                            || bs.getBooking().getStatus() == com.grooming.pet.model.Booking.Status.CONFIRMED)
                    .findFirst().orElse(null);
            String bookingStatus = activeBookingSlot != null ? activeBookingSlot.getBooking().getStatus().name() : null;
            String customerName = activeBookingSlot != null ? activeBookingSlot.getBooking().getCustomer().getName() : null;
            return new SlotResponse(slot.getId(), slot.getSlotDate(), slot.getStartTime(), slot.getEndTime(),
                    slot.getStatus().name(), bookingStatus, customerName);
        }).collect(Collectors.toList());
        return new ScheduleResponse(specialist.getId(), specialist.getPriceAmount(), slotResponses);
    }

    private SpecialistProfileResponse toProfileResponse(Specialist s) {
        return new SpecialistProfileResponse(
                s.getId(), s.getName(), s.getSpecialty(), s.getQualificationLevel(),
                s.getBio(), s.getPriceAmount(), s.getStatus().name());
    }
}
