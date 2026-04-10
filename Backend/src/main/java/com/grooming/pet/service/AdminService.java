package com.grooming.pet.service;

import com.grooming.pet.dto.request.UserStatusRequest;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {
    private final BookingRepository bookingRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final UserRepository userRepository;
    private final SpecialistRepository specialistRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogService activityLogService;
    private final AuthService authService;

    public AdminService(BookingRepository bookingRepository,
                        BookingSlotRepository bookingSlotRepository,
                        UserRepository userRepository,
                        SpecialistRepository specialistRepository,
                        ActivityLogRepository activityLogRepository,
                        ActivityLogService activityLogService,
                        AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.bookingSlotRepository = bookingSlotRepository;
        this.userRepository = userRepository;
        this.specialistRepository = specialistRepository;
        this.activityLogRepository = activityLogRepository;
        this.activityLogService = activityLogService;
        this.authService = authService;
    }

    public List<AdminBookingResponse> getAllBookings(String statusFilter) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        List<Booking> bookings;
        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                Booking.Status status = Booking.Status.valueOf(statusFilter.toUpperCase());
                bookings = bookingRepository.findAll().stream()
                        .filter(b -> b.getStatus() == status)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter.");
            }
        } else {
            bookings = bookingRepository.findAll();
        }
        return bookings.stream().map(booking -> new AdminBookingResponse(
                booking.getId(),
                booking.getCustomer().getName(),
                booking.getSpecialist().getName(),
                booking.getCreatedAt(),
                booking.getStatus().name()
        )).collect(Collectors.toList());
    }

    public List<AdminUserResponse> getAllUsers(String roleFilter, String statusFilter) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        List<User> users = userRepository.findAll();
        if (roleFilter != null && !roleFilter.isBlank()) {
            try {
                User.Role role = User.Role.valueOf(roleFilter.toUpperCase());
                users = users.stream().filter(u -> u.getRole() == role).collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role filter.");
            }
        }
        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                User.Status status = User.Status.valueOf(statusFilter.toUpperCase());
                users = users.stream().filter(u -> u.getStatus() == status).collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter.");
            }
        }
        return users.stream().map(u -> new AdminUserResponse(
                u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getStatus().name(), u.getCreatedAt()
        )).collect(Collectors.toList());
    }

    public AdminUserDetailResponse getUserDetail(Long id) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        String specialistProfileStatus = null;
        if (user.getRole() == User.Role.SPECIALIST) {
            specialistProfileStatus = specialistRepository.findByUser(user)
                    .map(s -> s.getStatus().name()).orElse(null);
        }
        return new AdminUserDetailResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name(),
                user.getStatus().name(), user.getCreatedAt(), specialistProfileStatus);
    }

    public AdminUserResponse updateUserStatus(Long id, UserStatusRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        User.Status newStatus;
        try {
            newStatus = User.Status.valueOf(req.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status value. Allowed: ACTIVE, DISABLED.");
        }
        if (newStatus != User.Status.ACTIVE && newStatus != User.Status.DISABLED) {
            throw new BadRequestException("Invalid status value. Allowed: ACTIVE, DISABLED.");
        }
        user.setStatus(newStatus);
        user = userRepository.save(user);
        activityLogService.log(currentUser.getId(), currentUser.getRole().name(),
                "UPDATE_USER_STATUS", "User", user.getId());
        return new AdminUserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name(),
                user.getStatus().name(), user.getCreatedAt());
    }

    public List<ActivityLogResponse> getLogs() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        return activityLogRepository.findAll().stream()
                .map(log -> new ActivityLogResponse(
                        log.getId(), log.getTimestamp(), log.getActorId(), log.getActorRole(),
                        log.getAction(), log.getTargetEntity(), log.getTargetId()))
                .collect(Collectors.toList());
    }
}
