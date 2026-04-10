package com.grooming.pet.dto.response;

import java.time.LocalDateTime;

public class ActivityLogResponse {
    private Long logId;
    private LocalDateTime timestamp;
    private Long actorId;
    private String actorRole;
    private String action;
    private String targetEntity;
    private Long targetId;

    public ActivityLogResponse(Long logId, LocalDateTime timestamp, Long actorId, String actorRole,
                               String action, String targetEntity, Long targetId) {
        this.logId = logId;
        this.timestamp = timestamp;
        this.actorId = actorId;
        this.actorRole = actorRole;
        this.action = action;
        this.targetEntity = targetEntity;
        this.targetId = targetId;
    }

    public Long getLogId() { return logId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Long getActorId() { return actorId; }
    public String getActorRole() { return actorRole; }
    public String getAction() { return action; }
    public String getTargetEntity() { return targetEntity; }
    public Long getTargetId() { return targetId; }
}
