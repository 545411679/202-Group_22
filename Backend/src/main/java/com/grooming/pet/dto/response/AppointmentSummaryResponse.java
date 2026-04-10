package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentSummaryResponse {
    private Long bookingId;
    private String specialistName;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal fee;
    private String status;

    public AppointmentSummaryResponse(Long bookingId, String specialistName, LocalDate slotDate,
                                      LocalTime startTime, LocalTime endTime, BigDecimal fee, String status) {
        this.bookingId = bookingId;
        this.specialistName = specialistName;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.fee = fee;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public String getSpecialistName() { return specialistName; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BigDecimal getFee() { return fee; }
    public String getStatus() { return status; }
}
