package com.grooming.pet.controller;

import com.grooming.pet.dto.response.*;
import com.grooming.pet.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/appointments")
    public ResponseEntity<DashboardResponse> getAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String order) {
        return ResponseEntity.ok(dashboardService.getAppointments(status, sortBy, order));
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<AppointmentDetailResponse> getAppointmentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.getAppointmentDetail(id));
    }
}
