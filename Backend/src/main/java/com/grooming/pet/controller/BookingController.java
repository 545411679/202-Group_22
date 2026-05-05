package com.grooming.pet.controller;

import com.grooming.pet.dto.request.*;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingCreateResponse> createBooking(@Valid @RequestBody BookingCreateRequest req) {
        return ResponseEntity.status(201).body(bookingService.createBooking(req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingStatusResponse> updateStatus(@PathVariable Long id,
                                                              @Valid @RequestBody BookingStatusRequest req) {
        return ResponseEntity.ok(bookingService.updateStatus(id, req));
    }
}
