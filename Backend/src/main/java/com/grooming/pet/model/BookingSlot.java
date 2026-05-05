package com.grooming.pet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_slots")
public class BookingSlot {
    @EmbeddedId
    private BookingSlotId id = new BookingSlotId();

    @ManyToOne
    @MapsId("bookingId")
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @MapsId("slotId")
    @JoinColumn(name = "slot_id")
    private Slot slot;

    public BookingSlot() {}
    public BookingSlot(Booking booking, Slot slot) {
        this.booking = booking;
        this.slot = slot;
        this.id = new BookingSlotId(booking.getId(), slot.getId());
    }

    public BookingSlotId getId() { return id; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public Slot getSlot() { return slot; }
    public void setSlot(Slot slot) { this.slot = slot; }
}
