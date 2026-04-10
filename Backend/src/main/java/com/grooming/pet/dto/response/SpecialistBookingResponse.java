package com.grooming.pet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class SpecialistBookingResponse {
    private Long bookingId;
    private String customerName;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal fee;
    private String status;

    public SpecialistBookingResponse(Long bookingId, String customerName, LocalDate slotDate,
                                     LocalTime startTime, LocalTime endTime, BigDecimal fee, String status) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.fee = fee;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BigDecimal getFee() { return fee; }
    public String getStatus() { return status; }
}
