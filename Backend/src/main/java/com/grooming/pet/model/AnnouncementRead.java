package com.grooming.pet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "announcement_reads",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "announcement_id"})
)
public class AnnouncementRead {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "announcement_id", nullable = false)
    private Long announcementId;

    @CreationTimestamp
    @Column(name = "read_at", updatable = false)
    private LocalDateTime readAt;

    public AnnouncementRead() {}

    public AnnouncementRead(Long userId, Long announcementId) {
        this.userId = userId;
        this.announcementId = announcementId;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getAnnouncementId() { return announcementId; }
    public LocalDateTime getReadAt() { return readAt; }
}
