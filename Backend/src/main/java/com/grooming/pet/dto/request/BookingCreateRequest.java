package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public class BookingCreateRequest {
    @NotEmpty
    private List<Long> slotIds;

    @NotBlank
    @Size(max = 100)
    private String contact;

    @Size(max = 100)
    private String topic;

    @Size(max = 500)
    private String notes;

    public List<Long> getSlotIds() { return slotIds; }
    public void setSlotIds(List<Long> slotIds) { this.slotIds = slotIds; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
