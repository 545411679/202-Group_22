package com.grooming.pet.dto.response;

import java.math.BigDecimal;

public class SpecialistSummaryResponse {
    private Long specialistId;
    private String name;
    private String specialty;
    private String qualificationLevel;
    private BigDecimal fee;

    public SpecialistSummaryResponse(Long specialistId, String name, String specialty,
                                     String qualificationLevel, BigDecimal fee) {
        this.specialistId = specialistId;
        this.name = name;
        this.specialty = specialty;
        this.qualificationLevel = qualificationLevel;
        this.fee = fee;
    }

    public Long getSpecialistId() { return specialistId; }
    public String getName() { return name; }
    public String getSpecialty() { return specialty; }
    public String getQualificationLevel() { return qualificationLevel; }
    public BigDecimal getFee() { return fee; }
}
