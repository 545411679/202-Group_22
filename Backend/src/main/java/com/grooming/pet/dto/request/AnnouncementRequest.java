package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AnnouncementRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String body;

    private String imageUrl;
    private String audience;
    private Boolean published;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }
    public Boolean getPublished() { return published; }
    public void setPublished(Boolean published) { this.published = published; }
}
