package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PendingSpecialistResponse {
    private Long specialistId;
    private String name;
    private String specialty;
    private String qualificationLevel;
    private String bio;
    private BigDecimal fee;
    private LocalDateTime submittedAt;
    private List<String> certificates;

    public PendingSpecialistResponse(Long specialistId, String name, String specialty,
                                     String qualificationLevel, String bio, BigDecimal fee,
                                     LocalDateTime submittedAt, List<String> certificates) {
        this.specialistId = specialistId;
        this.name = name;
        this.specialty = specialty;
        this.qualificationLevel = qualificationLevel;
        this.bio = bio;
        this.fee = fee;
        this.submittedAt = submittedAt;
        this.certificates = certificates;
    }

    public Long getSpecialistId() { return specialistId; }
    public String getName() { return name; }
    public String getSpecialty() { return specialty; }
    public String getQualificationLevel() { return qualificationLevel; }
    public String getBio() { return bio; }
    public BigDecimal getFee() { return fee; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public List<String> getCertificates() { return certificates; }
}
