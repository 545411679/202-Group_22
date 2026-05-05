package com.grooming.pet.service;

import com.grooming.pet.dto.request.*;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final SlotRepository slotRepository;
    private final SpecialistRepository specialistRepository;
    private final ActivityLogService activityLogService;
    private final AuthService authService;

    public BookingService(BookingRepository bookingRepository,
                          BookingSlotRepository bookingSlotRepository,
                          SlotRepository slotRepository,
                          SpecialistRepository specialistRepository,
                          ActivityLogService activityLogService,
                          AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.bookingSlotRepository = bookingSlotRepository;
        this.slotRepository = slotRepository;
        this.specialistRepository = specialistRepository;
        this.activityLogService = activityLogService;
        this.authService = authService;
    }

    public BookingCreateResponse createBooking(BookingCreateRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.CLIENT) {
            throw new ForbiddenException("Only clients can create bookings.");
        }

        List<Slot> slots = req.getSlotIds().stream().map(id -> {
            Slot slot = slotRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Slot not found: " + id));
            if (slot.getStatus() != Slot.Status.AVAILABLE) {
                throw new ConflictException("Slot " + id + " is not available.");
            }
            if (bookingSlotRepository.hasActiveBooking(id)) {
                throw new ConflictException("Slot " + id + " already has an active booking.");
            }
            return slot;
        }).collect(Collectors.toList());

        Specialist specialist = slots.get(0).getSpecialist();
        for (Slot slot : slots) {
            if (!slot.getSpecialist().getId().equals(specialist.getId())) {
                throw new BadRequestException("All slots must belong to the same specialist.");
            }
        }

        Booking booking = new Booking();
        booking.setCustomer(currentUser);
        booking.setSpecialist(specialist);
        booking.setContact(req.getContact());
        booking.setTopic(req.getTopic());
        booking.setNotes(req.getNotes());
        booking.setTotalFee(calculateTotalFee(specialist.getPriceAmount(), slots));
        booking.setStatus(Booking.Status.PENDING);
        booking = bookingRepository.save(booking);

        for (Slot slot : slots) {
            BookingSlot bookingSlot = new BookingSlot(booking, slot);
            bookingSlotRepository.save(bookingSlot);
            slot.setStatus(Slot.Status.UNAVAILABLE);
            slotRepository.save(slot);
        }

        return new BookingCreateResponse(booking.getId(), booking.getStatus().name(), booking.getTotalFee());
    }

    public BookingStatusResponse updateStatus(Long bookingId, BookingStatusRequest req) {
        User currentUser = authService.getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        String action = req.getAction().toUpperCase();
        Booking.Status currentStatus = booking.getStatus();

        switch (action) {
            case "CONFIRM":
                if (currentStatus != Booking.Status.PENDING) {
                    throw new BadRequestException("Only PENDING bookings can be confirmed.");
                }
                if (currentUser.getRole() != User.Role.SPECIALIST
                        || !currentUser.getId().equals(booking.getSpecialist().getUser().getId())) {
                    throw new ForbiddenException("Only the booking's specialist can confirm.");
                }
                booking.setStatus(Booking.Status.CONFIRMED);
                if (req.getMeetingType() != null) booking.setMeetingType(req.getMeetingType());
                if (req.getMeetingInfo() != null) booking.setMeetingInfo(req.getMeetingInfo());
                break;

            case "REJECT":
                if (currentStatus != Booking.Status.PENDING) {
                    throw new BadRequestException("Only PENDING bookings can be rejected.");
                }
                if (currentUser.getRole() != User.Role.SPECIALIST
                        || !currentUser.getId().equals(booking.getSpecialist().getUser().getId())) {
                    throw new ForbiddenException("Only the booking's specialist can reject.");
                }
                booking.setStatus(Booking.Status.REJECTED);
                restoreSlots(booking);
                break;

            case "CANCEL":
                if (currentStatus != Booking.Status.PENDING && currentStatus != Booking.Status.CONFIRMED) {
                    throw new BadRequestException("Only PENDING or CONFIRMED bookings can be cancelled.");
                }
                boolean isCustomer = currentUser.getRole() == User.Role.CLIENT
                        && currentUser.getId().equals(booking.getCustomer().getId());
                boolean isSpecialistOwner = currentUser.getRole() == User.Role.SPECIALIST
                        && currentUser.getId().equals(booking.getSpecialist().getUser().getId());
                if (!isCustomer && !isSpecialistOwner) {
                    throw new ForbiddenException("Only the customer or the specialist can cancel this booking.");
                }
                LocalDateTime earliestStart = earliestSlotStart(booking);
                if (earliestStart != null && earliestStart.isBefore(LocalDateTime.now().plusHours(24))) {
                    throw new BadRequestException("Cancellation is not allowed within 24 hours of the session start.");
                }
                booking.setStatus(Booking.Status.CANCELLED);
                restoreSlots(booking);
                break;

            case "CONDUCT":
                if (currentStatus != Booking.Status.CONFIRMED) {
                    throw new BadRequestException("Only CONFIRMED bookings can be marked as conducted.");
                }
                if (currentUser.getRole() != User.Role.SPECIALIST
                        || !currentUser.getId().equals(booking.getSpecialist().getUser().getId())) {
                    throw new ForbiddenException("Only the booking's specialist can mark as conducted.");
                }
                booking.setStatus(Booking.Status.CONDUCTED);
                break;

            default:
                throw new BadRequestException("Invalid action. Allowed: CONFIRM, REJECT, CANCEL, CONDUCT.");
        }

        booking = bookingRepository.save(booking);
        return new BookingStatusResponse(booking.getId(), booking.getStatus().name());
    }

    public List<SpecialistBookingResponse> getSpecialistBookings(String statusFilter) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.SPECIALIST) {
            throw new ForbiddenException("Only specialists can view their bookings.");
        }
        Specialist specialist = specialistRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found."));

        List<Booking> bookings;
        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                Booking.Status status = Booking.Status.valueOf(statusFilter.toUpperCase());
                bookings = bookingRepository.findBySpecialistAndStatus(specialist, status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter.");
            }
        } else {
            bookings = bookingRepository.findBySpecialistOrderByCreatedAtDesc(specialist);
        }

        return bookings.stream().map(booking -> {
            BookingSlot firstBookingSlot = bookingSlotRepository.findByBooking(booking)
                    .stream().findFirst().orElse(null);
            java.time.LocalDate slotDate = firstBookingSlot != null ? firstBookingSlot.getSlot().getSlotDate() : null;
            java.time.LocalTime startTime = firstBookingSlot != null ? firstBookingSlot.getSlot().getStartTime() : null;
            java.time.LocalTime endTime = firstBookingSlot != null ? firstBookingSlot.getSlot().getEndTime() : null;
            return new SpecialistBookingResponse(
                    booking.getId(), booking.getCustomer().getName(),
                    booking.getContact(), booking.getTopic(), booking.getNotes(),
                    slotDate, startTime, endTime,
                    booking.getTotalFee(), booking.getStatus().name(),
                    booking.getMeetingType(), booking.getMeetingInfo());
        }).collect(Collectors.toList());
    }

    public ScheduleResponse getSchedule(Long specialistId) {
        Specialist specialist = specialistRepository.findById(specialistId)
                .orElseThrow(() -> new ResourceNotFoundException("Specialist not found."));
        List<Slot> slots = slotRepository.findBySpecialist(specialist);
        List<SlotResponse> slotResponses = slots.stream().map(slot -> {
            List<BookingSlot> bookingSlots = bookingSlotRepository.findBySlot(slot);
            BookingSlot activeBookingSlot = bookingSlots.stream()
                    .filter(bs -> bs.getBooking().getStatus() == Booking.Status.PENDING
                            || bs.getBooking().getStatus() == Booking.Status.CONFIRMED)
                    .findFirst().orElse(null);
            String bookingStatus = activeBookingSlot != null ? activeBookingSlot.getBooking().getStatus().name() : null;
            String customerName = activeBookingSlot != null ? activeBookingSlot.getBooking().getCustomer().getName() : null;
            return new SlotResponse(slot.getId(), slot.getSlotDate(), slot.getStartTime(), slot.getEndTime(),
                    slot.getStatus().name(), bookingStatus, customerName);
        }).collect(Collectors.toList());
        return new ScheduleResponse(specialist.getId(), specialist.getPriceAmount(), slotResponses);
    }

    private void restoreSlots(Booking booking) {
        List<BookingSlot> bookingSlots = bookingSlotRepository.findByBooking(booking);
        for (BookingSlot bs : bookingSlots) {
            Slot slot = bs.getSlot();
            slot.setStatus(Slot.Status.AVAILABLE);
            slotRepository.save(slot);
        }
    }

    private LocalDateTime earliestSlotStart(Booking booking) {
        return bookingSlotRepository.findByBooking(booking).stream()
                .map(bs -> LocalDateTime.of(bs.getSlot().getSlotDate(), bs.getSlot().getStartTime()))
                .min(LocalDateTime::compareTo)
                .orElse(null);
    }

    private BigDecimal calculateTotalFee(BigDecimal hourlyRate, List<Slot> slots) {
        if (hourlyRate == null) return BigDecimal.ZERO;
        long totalMinutes = 0;
        for (Slot slot : slots) {
            LocalDateTime start = LocalDateTime.of(slot.getSlotDate(), slot.getStartTime());
            LocalDateTime end   = LocalDateTime.of(slot.getSlotDate(), slot.getEndTime());
            totalMinutes += Duration.between(start, end).toMinutes();
        }
        BigDecimal hours = BigDecimal.valueOf(totalMinutes)
                .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        return hourlyRate.multiply(hours).setScale(2, RoundingMode.HALF_UP);
    }
}
