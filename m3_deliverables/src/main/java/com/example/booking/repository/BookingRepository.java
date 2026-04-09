package com.example.booking.repository;

import com.example.booking.entity.Booking;
import com.example.booking.enums.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findByCustomer_IdAndStatusOrderByCreatedAtDesc(Long customerId, BookingStatus status);

    List<Booking> findBySpecialist_IdOrderByCreatedAtDesc(Long specialistId);

    List<Booking> findBySpecialist_IdAndStatusOrderByCreatedAtDesc(Long specialistId, BookingStatus status);
}
