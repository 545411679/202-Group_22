package com.grooming.pet.service;

import com.grooming.pet.config.JwtUtil;
import com.grooming.pet.dto.request.*;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final SpecialistRepository specialistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, SpecialistRepository specialistRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.specialistRepository = specialistRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("This email has already been registered.");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        try {
            user.setRole(User.Role.valueOf(req.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role value.");
        }
        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials."));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials.");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        Long specialistId = null;
        if (user.getRole() == User.Role.SPECIALIST) {
            specialistId = specialistRepository.findByUser(user)
                    .map(Specialist::getId).orElse(null);
        }
        return new LoginResponse(token, user.getRole().name(), user.getId(), specialistId, user.getName());
    }

    public MeResponse me() {
        User user = getCurrentUser();
        return new MeResponse(user.getId(), user.getEmail(), user.getName(), user.getRole().name());
    }

    public void changePassword(PasswordChangeRequest req) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Old password is incorrect.");
        }
        if (req.getOldPassword().equals(req.getNewPassword())) {
            throw new BadRequestException("The new password can't be the same as the old.");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Not authenticated."));
    }
}
