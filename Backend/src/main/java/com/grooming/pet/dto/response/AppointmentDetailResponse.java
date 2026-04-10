package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDetailResponse {
    private Long bookingId;
    private String specialistName;
    private String specialty;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal fee;
    private String status;
    private String contact;
    private String topic;
    private String notes;

    public AppointmentDetailResponse(Long bookingId, String specialistName, String specialty,
                                     LocalDate slotDate, LocalTime startTime, LocalTime endTime,
                                     BigDecimal fee, String status, String contact, String topic, String notes) {
        this.bookingId = bookingId;
        this.specialistName = specialistName;
        this.specialty = specialty;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.fee = fee;
        this.status = status;
        this.contact = contact;
        this.topic = topic;
        this.notes = notes;
    }

    public Long getBookingId() { return bookingId; }
    public String getSpecialistName() { return specialistName; }
    public String getSpecialty() { return specialty; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BigDecimal getFee() { return fee; }
    public String getStatus() { return status; }
    public String getContact() { return contact; }
    public String getTopic() { return topic; }
    public String getNotes() { return notes; }
}
