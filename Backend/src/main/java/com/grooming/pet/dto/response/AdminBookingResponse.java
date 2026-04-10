package com.grooming.pet.dto.response;

import java.time.LocalDateTime;

public class AdminBookingResponse {
    private Long bookingId;
    private String customerName;
    private String specialistName;
    private LocalDateTime createdAt;
    private String status;

    public AdminBookingResponse(Long bookingId, String customerName, String specialistName,
                                LocalDateTime createdAt, String status) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.specialistName = specialistName;
        this.createdAt = createdAt;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public String getSpecialistName() { return specialistName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
}
