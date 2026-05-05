package com.grooming.pet.dto.response;

import java.time.LocalDateTime;

public class AnnouncementResponse {
    private Long announcementId;
    private String title;
    private String body;
    private String imageUrl;
    private String audience;
    private Boolean published;
    private Boolean unread;
    private LocalDateTime createdAt;

    public AnnouncementResponse(Long announcementId, String title, String body,
                                String imageUrl, String audience, Boolean published,
                                Boolean unread, LocalDateTime createdAt) {
        this.announcementId = announcementId;
        this.title = title;
        this.body = body;
        this.imageUrl = imageUrl;
        this.audience = audience;
        this.published = published;
        this.unread = unread;
        this.createdAt = createdAt;
    }

    public Long getAnnouncementId() { return announcementId; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getImageUrl() { return imageUrl; }
    public String getAudience() { return audience; }
    public Boolean getPublished() { return published; }
    public Boolean getUnread() { return unread; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
