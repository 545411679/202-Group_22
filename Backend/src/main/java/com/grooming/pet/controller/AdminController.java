package com.grooming.pet.controller;

import com.grooming.pet.dto.request.*;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final SpecialistService specialistService;
    private final AdminService adminService;
    private final AnnouncementService announcementService;
    private final CategoryService categoryService;

    public AdminController(SpecialistService specialistService,
                           AdminService adminService,
                           AnnouncementService announcementService,
                           CategoryService categoryService) {
        this.specialistService = specialistService;
        this.adminService = adminService;
        this.announcementService = announcementService;
        this.categoryService = categoryService;
    }

    @GetMapping("/specialists/pending")
    public ResponseEntity<List<PendingSpecialistResponse>> getPendingSpecialists() {
        return ResponseEntity.ok(specialistService.getPendingProfiles());
    }

    @PutMapping("/specialists/profile/{id}/review")
    public ResponseEntity<SpecialistProfileResponse> reviewProfile(@PathVariable Long id,
                                                                    @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(specialistService.reviewProfile(id, req));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingResponse>> getAllBookings(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllBookings(status));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllUsers(role, status));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDetailResponse> getUserDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> updateUserStatus(@PathVariable Long id,
                                                               @Valid @RequestBody UserStatusRequest req) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, req));
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @PostMapping("/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(@Valid @RequestBody AnnouncementRequest req) {
        return ResponseEntity.status(201).body(announcementService.createAnnouncement(req));
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(@PathVariable Long id,
                                                                    @Valid @RequestBody AnnouncementRequest req) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, req));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.status(201).body(categoryService.createCategory(req));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id,
                                                            @Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(categoryService.updateCategory(id, req));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ActivityLogResponse>> getLogs() {
        return ResponseEntity.ok(adminService.getLogs());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
