package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class SpecialistProfileRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String specialty;

    @NotBlank
    @Size(max = 100)
    private String qualificationLevel;

    @NotBlank
    private String bio;

    @NotNull
    private BigDecimal fee;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getQualificationLevel() { return qualificationLevel; }
    public void setQualificationLevel(String qualificationLevel) { this.qualificationLevel = qualificationLevel; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }
}
