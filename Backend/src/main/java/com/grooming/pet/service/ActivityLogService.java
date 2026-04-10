package com.grooming.pet.service;

import com.grooming.pet.model.ActivityLog;
import com.grooming.pet.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {
    private final ActivityLogRepository repo;

    public ActivityLogService(ActivityLogRepository repo) {
        this.repo = repo;
    }

    public void log(Long actorId, String actorRole, String action, String targetEntity, Long targetId) {
        ActivityLog entry = new ActivityLog();
        entry.setActorId(actorId);
        entry.setActorRole(actorRole);
        entry.setAction(action);
        entry.setTargetEntity(targetEntity);
        entry.setTargetId(targetId);
        entry.setTimestamp(java.time.LocalDateTime.now());
        repo.save(entry);
    }
}
