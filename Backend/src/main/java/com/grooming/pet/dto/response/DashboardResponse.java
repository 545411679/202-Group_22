package com.grooming.pet.dto.response;

import java.util.List;

public class DashboardResponse {
    private List<AppointmentSummaryResponse> upcoming;
    private List<AppointmentSummaryResponse> appointments;

    public DashboardResponse(List<AppointmentSummaryResponse> upcoming, List<AppointmentSummaryResponse> appointments) {
        this.upcoming = upcoming;
        this.appointments = appointments;
    }

    public List<AppointmentSummaryResponse> getUpcoming() { return upcoming; }
    public List<AppointmentSummaryResponse> getAppointments() { return appointments; }
}
