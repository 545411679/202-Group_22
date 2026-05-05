package com.grooming.pet.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AdminBookingResponse {
    private Long bookingId;
    private String customerName;
    private String specialistName;
    private String specialty;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalDateTime createdAt;
    private String status;

    public AdminBookingResponse(Long bookingId, String customerName, String specialistName,
                                String specialty, LocalDate slotDate, LocalTime startTime,
                                LocalDateTime createdAt, String status) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.specialistName = specialistName;
        this.specialty = specialty;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.createdAt = createdAt;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public String getSpecialistName() { return specialistName; }
    public String getSpecialty() { return specialty; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
}
