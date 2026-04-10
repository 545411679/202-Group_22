package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;

public class BookingStatusRequest {
    @NotBlank
    private String action;

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
