package com.grooming.pet.service;

import com.grooming.pet.dto.request.ReviewSubmitRequest;
import com.grooming.pet.dto.response.ReviewResponse;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         AuthService authService) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.authService = authService;
    }

    public ReviewResponse submitReview(Long bookingId, ReviewSubmitRequest req) {
        User currentUser = authService.getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        if (!booking.getCustomer().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only review your own bookings.");
        }
        if (booking.getStatus() != Booking.Status.CONDUCTED) {
            throw new BadRequestException("Only conducted bookings can be reviewed.");
        }
        if (reviewRepository.existsByBooking(booking)) {
            throw new ConflictException("This booking has already been reviewed.");
        }
        Review review = new Review();
        review.setBooking(booking);
        review.setCustomer(currentUser);
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        review.setSpecialistName(booking.getSpecialist().getName());
        review.setSpecialty(booking.getSpecialist().getSpecialty());
        review.setVisible(true);
        review = reviewRepository.save(review);

        booking.setStatus(Booking.Status.REVIEWED);
        bookingRepository.save(booking);

        return toResponse(review);
    }

    /** Public endpoint — only visible reviews, max 6 */
    public List<ReviewResponse> getRecentReviews() {
        return reviewRepository.findTop6ByVisibleTrueOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Admin: list all reviews */
    public List<ReviewResponse> getAllReviews() {
        User admin = authService.getCurrentUser();
        if (admin.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin only.");
        }
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Admin: toggle visibility */
    public ReviewResponse setVisibility(Long reviewId, boolean visible) {
        User admin = authService.getCurrentUser();
        if (admin.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin only.");
        }
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found."));
        review.setVisible(visible);
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(), r.getBooking().getId(),
                r.getCustomer().getName(),
                r.getSpecialistName(), r.getSpecialty(),
                r.getRating(), r.getComment(),
                r.isVisible(), r.getCreatedAt());
    }
}
