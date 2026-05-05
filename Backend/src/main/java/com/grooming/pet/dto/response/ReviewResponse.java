package com.grooming.pet.dto.response;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private String customerName;
    private String specialistName;
    private String specialty;
    private Integer rating;
    private String comment;
    private boolean visible;
    private LocalDateTime createdAt;

    public ReviewResponse(Long id, Long bookingId, String customerName,
                          String specialistName, String specialty,
                          Integer rating, String comment,
                          boolean visible, LocalDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.specialistName = specialistName;
        this.specialty = specialty;
        this.rating = rating;
        this.comment = comment;
        this.visible = visible;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public String getSpecialistName() { return specialistName; }
    public String getSpecialty() { return specialty; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public boolean isVisible() { return visible; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
