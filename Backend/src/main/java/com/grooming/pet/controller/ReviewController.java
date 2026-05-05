package com.grooming.pet.controller;

import com.grooming.pet.dto.request.ReviewSubmitRequest;
import com.grooming.pet.dto.response.ReviewResponse;
import com.grooming.pet.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /** Customer submits a review for a conducted booking */
    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<ReviewResponse> submitReview(@PathVariable Long bookingId,
                                                        @Valid @RequestBody ReviewSubmitRequest req) {
        return ResponseEntity.status(201).body(reviewService.submitReview(bookingId, req));
    }

    /** Public: recent visible reviews for landing page */
    @GetMapping("/recent")
    public ResponseEntity<List<ReviewResponse>> getRecentReviews() {
        return ResponseEntity.ok(reviewService.getRecentReviews());
    }

    /** Admin: all reviews */
    @GetMapping("/admin/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    /** Admin: set visibility of a review */
    @PatchMapping("/admin/{id}/visibility")
    public ResponseEntity<ReviewResponse> setVisibility(@PathVariable Long id,
                                                         @RequestBody Map<String, Boolean> body) {
        boolean visible = Boolean.TRUE.equals(body.get("visible"));
        return ResponseEntity.ok(reviewService.setVisibility(id, visible));
    }
}
