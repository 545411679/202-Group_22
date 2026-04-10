package com.grooming.pet.repository;

import com.grooming.pet.model.Slot;
import com.grooming.pet.model.Specialist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findBySpecialist(Specialist specialist);
    List<Slot> findBySpecialistAndStatus(Specialist specialist, Slot.Status status);
    List<Slot> findBySpecialistAndSlotDate(Specialist specialist, LocalDate date);

    @Query("SELECT COUNT(s) > 0 FROM Slot s WHERE s.specialist = :specialist " +
           "AND s.slotDate = :date AND s.id <> :excludeId " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    boolean existsOverlap(@Param("specialist") Specialist specialist,
                          @Param("date") LocalDate date,
                          @Param("startTime") LocalTime startTime,
                          @Param("endTime") LocalTime endTime,
                          @Param("excludeId") Long excludeId);
}
