package com.grooming.pet.service;

import com.grooming.pet.dto.response.*;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {
    private final BookingRepository bookingRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final AuthService authService;

    public DashboardService(BookingRepository bookingRepository,
                            BookingSlotRepository bookingSlotRepository,
                            AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.bookingSlotRepository = bookingSlotRepository;
        this.authService = authService;
    }

    public DashboardResponse getAppointments(String statusFilter, String sortBy, String order) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.CLIENT) {
            throw new ForbiddenException("Only clients can access the dashboard.");
        }

        List<Booking> bookings;
        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                Booking.Status status = Booking.Status.valueOf(statusFilter.toUpperCase());
                bookings = bookingRepository.findByCustomerAndStatus(currentUser, status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter.");
            }
        } else {
            bookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(currentUser);
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in24h = now.plusHours(24);

        List<AppointmentSummaryResponse> allAppointments = bookings.stream()
                .map(booking -> toSummaryResponse(booking))
                .collect(Collectors.toList());

        List<AppointmentSummaryResponse> upcoming = bookings.stream()
                .filter(b -> b.getStatus() == Booking.Status.CONFIRMED)
                .filter(b -> {
                    BookingSlot firstSlot = bookingSlotRepository.findByBooking(b).stream().findFirst().orElse(null);
                    if (firstSlot == null) return false;
                    LocalDateTime slotDateTime = LocalDateTime.of(
                            firstSlot.getSlot().getSlotDate(), firstSlot.getSlot().getStartTime());
                    return !slotDateTime.isBefore(now) && !slotDateTime.isAfter(in24h);
                })
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        // Sorting
        Comparator<AppointmentSummaryResponse> comparator = Comparator.comparing(
                AppointmentSummaryResponse::getBookingId);
        if ("slotDate".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(r -> r.getSlotDate() != null ? r.getSlotDate() : LocalDate.MIN);
        } else if ("fee".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(r -> r.getFee() != null ? r.getFee() : java.math.BigDecimal.ZERO);
        }
        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        allAppointments.sort(comparator);

        return new DashboardResponse(upcoming, allAppointments);
    }

    public AppointmentDetailResponse getAppointmentDetail(Long bookingId) {
        User currentUser = authService.getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        if (!booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have access to this booking.");
        }

        BookingSlot firstBookingSlot = bookingSlotRepository.findByBooking(booking)
                .stream().findFirst().orElse(null);
        LocalDate slotDate = firstBookingSlot != null ? firstBookingSlot.getSlot().getSlotDate() : null;
        LocalTime startTime = firstBookingSlot != null ? firstBookingSlot.getSlot().getStartTime() : null;
        LocalTime endTime = firstBookingSlot != null ? firstBookingSlot.getSlot().getEndTime() : null;

        return new AppointmentDetailResponse(
                booking.getId(),
                booking.getSpecialist().getName(),
                booking.getSpecialist().getSpecialty(),
                slotDate, startTime, endTime,
                booking.getTotalFee(),
                booking.getStatus().name(),
                booking.getContact(),
                booking.getTopic(),
                booking.getNotes());
    }

    private AppointmentSummaryResponse toSummaryResponse(Booking booking) {
        BookingSlot firstBookingSlot = bookingSlotRepository.findByBooking(booking)
                .stream().findFirst().orElse(null);
        LocalDate slotDate = firstBookingSlot != null ? firstBookingSlot.getSlot().getSlotDate() : null;
        LocalTime startTime = firstBookingSlot != null ? firstBookingSlot.getSlot().getStartTime() : null;
        LocalTime endTime = firstBookingSlot != null ? firstBookingSlot.getSlot().getEndTime() : null;
        return new AppointmentSummaryResponse(
                booking.getId(),
                booking.getSpecialist().getName(),
                slotDate, startTime, endTime,
                booking.getTotalFee(),
                booking.getStatus().name());
    }
}
