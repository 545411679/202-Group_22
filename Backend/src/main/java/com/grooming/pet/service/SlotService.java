package com.grooming.pet.service;

import com.grooming.pet.dto.request.SlotCreateRequest;
import com.grooming.pet.dto.response.SlotResponse;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SlotService {
    private final SlotRepository slotRepository;
    private final SpecialistRepository specialistRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final AuthService authService;

    public SlotService(SlotRepository slotRepository,
                       SpecialistRepository specialistRepository,
                       BookingSlotRepository bookingSlotRepository,
                       AuthService authService) {
        this.slotRepository = slotRepository;
        this.specialistRepository = specialistRepository;
        this.bookingSlotRepository = bookingSlotRepository;
        this.authService = authService;
    }

    public SlotResponse createSlot(SlotCreateRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.SPECIALIST) {
            throw new ForbiddenException("Only specialists can create slots.");
        }
        Specialist specialist = specialistRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found."));

        if (!req.getSlotDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Slot date must be in the future.");
        }
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new BadRequestException("End time must be after start time.");
        }
        long minutes = ChronoUnit.MINUTES.between(req.getStartTime(), req.getEndTime());
        if (minutes < 30) {
            throw new BadRequestException("Slot duration must be at least 30 minutes.");
        }
        boolean overlap = slotRepository.existsOverlap(
                specialist, req.getSlotDate(), req.getStartTime(), req.getEndTime(), 0L);
        if (overlap) {
            throw new ConflictException("This slot overlaps with an existing slot.");
        }

        Slot slot = new Slot();
        slot.setSpecialist(specialist);
        slot.setSlotDate(req.getSlotDate());
        slot.setStartTime(req.getStartTime());
        slot.setEndTime(req.getEndTime());
        slot.setStatus(Slot.Status.AVAILABLE);
        slot = slotRepository.save(slot);

        return toSlotResponse(slot);
    }

    public List<SlotResponse> getMySlots(String statusFilter) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.SPECIALIST) {
            throw new ForbiddenException("Only specialists can view their slots.");
        }
        Specialist specialist = specialistRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found."));

        List<Slot> slots;
        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                Slot.Status status = Slot.Status.valueOf(statusFilter.toUpperCase());
                slots = slotRepository.findBySpecialistAndStatus(specialist, status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter value.");
            }
        } else {
            slots = slotRepository.findBySpecialist(specialist);
        }
        return slots.stream().map(this::toSlotResponse).collect(Collectors.toList());
    }

    public SlotResponse markUnavailable(Long slotId) {
        User currentUser = authService.getCurrentUser();
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found."));
        checkSlotOwnership(slot, currentUser);
        if (bookingSlotRepository.hasActiveBooking(slotId)) {
            throw new ConflictException("Cannot mark slot unavailable: it has an active booking.");
        }
        slot.setStatus(Slot.Status.UNAVAILABLE);
        slot = slotRepository.save(slot);
        return toSlotResponse(slot);
    }

    public SlotResponse markAvailable(Long slotId) {
        User currentUser = authService.getCurrentUser();
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found."));
        checkSlotOwnership(slot, currentUser);
        slot.setStatus(Slot.Status.AVAILABLE);
        slot = slotRepository.save(slot);
        return toSlotResponse(slot);
    }

    public void deleteSlot(Long slotId) {
        User currentUser = authService.getCurrentUser();
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found."));
        checkSlotOwnership(slot, currentUser);
        if (bookingSlotRepository.hasActiveBooking(slotId)) {
            throw new ConflictException("Cannot delete slot: it has an active booking.");
        }
        slotRepository.delete(slot);
    }

    private void checkSlotOwnership(Slot slot, User currentUser) {
        if (!slot.getSpecialist().getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not own this slot.");
        }
    }

    private SlotResponse toSlotResponse(Slot slot) {
        List<BookingSlot> bookingSlots = bookingSlotRepository.findBySlot(slot);
        BookingSlot activeBookingSlot = bookingSlots.stream()
                .filter(bs -> bs.getBooking().getStatus() == Booking.Status.PENDING
                        || bs.getBooking().getStatus() == Booking.Status.CONFIRMED)
                .findFirst().orElse(null);
        String bookingStatus = activeBookingSlot != null ? activeBookingSlot.getBooking().getStatus().name() : null;
        String customerName = activeBookingSlot != null ? activeBookingSlot.getBooking().getCustomer().getName() : null;
        return new SlotResponse(slot.getId(), slot.getSlotDate(), slot.getStartTime(), slot.getEndTime(),
                slot.getStatus().name(), bookingStatus, customerName);
    }
}
