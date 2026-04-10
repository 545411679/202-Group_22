package com.grooming.pet.dto.response;

import java.math.BigDecimal;

public class BookingCreateResponse {
    private Long bookingId;
    private String status;
    private BigDecimal fee;

    public BookingCreateResponse(Long bookingId, String status, BigDecimal fee) {
        this.bookingId = bookingId;
        this.status = status;
        this.fee = fee;
    }

    public Long getBookingId() { return bookingId; }
    public String getStatus() { return status; }
    public BigDecimal getFee() { return fee; }
}
