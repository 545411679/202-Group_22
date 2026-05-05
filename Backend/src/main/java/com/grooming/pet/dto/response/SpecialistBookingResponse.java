package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class SpecialistBookingResponse {
    private Long bookingId;
    private String customerName;
    private String contact;
    private String topic;
    private String notes;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDateTime scheduledTime;
    private BigDecimal fee;
    private String status;
    private String meetingType;
    private String meetingInfo;

    public SpecialistBookingResponse(Long bookingId, String customerName, String contact,
                                     String topic, String notes,
                                     LocalDate slotDate, LocalTime startTime, LocalTime endTime,
                                     BigDecimal fee, String status,
                                     String meetingType, String meetingInfo) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.contact = contact;
        this.topic = topic;
        this.notes = notes;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.fee = fee;
        this.status = status;
        this.meetingType = meetingType;
        this.meetingInfo = meetingInfo;
        if (slotDate != null && startTime != null) {
            this.scheduledTime = LocalDateTime.of(slotDate, startTime);
        }
    }

    public Long getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public String getContact() { return contact; }
    public String getTopic() { return topic; }
    public String getNotes() { return notes; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public BigDecimal getFee() { return fee; }
    public String getStatus() { return status; }
    public String getMeetingType() { return meetingType; }
    public String getMeetingInfo() { return meetingInfo; }
}
