package com.grooming.pet.repository;

import com.grooming.pet.model.Specialist;
import com.grooming.pet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SpecialistRepository extends JpaRepository<Specialist, Long> {
    Optional<Specialist> findByUser(User user);
    List<Specialist> findByStatus(Specialist.Status status);
    boolean existsBySpecialty(String specialty);
    boolean existsByNameAndSpecialty(String name, String specialty);

    @Query("SELECT s FROM Specialist s WHERE s.status = 'ACTIVE' " +
           "AND (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:category IS NULL OR s.specialty = :category) " +
           "AND (:level IS NULL OR s.qualificationLevel = :level)")
    List<Specialist> search(@Param("name") String name,
                            @Param("category") String category,
                            @Param("level") String level);
}
