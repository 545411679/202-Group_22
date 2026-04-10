package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AnnouncementRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String body;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
