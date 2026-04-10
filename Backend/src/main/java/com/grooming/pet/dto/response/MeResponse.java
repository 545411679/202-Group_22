package com.grooming.pet.dto.response;

public class MeResponse {
    private Long userId;
    private String email;
    private String name;
    private String role;

    public MeResponse(Long userId, String email, String name, String role) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getRole() { return role; }
}
