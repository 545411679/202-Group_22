package com.grooming.pet.dto.response;

import java.time.LocalDateTime;

public class AnnouncementResponse {
    private Long announcementId;
    private String title;
    private String body;
    private LocalDateTime createdAt;

    public AnnouncementResponse(Long announcementId, String title, String body, LocalDateTime createdAt) {
        this.announcementId = announcementId;
        this.title = title;
        this.body = body;
        this.createdAt = createdAt;
    }

    public Long getAnnouncementId() { return announcementId; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
