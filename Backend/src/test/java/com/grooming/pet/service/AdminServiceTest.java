package com.grooming.pet.service;

import com.grooming.pet.dto.request.UserStatusRequest;
import com.grooming.pet.dto.response.AdminUserResponse;
import com.grooming.pet.exception.BadRequestException;
import com.grooming.pet.exception.ForbiddenException;
import com.grooming.pet.model.User;
import com.grooming.pet.repository.BookingRepository;
import com.grooming.pet.repository.BookingSlotRepository;
import com.grooming.pet.repository.SpecialistRepository;
import com.grooming.pet.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private BookingSlotRepository bookingSlotRepository;
    @Mock private UserRepository userRepository;
    @Mock private SpecialistRepository specialistRepository;
    @Mock private ActivityLogService activityLogService;
    @Mock private AuthService authService;

    @InjectMocks private AdminService adminService;

    @Test
    @DisplayName("getAllUsers rejects non-admin users")
    void getAllUsersRejectsNonAdmin() {
        when(authService.getCurrentUser()).thenReturn(user(1L, User.Role.CLIENT));

        assertThatThrownBy(() -> adminService.getAllUsers(null, null))
                .isInstanceOf(ForbiddenException.class);
        verify(userRepository, never()).findAll();
    }

    @Test
    @DisplayName("getAllUsers rejects invalid role filter")
    void getAllUsersRejectsInvalidRoleFilter() {
        when(authService.getCurrentUser()).thenReturn(user(10L, User.Role.ADMIN));
        when(userRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> adminService.getAllUsers("manager", null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("updateUserStatus saves new status and writes an activity log")
    void updateUserStatusSavesAndLogs() {
        User admin = user(10L, User.Role.ADMIN);
        User target = user(1L, User.Role.CLIENT);
        when(authService.getCurrentUser()).thenReturn(admin);
        when(userRepository.findById(1L)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserStatusRequest req = new UserStatusRequest();
        req.setStatus("DISABLED");

        AdminUserResponse response = adminService.updateUserStatus(1L, req);

        assertThat(response.getStatus()).isEqualTo("DISABLED");
        assertThat(target.getStatus()).isEqualTo(User.Status.DISABLED);
        verify(activityLogService).log(10L, "ADMIN", "UPDATE_USER_STATUS", "User", 1L);
    }

    @Test
    @DisplayName("updateUserStatus rejects unsupported status values")
    void updateUserStatusRejectsInvalidStatus() {
        when(authService.getCurrentUser()).thenReturn(user(10L, User.Role.ADMIN));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, User.Role.CLIENT)));

        UserStatusRequest req = new UserStatusRequest();
        req.setStatus("PENDING");

        assertThatThrownBy(() -> adminService.updateUserStatus(1L, req))
                .isInstanceOf(BadRequestException.class);
        verify(userRepository, never()).save(any());
    }

    private static User user(Long id, User.Role role) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@example.com");
        user.setName("User " + id);
        user.setPasswordHash("encoded");
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now().minusDays(1));
        return user;
    }
}
