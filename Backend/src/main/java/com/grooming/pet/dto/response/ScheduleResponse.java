package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class ScheduleResponse {
    private Long specialistId;
    private BigDecimal fee;
    private List<SlotResponse> slots;

    public ScheduleResponse(Long specialistId, BigDecimal fee, List<SlotResponse> slots) {
        this.specialistId = specialistId;
        this.fee = fee;
        this.slots = slots;
    }

    public Long getSpecialistId() { return specialistId; }
    public BigDecimal getFee() { return fee; }
    public List<SlotResponse> getSlots() { return slots; }
}
