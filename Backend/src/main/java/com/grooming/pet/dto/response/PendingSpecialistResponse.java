package com.grooming.pet.dto.response;

import java.time.LocalDateTime;

public class PendingSpecialistResponse {
    private Long specialistId;
    private String name;
    private String specialty;
    private LocalDateTime submittedAt;

    public PendingSpecialistResponse(Long specialistId, String name, String specialty, LocalDateTime submittedAt) {
        this.specialistId = specialistId;
        this.name = name;
        this.specialty = specialty;
        this.submittedAt = submittedAt;
    }

    public Long getSpecialistId() { return specialistId; }
    public String getName() { return name; }
    public String getSpecialty() { return specialty; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}
