package com.grooming.pet.repository;

import com.grooming.pet.model.Booking;
import com.grooming.pet.model.Specialist;
import com.grooming.pet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Booking> findBySpecialistOrderByCreatedAtDesc(Specialist specialist);
    List<Booking> findBySpecialistAndStatus(Specialist specialist, Booking.Status status);
    List<Booking> findByCustomerAndStatus(User customer, Booking.Status status);
}
