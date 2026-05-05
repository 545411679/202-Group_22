package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AppointmentSummaryResponse {
    private Long bookingId;
    private String specialistName;
    private String specialty;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDateTime scheduledTime;
    private BigDecimal fee;
    private String status;

    public AppointmentSummaryResponse(Long bookingId, String specialistName, String specialty,
                                      LocalDate slotDate, LocalTime startTime, LocalTime endTime,
                                      BigDecimal fee, String status) {
        this.bookingId = bookingId;
        this.specialistName = specialistName;
        this.specialty = specialty;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.fee = fee;
        this.status = status;
        if (slotDate != null && startTime != null) {
            this.scheduledTime = LocalDateTime.of(slotDate, startTime);
        }
    }

    public Long getBookingId() { return bookingId; }
    public String getSpecialistName() { return specialistName; }
    public String getSpecialty() { return specialty; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public BigDecimal getFee() { return fee; }
    public BigDecimal getFeeAmount() { return fee; }
    public String getStatus() { return status; }
}
