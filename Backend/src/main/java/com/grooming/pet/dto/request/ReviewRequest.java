package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ReviewRequest {
    @NotBlank
    private String action;

    private String reason;

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
