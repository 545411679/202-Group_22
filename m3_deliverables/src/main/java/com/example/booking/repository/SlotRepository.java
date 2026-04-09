package com.example.booking.repository;

import com.example.booking.entity.Slot;
import com.example.booking.enums.SlotStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findBySpecialist_IdOrderBySlotDateAscStartTimeAsc(Long specialistId);

    List<Slot> findBySpecialist_IdAndSlotDateOrderByStartTimeAsc(Long specialistId, LocalDate slotDate);

    List<Slot> findBySpecialist_IdAndSlotDateAndStatusOrderByStartTimeAsc(
            Long specialistId,
            LocalDate slotDate,
            SlotStatus status
    );

    @Query("""
            SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
            FROM Slot s
            WHERE s.specialist.id = :specialistId
              AND s.slotDate = :slotDate
              AND s.startTime < :endTime
              AND s.endTime > :startTime
            """)
    boolean existsOverlappingSlot(
            @Param("specialistId") Long specialistId,
            @Param("slotDate") LocalDate slotDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}
