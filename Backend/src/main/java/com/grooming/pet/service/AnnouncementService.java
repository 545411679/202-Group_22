package com.grooming.pet.service;

import com.grooming.pet.dto.request.AnnouncementRequest;
import com.grooming.pet.dto.response.AnnouncementResponse;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.AnnouncementReadRepository;
import com.grooming.pet.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnnouncementService {
    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadRepository announcementReadRepository;
    private final AuthService authService;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               AnnouncementReadRepository announcementReadRepository,
                               AuthService authService) {
        this.announcementRepository = announcementRepository;
        this.announcementReadRepository = announcementReadRepository;
        this.authService = authService;
    }

    public List<AnnouncementResponse> getAllAnnouncements() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        return announcementRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(a -> toResponse(a, null))
                .collect(Collectors.toList());
    }

    public List<AnnouncementResponse> getAnnouncementsForCurrentUser() {
        User currentUser = authService.getCurrentUser();
        Set<Long> readIds = announcementReadRepository.findByUserId(currentUser.getId()).stream()
                .map(AnnouncementRead::getAnnouncementId)
                .collect(Collectors.toCollection(HashSet::new));

        Announcement.Audience targetAudience = audienceForRole(currentUser.getRole());

        return announcementRepository.findByPublishedTrueOrderByCreatedAtDesc().stream()
                .filter(a -> a.getAudience() == Announcement.Audience.ALL
                          || a.getAudience() == targetAudience)
                .map(a -> toResponse(a, !readIds.contains(a.getId())))
                .collect(Collectors.toList());
    }

    public void markAsRead(Long announcementId) {
        User currentUser = authService.getCurrentUser();
        if (!announcementRepository.existsById(announcementId)) {
            throw new ResourceNotFoundException("Announcement not found.");
        }
        if (!announcementReadRepository.existsByUserIdAndAnnouncementId(currentUser.getId(), announcementId)) {
            announcementReadRepository.save(new AnnouncementRead(currentUser.getId(), announcementId));
        }
    }

    public AnnouncementResponse createAnnouncement(AnnouncementRequest req) {
        requireAdmin();
        Announcement announcement = new Announcement();
        applyFields(announcement, req);
        announcement = announcementRepository.save(announcement);
        return toResponse(announcement, null);
    }

    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest req) {
        requireAdmin();
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));
        applyFields(announcement, req);
        announcement = announcementRepository.save(announcement);
        return toResponse(announcement, null);
    }

    public void deleteAnnouncement(Long id) {
        requireAdmin();
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));
        announcementRepository.delete(announcement);
    }

    private void requireAdmin() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
    }

    private void applyFields(Announcement a, AnnouncementRequest req) {
        a.setTitle(req.getTitle());
        a.setBody(req.getBody());
        a.setImageUrl(req.getImageUrl());
        if (req.getAudience() != null && !req.getAudience().isBlank()) {
            try { a.setAudience(Announcement.Audience.valueOf(req.getAudience())); }
            catch (IllegalArgumentException ex) { throw new BadRequestException("Invalid audience: " + req.getAudience()); }
        }
        if (req.getPublished() != null) a.setPublished(req.getPublished());
    }

    private Announcement.Audience audienceForRole(User.Role role) {
        return switch (role) {
            case CLIENT     -> Announcement.Audience.CLIENT;
            case SPECIALIST -> Announcement.Audience.SPECIALIST;
            default         -> Announcement.Audience.ALL;
        };
    }

    private AnnouncementResponse toResponse(Announcement a, Boolean unread) {
        return new AnnouncementResponse(
                a.getId(), a.getTitle(), a.getBody(),
                a.getImageUrl(),
                a.getAudience() != null ? a.getAudience().name() : null,
                a.isPublished(),
                unread,
                a.getCreatedAt()
        );
    }
}
