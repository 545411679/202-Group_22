package com.grooming.pet.service;

import com.grooming.pet.dto.request.AnnouncementRequest;
import com.grooming.pet.dto.response.AnnouncementResponse;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnnouncementService {
    private final AnnouncementRepository announcementRepository;
    private final AuthService authService;

    public AnnouncementService(AnnouncementRepository announcementRepository, AuthService authService) {
        this.announcementRepository = announcementRepository;
        this.authService = authService;
    }

    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAll().stream()
                .map(a -> new AnnouncementResponse(a.getId(), a.getTitle(), a.getBody(), a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public AnnouncementResponse createAnnouncement(AnnouncementRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        Announcement announcement = new Announcement();
        announcement.setTitle(req.getTitle());
        announcement.setBody(req.getBody());
        announcement = announcementRepository.save(announcement);
        return new AnnouncementResponse(announcement.getId(), announcement.getTitle(), announcement.getBody(), announcement.getCreatedAt());
    }

    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));
        announcement.setTitle(req.getTitle());
        announcement.setBody(req.getBody());
        announcement = announcementRepository.save(announcement);
        return new AnnouncementResponse(announcement.getId(), announcement.getTitle(), announcement.getBody(), announcement.getCreatedAt());
    }

    public void deleteAnnouncement(Long id) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));
        announcementRepository.delete(announcement);
    }
}
