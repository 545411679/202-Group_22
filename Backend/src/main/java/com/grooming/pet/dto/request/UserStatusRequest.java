package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UserStatusRequest {
    @NotBlank
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
