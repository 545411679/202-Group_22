package com.grooming.pet.repository;

import com.grooming.pet.model.Booking;
import com.grooming.pet.model.BookingSlot;
import com.grooming.pet.model.BookingSlotId;
import com.grooming.pet.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookingSlotRepository extends JpaRepository<BookingSlot, BookingSlotId> {
    List<BookingSlot> findByBooking(Booking booking);
    List<BookingSlot> findBySlot(Slot slot);

    @Query("SELECT COUNT(bs) > 0 FROM BookingSlot bs WHERE bs.slot.id = :slotId " +
           "AND bs.booking.status IN ('PENDING','CONFIRMED')")
    boolean hasActiveBooking(@Param("slotId") Long slotId);
}
