package com.grooming.pet.service;

import com.grooming.pet.dto.request.SlotCreateRequest;
import com.grooming.pet.dto.response.SlotResponse;
import com.grooming.pet.exception.BadRequestException;
import com.grooming.pet.exception.ConflictException;
import com.grooming.pet.exception.ForbiddenException;
import com.grooming.pet.model.Slot;
import com.grooming.pet.model.Specialist;
import com.grooming.pet.model.User;
import com.grooming.pet.repository.BookingSlotRepository;
import com.grooming.pet.repository.SlotRepository;
import com.grooming.pet.repository.SpecialistRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class SlotServiceTest {

    @Mock private SlotRepository slotRepository;
    @Mock private SpecialistRepository specialistRepository;
    @Mock private BookingSlotRepository bookingSlotRepository;
    @Mock private AuthService authService;

    @InjectMocks private SlotService slotService;

    @Test
    @DisplayName("createSlot rejects non-specialist users")
    void createSlotRejectsNonSpecialist() {
        when(authService.getCurrentUser()).thenReturn(user(1L, User.Role.CLIENT));

        assertThatThrownBy(() -> slotService.createSlot(validSlotRequest()))
                .isInstanceOf(ForbiddenException.class);
        verify(slotRepository, never()).save(any());
    }

    @Test
    @DisplayName("createSlot rejects same-day dates")
    void createSlotRejectsNonFutureDate() {
        User specialistUser = user(2L, User.Role.SPECIALIST);
        when(authService.getCurrentUser()).thenReturn(specialistUser);
        when(specialistRepository.findByUser(specialistUser)).thenReturn(Optional.of(specialist(specialistUser)));

        SlotCreateRequest req = validSlotRequest();
        req.setSlotDate(LocalDate.now());

        assertThatThrownBy(() -> slotService.createSlot(req))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("createSlot rejects overlapping slots")
    void createSlotRejectsOverlap() {
        User specialistUser = user(2L, User.Role.SPECIALIST);
        Specialist specialist = specialist(specialistUser);
        SlotCreateRequest req = validSlotRequest();
        when(authService.getCurrentUser()).thenReturn(specialistUser);
        when(specialistRepository.findByUser(specialistUser)).thenReturn(Optional.of(specialist));
        when(slotRepository.existsOverlap(specialist, req.getSlotDate(), req.getStartTime(), req.getEndTime(), 0L))
                .thenReturn(true);

        assertThatThrownBy(() -> slotService.createSlot(req))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("createSlot saves an available slot")
    void createSlotSavesAvailableSlot() {
        User specialistUser = user(2L, User.Role.SPECIALIST);
        Specialist specialist = specialist(specialistUser);
        SlotCreateRequest req = validSlotRequest();
        when(authService.getCurrentUser()).thenReturn(specialistUser);
        when(specialistRepository.findByUser(specialistUser)).thenReturn(Optional.of(specialist));
        when(slotRepository.existsOverlap(specialist, req.getSlotDate(), req.getStartTime(), req.getEndTime(), 0L))
                .thenReturn(false);
        when(slotRepository.save(any(Slot.class))).thenAnswer(invocation -> {
            Slot slot = invocation.getArgument(0);
            slot.setId(10L);
            return slot;
        });
        when(bookingSlotRepository.findBySlot(any(Slot.class))).thenReturn(List.of());

        SlotResponse response = slotService.createSlot(req);

        assertThat(response.getSlotId()).isEqualTo(10L);
        assertThat(response.getStatus()).isEqualTo("AVAILABLE");
    }

    @Test
    @DisplayName("deleteSlot rejects slots with active bookings")
    void deleteSlotRejectsActiveBooking() {
        User owner = user(2L, User.Role.SPECIALIST);
        Slot slot = slot(20L, specialist(owner));
        when(authService.getCurrentUser()).thenReturn(owner);
        when(slotRepository.findById(20L)).thenReturn(Optional.of(slot));
        when(bookingSlotRepository.hasActiveBooking(20L)).thenReturn(true);

        assertThatThrownBy(() -> slotService.deleteSlot(20L))
                .isInstanceOf(ConflictException.class);
        verify(slotRepository, never()).delete(any());
    }

    @Test
    @DisplayName("markUnavailable rejects non-owner specialists")
    void markUnavailableRejectsNonOwner() {
        User owner = user(2L, User.Role.SPECIALIST);
        User other = user(3L, User.Role.SPECIALIST);
        Slot slot = slot(20L, specialist(owner));
        when(authService.getCurrentUser()).thenReturn(other);
        when(slotRepository.findById(20L)).thenReturn(Optional.of(slot));

        assertThatThrownBy(() -> slotService.markUnavailable(20L))
                .isInstanceOf(ForbiddenException.class);
    }

    private static SlotCreateRequest validSlotRequest() {
        SlotCreateRequest req = new SlotCreateRequest();
        req.setSlotDate(LocalDate.now().plusDays(2));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(10, 0));
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
}
