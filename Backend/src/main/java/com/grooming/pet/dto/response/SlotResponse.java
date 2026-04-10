package com.grooming.pet.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public class SlotResponse {
    private Long slotId;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String bookingStatus;
    private String customerName;

    public SlotResponse(Long slotId, LocalDate slotDate, LocalTime startTime, LocalTime endTime,
                        String status, String bookingStatus, String customerName) {
        this.slotId = slotId;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.bookingStatus = bookingStatus;
        this.customerName = customerName;
    }

    public Long getSlotId() { return slotId; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getStatus() { return status; }
    public String getBookingStatus() { return bookingStatus; }
    public String getCustomerName() { return customerName; }
}
