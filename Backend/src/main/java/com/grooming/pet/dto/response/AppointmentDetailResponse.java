package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AppointmentDetailResponse {
    private Long bookingId;
    private Long specialistId;
    private String specialistName;
    private String specialty;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDateTime scheduledTime;
    private BigDecimal fee;
    private String status;
    private String contact;
    private String topic;
    private String notes;
    private LocalDateTime createdAt;
    private String meetingType;
    private String meetingInfo;

    private Boolean hasReview;
    private Integer reviewRating;
    private String  reviewComment;
    private LocalDateTime reviewedAt;

    public AppointmentDetailResponse(Long bookingId, Long specialistId, String specialistName, String specialty,
                                     LocalDate slotDate, LocalTime startTime, LocalTime endTime,
                                     BigDecimal fee, String status, String contact, String topic, String notes,
                                     LocalDateTime createdAt, String meetingType, String meetingInfo,
                                     Boolean hasReview, Integer reviewRating, String reviewComment, LocalDateTime reviewedAt) {
        this.bookingId = bookingId;
        this.specialistId = specialistId;
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
        this.createdAt = createdAt;
        this.meetingType = meetingType;
        this.meetingInfo = meetingInfo;
        if (slotDate != null && startTime != null) {
            this.scheduledTime = LocalDateTime.of(slotDate, startTime);
        }
        this.hasReview     = hasReview;
        this.reviewRating  = reviewRating;
        this.reviewComment = reviewComment;
        this.reviewedAt    = reviewedAt;
    }

    public Long getBookingId() { return bookingId; }
    public Long getSpecialistId() { return specialistId; }
    public String getSpecialistName() { return specialistName; }
    public String getSpecialty() { return specialty; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public BigDecimal getFee() { return fee; }
    public BigDecimal getFeeAmount() { return fee; }
    public String getStatus() { return status; }
    public String getContact() { return contact; }
    public String getTopic() { return topic; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getMeetingType() { return meetingType; }
    public String getMeetingInfo() { return meetingInfo; }
    public Boolean getHasReview() { return hasReview; }
    public Integer getReviewRating() { return reviewRating; }
    public String  getReviewComment() { return reviewComment; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
}
