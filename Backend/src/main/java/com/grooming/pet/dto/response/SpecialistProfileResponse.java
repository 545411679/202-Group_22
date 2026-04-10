package com.grooming.pet.dto.response;

import java.math.BigDecimal;

public class SpecialistProfileResponse {
    private Long specialistId;
    private String name;
    private String specialty;
    private String qualificationLevel;
    private String bio;
    private BigDecimal fee;
    private String status;

    public SpecialistProfileResponse(Long specialistId, String name, String specialty,
                                     String qualificationLevel, String bio, BigDecimal fee, String status) {
        this.specialistId = specialistId;
        this.name = name;
        this.specialty = specialty;
        this.qualificationLevel = qualificationLevel;
        this.bio = bio;
        this.fee = fee;
        this.status = status;
    }

    public Long getSpecialistId() { return specialistId; }
    public String getName() { return name; }
    public String getSpecialty() { return specialty; }
    public String getQualificationLevel() { return qualificationLevel; }
    public String getBio() { return bio; }
    public BigDecimal getFee() { return fee; }
    public String getStatus() { return status; }
}
