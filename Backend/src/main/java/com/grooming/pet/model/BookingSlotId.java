package com.grooming.pet.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class BookingSlotId implements Serializable {
    private Long bookingId;
    private Long slotId;

    public BookingSlotId() {}
    public BookingSlotId(Long bookingId, Long slotId) {
        this.bookingId = bookingId;
        this.slotId = slotId;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BookingSlotId)) return false;
        BookingSlotId that = (BookingSlotId) o;
        return Objects.equals(bookingId, that.bookingId) && Objects.equals(slotId, that.slotId);
    }

    @Override
    public int hashCode() { return Objects.hash(bookingId, slotId); }
}
