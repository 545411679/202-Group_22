package com.grooming.pet.dto.response;

public class BookingStatusResponse {
    private Long bookingId;
    private String status;

    public BookingStatusResponse(Long bookingId, String status) {
        this.bookingId = bookingId;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public String getStatus() { return status; }
}
