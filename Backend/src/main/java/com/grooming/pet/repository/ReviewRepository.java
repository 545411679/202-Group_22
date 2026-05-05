package com.grooming.pet.repository;

import com.grooming.pet.model.Booking;
import com.grooming.pet.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBooking(Booking booking);
    boolean existsByBooking(Booking booking);
    List<Review> findTop6ByVisibleTrueOrderByCreatedAtDesc();
    List<Review> findAllByOrderByCreatedAtDesc();
}
