package com.grooming.pet.service;

import com.grooming.pet.config.JwtUtil;
import com.grooming.pet.dto.request.PasswordChangeRequest;
import com.grooming.pet.dto.request.RegisterRequest;
import com.grooming.pet.dto.request.UpdateProfileRequest;
import com.grooming.pet.dto.response.MeResponse;
import com.grooming.pet.exception.BadRequestException;
import com.grooming.pet.exception.ConflictException;
import com.grooming.pet.exception.UnauthorizedException;
import com.grooming.pet.model.User;
import com.grooming.pet.repository.SpecialistRepository;
import com.grooming.pet.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private SpecialistRepository specialistRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks private AuthService authService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("register saves a new user with encoded password and requested role")
    void registerSavesEncodedUser() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("new.client@example.com");
        req.setPassword("Password123");
        req.setName("New Client");
        req.setRole("CLIENT");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(req.getPassword())).thenReturn("encoded");

        authService.register(req);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("new.client@example.com");
        assertThat(saved.getPasswordHash()).isEqualTo("encoded");
        assertThat(saved.getName()).isEqualTo("New Client");
        assertThat(saved.getRole()).isEqualTo(User.Role.CLIENT);
    }

    @Test
    @DisplayName("register rejects duplicate email")
    void registerRejectsDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("taken@example.com");
        req.setPassword("Password123");
        req.setName("Taken");
        req.setRole("CLIENT");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflictException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateProfile rejects email already used by another account")
    void updateProfileRejectsDuplicateEmail() {
        User current = user(1L, "old@example.com", User.Role.CLIENT);
        authenticateAs(current.getEmail());
        when(userRepository.findByEmail(current.getEmail())).thenReturn(Optional.of(current));
        when(userRepository.existsByEmail("used@example.com")).thenReturn(true);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setName("Updated");
        req.setEmail("used@example.com");

        assertThatThrownBy(() -> authService.updateProfile(req))
                .isInstanceOf(ConflictException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateProfile saves valid name and email changes")
    void updateProfileSavesChanges() {
        User current = user(1L, "old@example.com", User.Role.CLIENT);
        authenticateAs(current.getEmail());
        when(userRepository.findByEmail(current.getEmail())).thenReturn(Optional.of(current));
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setName("Updated Client");
        req.setEmail("new@example.com");

        MeResponse response = authService.updateProfile(req);

        assertThat(response.getEmail()).isEqualTo("new@example.com");
        assertThat(response.getName()).isEqualTo("Updated Client");
    }

    @Test
    @DisplayName("changePassword rejects incorrect old password")
    void changePasswordRejectsWrongOldPassword() {
        User current = user(1L, "client@example.com", User.Role.CLIENT);
        current.setPasswordHash("encoded-old");
        authenticateAs(current.getEmail());
        when(userRepository.findByEmail(current.getEmail())).thenReturn(Optional.of(current));
        when(passwordEncoder.matches("wrong", "encoded-old")).thenReturn(false);

        PasswordChangeRequest req = new PasswordChangeRequest();
        req.setOldPassword("wrong");
        req.setNewPassword("NewPassword123");

        assertThatThrownBy(() -> authService.changePassword(req))
                .isInstanceOf(UnauthorizedException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword rejects reusing the old password")
    void changePasswordRejectsSamePassword() {
        User current = user(1L, "client@example.com", User.Role.CLIENT);
        current.setPasswordHash("encoded-old");
        authenticateAs(current.getEmail());
        when(userRepository.findByEmail(current.getEmail())).thenReturn(Optional.of(current));
        when(passwordEncoder.matches("Password123", "encoded-old")).thenReturn(true);

        PasswordChangeRequest req = new PasswordChangeRequest();
        req.setOldPassword("Password123");
        req.setNewPassword("Password123");

        assertThatThrownBy(() -> authService.changePassword(req))
                .isInstanceOf(BadRequestException.class);
        verify(userRepository, never()).save(any());
    }

    private static User user(Long id, String email, User.Role role) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setName("Test User");
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        return user;
    }

    private static void authenticateAs(String email) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}

