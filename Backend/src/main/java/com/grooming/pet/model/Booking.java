package com.grooming.pet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "specialist_id", nullable = false)
    private Specialist specialist;

    @Column(nullable = false, length = 100)
    private String contact;

    @Column(length = 100)
    private String topic;

    @Column(length = 500)
    private String notes;

    @Column(name = "total_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status { PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED }

    public Booking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public Specialist getSpecialist() { return specialist; }
    public void setSpecialist(Specialist specialist) { this.specialist = specialist; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public BigDecimal getTotalFee() { return totalFee; }
    public void setTotalFee(BigDecimal totalFee) { this.totalFee = totalFee; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
