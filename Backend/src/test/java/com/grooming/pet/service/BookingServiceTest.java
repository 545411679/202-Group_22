package com.grooming.pet.service;

import com.grooming.pet.dto.request.BookingCreateRequest;
import com.grooming.pet.dto.request.BookingStatusRequest;
import com.grooming.pet.dto.response.BookingCreateResponse;
import com.grooming.pet.dto.response.BookingStatusResponse;
import com.grooming.pet.exception.BadRequestException;
import com.grooming.pet.exception.ConflictException;
import com.grooming.pet.exception.ForbiddenException;
import com.grooming.pet.model.Booking;
import com.grooming.pet.model.BookingSlot;
import com.grooming.pet.model.Slot;
import com.grooming.pet.model.Specialist;
import com.grooming.pet.model.User;
import com.grooming.pet.repository.BookingRepository;
import com.grooming.pet.repository.BookingSlotRepository;
import com.grooming.pet.repository.SlotRepository;
import com.grooming.pet.repository.SpecialistRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private BookingSlotRepository bookingSlotRepository;
    @Mock private SlotRepository slotRepository;
    @Mock private SpecialistRepository specialistRepository;
    @Mock private ActivityLogService activityLogService;
    @Mock private AuthService authService;

    @InjectMocks private BookingService bookingService;

    @Test
    @DisplayName("createBooking rejects non-client users")
    void createBookingRejectsNonClient() {
        when(authService.getCurrentUser()).thenReturn(user(1L, User.Role.SPECIALIST));

        assertThatThrownBy(() -> bookingService.createBooking(createRequest(List.of(10L))))
                .isInstanceOf(ForbiddenException.class);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("createBooking rejects unavailable slots")
    void createBookingRejectsUnavailableSlot() {
        User client = user(1L, User.Role.CLIENT);
        Slot slot = slot(10L, specialist(user(2L, User.Role.SPECIALIST)));
        slot.setStatus(Slot.Status.UNAVAILABLE);
        when(authService.getCurrentUser()).thenReturn(client);
        when(slotRepository.findById(10L)).thenReturn(Optional.of(slot));

        assertThatThrownBy(() -> bookingService.createBooking(createRequest(List.of(10L))))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("createBooking requires all slots to belong to the same specialist")
    void createBookingRejectsMixedSpecialists() {
        User client = user(1L, User.Role.CLIENT);
        Slot first = slot(10L, specialist(user(2L, User.Role.SPECIALIST)));
        Slot second = slot(11L, specialist(user(3L, User.Role.SPECIALIST)));
        when(authService.getCurrentUser()).thenReturn(client);
        when(slotRepository.findById(10L)).thenReturn(Optional.of(first));
        when(slotRepository.findById(11L)).thenReturn(Optional.of(second));
        when(bookingSlotRepository.hasActiveBooking(any(Long.class))).thenReturn(false);

        assertThatThrownBy(() -> bookingService.createBooking(createRequest(List.of(10L, 11L))))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("createBooking saves pending booking and marks slots unavailable")
    void createBookingSavesPendingBooking() {
        User client = user(1L, User.Role.CLIENT);
        Specialist specialist = specialist(user(2L, User.Role.SPECIALIST));
        Slot slot = slot(10L, specialist);
        when(authService.getCurrentUser()).thenReturn(client);
        when(slotRepository.findById(10L)).thenReturn(Optional.of(slot));
        when(bookingSlotRepository.hasActiveBooking(10L)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(100L);
            return booking;
        });

        BookingCreateResponse response = bookingService.createBooking(createRequest(List.of(10L)));

        assertThat(response.getBookingId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getFee()).isEqualByComparingTo("200.00");
        assertThat(slot.getStatus()).isEqualTo(Slot.Status.UNAVAILABLE);
        verify(bookingSlotRepository).save(any(BookingSlot.class));
        verify(slotRepository).save(slot);
    }

    @Test
    @DisplayName("updateStatus lets owning specialist confirm pending booking")
    void updateStatusConfirmsByOwningSpecialist() {
        User specialistUser = user(2L, User.Role.SPECIALIST);
        Booking booking = booking(100L, user(1L, User.Role.CLIENT), specialist(specialistUser), Booking.Status.PENDING);
        when(authService.getCurrentUser()).thenReturn(specialistUser);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingStatusRequest req = new BookingStatusRequest();
        req.setAction("CONFIRM");
        req.setMeetingType("ONLINE");
        req.setMeetingInfo("Zoom room");

        BookingStatusResponse response = bookingService.updateStatus(100L, req);

        assertThat(response.getStatus()).isEqualTo("CONFIRMED");
        assertThat(booking.getMeetingType()).isEqualTo("ONLINE");
        assertThat(booking.getMeetingInfo()).isEqualTo("Zoom room");
    }

    @Test
    @DisplayName("updateStatus rejects specialist who does not own the booking")
    void updateStatusRejectsWrongSpecialist() {
        Booking booking = booking(100L, user(1L, User.Role.CLIENT), specialist(user(2L, User.Role.SPECIALIST)), Booking.Status.PENDING);
        when(authService.getCurrentUser()).thenReturn(user(3L, User.Role.SPECIALIST));
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BookingStatusRequest req = new BookingStatusRequest();
        req.setAction("CONFIRM");

        assertThatThrownBy(() -> bookingService.updateStatus(100L, req))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("cancel restores linked slots to available")
    void cancelRestoresSlots() {
        User client = user(1L, User.Role.CLIENT);
        Specialist specialist = specialist(user(2L, User.Role.SPECIALIST));
        Booking booking = booking(100L, client, specialist, Booking.Status.CONFIRMED);
        Slot slot = slot(10L, specialist);
        slot.setStatus(Slot.Status.UNAVAILABLE);
        when(authService.getCurrentUser()).thenReturn(client);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingSlotRepository.findByBooking(booking)).thenReturn(List.of(new BookingSlot(booking, slot)));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingStatusRequest req = new BookingStatusRequest();
        req.setAction("CANCEL");

        BookingStatusResponse response = bookingService.updateStatus(100L, req);

        assertThat(response.getStatus()).isEqualTo("CANCELLED");
        assertThat(slot.getStatus()).isEqualTo(Slot.Status.AVAILABLE);
        verify(slotRepository).save(slot);
    }

    private static BookingCreateRequest createRequest(List<Long> slotIds) {
        BookingCreateRequest req = new BookingCreateRequest();
        req.setSlotIds(slotIds);
        req.setContact("client@example.com");
        req.setTopic("Consultation");
        req.setNotes("Need advice");
        return req;
    }

    private static User user(Long id, User.Role role) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@example.com");
        user.setName("User " + id);
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        return user;
    }

    private static Specialist specialist(User user) {
        Specialist specialist = new Specialist();
        specialist.setId(user.getId() + 100);
        specialist.setUser(user);
        specialist.setName("Specialist " + user.getId());
        specialist.setSpecialty("General Consultation");
        specialist.setQualificationLevel("Senior");
        specialist.setBio("Bio");
        specialist.setPriceAmount(new BigDecimal("200.00"));
        specialist.setStatus(Specialist.Status.ACTIVE);
        return specialist;
    }

    private static Slot slot(Long id, Specialist specialist) {
        Slot slot = new Slot();
        slot.setId(id);
        slot.setSpecialist(specialist);
        slot.setSlotDate(LocalDate.now().plusDays(2));
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        slot.setStatus(Slot.Status.AVAILABLE);
        return slot;
    }

    private static Booking booking(Long id, User customer, Specialist specialist, Booking.Status status) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setCustomer(customer);
        booking.setSpecialist(specialist);
        booking.setContact(customer.getEmail());
        booking.setTopic("Consultation");
        booking.setTotalFee(specialist.getPriceAmount());
        booking.setStatus(status);
        return booking;
    }
}
