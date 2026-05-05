package com.grooming.pet.dto.response;

public class LoginResponse {
    private String token;
    private String role;
    private Long userId;
    private Long specialistId;
    private String name;

    public LoginResponse(String token, String role, Long userId, Long specialistId, String name) {
        this.token = token;
        this.role = role;
        this.userId = userId;
        this.specialistId = specialistId;
        this.name = name;
    }

    public String getToken() { return token; }
    public String getRole() { return role; }
    public Long getUserId() { return userId; }
    public Long getSpecialistId() { return specialistId; }
    public String getName() { return name; }
}
