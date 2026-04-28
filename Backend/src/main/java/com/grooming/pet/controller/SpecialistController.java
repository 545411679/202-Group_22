package com.grooming.pet.controller;

import com.grooming.pet.dto.request.*;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/specialists")
public class SpecialistController {
    private final SpecialistService specialistService;
    private final SlotService slotService;
    private final BookingService bookingService;

    public SpecialistController(SpecialistService specialistService,
                                SlotService slotService,
                                BookingService bookingService) {
        this.specialistService = specialistService;
        this.slotService = slotService;
        this.bookingService = bookingService;
    }

    @PostMapping("/profile")
    public ResponseEntity<SpecialistProfileResponse> createProfile(@Valid @RequestBody SpecialistProfileRequest req) {
        return ResponseEntity.status(201).body(specialistService.createProfile(req));
    }

    @PatchMapping("/profile")
    public ResponseEntity<SpecialistProfileResponse> updateProfile(@Valid @RequestBody SpecialistProfileRequest req) {
        return ResponseEntity.ok(specialistService.updateProfile(req));
    }

    @PatchMapping("/profile/status")
    public ResponseEntity<SpecialistProfileResponse> updateStatus(@Valid @RequestBody SpecialistStatusRequest req) {
        return ResponseEntity.ok(specialistService.updateStatus(req));
    }

    @GetMapping("/profile")
    public ResponseEntity<SpecialistProfileResponse> getOwnProfile() {
        return ResponseEntity.ok(specialistService.getOwnProfile());
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<SpecialistProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(specialistService.getProfile(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SpecialistSummaryResponse>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) LocalDate slotDate,
            @RequestParam(required = false) LocalTime startTime,
            @RequestParam(required = false) LocalTime endTime) {
        return ResponseEntity.ok(specialistService.search(name, category, level, slotDate, startTime, endTime));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<ScheduleResponse> getSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getSchedule(id));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<SlotResponse>> getMySlots(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(slotService.getMySlots(status));
    }

    @PostMapping("/slots")
    public ResponseEntity<SlotResponse> createSlot(@Valid @RequestBody SlotCreateRequest req) {
        return ResponseEntity.status(201).body(slotService.createSlot(req));
    }

    @PatchMapping("/slots/{id}/unavailable")
    public ResponseEntity<SlotResponse> markUnavailable(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.markUnavailable(id));
    }

    @PatchMapping("/slots/{id}/available")
    public ResponseEntity<SlotResponse> markAvailable(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.markAvailable(id));
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<SpecialistBookingResponse>> getSpecialistBookings(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getSpecialistBookings(status));
    }
}
