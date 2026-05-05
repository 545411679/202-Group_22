package com.grooming.pet.repository;

import com.grooming.pet.model.AnnouncementRead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead, Long> {
    List<AnnouncementRead> findByUserId(Long userId);
    boolean existsByUserIdAndAnnouncementId(Long userId, Long announcementId);
}
