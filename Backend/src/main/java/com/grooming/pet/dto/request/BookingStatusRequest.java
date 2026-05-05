package com.grooming.pet.dto.request;

import jakarta.validation.constraints.NotBlank;

public class BookingStatusRequest {
    @NotBlank
    private String action;

    private String meetingType;
    private String meetingInfo;

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getMeetingType() { return meetingType; }
    public void setMeetingType(String meetingType) { this.meetingType = meetingType; }
    public String getMeetingInfo() { return meetingInfo; }
    public void setMeetingInfo(String meetingInfo) { this.meetingInfo = meetingInfo; }
}
