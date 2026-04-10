package com.grooming.pet.dto.response;

import java.time.LocalDateTime;

public class AdminUserResponse {
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    public AdminUserResponse(Long userId, String name, String email, String role,
                             String status, LocalDateTime createdAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
