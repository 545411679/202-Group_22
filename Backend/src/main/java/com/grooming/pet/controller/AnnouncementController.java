package com.grooming.pet.controller;

import com.grooming.pet.dto.response.AnnouncementResponse;
import com.grooming.pet.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {
    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<AnnouncementResponse>> getMine() {
        return ResponseEntity.ok(announcementService.getAnnouncementsForCurrentUser());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        announcementService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}
