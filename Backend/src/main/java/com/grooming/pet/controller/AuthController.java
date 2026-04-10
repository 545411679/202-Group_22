package com.grooming.pet.controller;

import com.grooming.pet.dto.request.*;
import com.grooming.pet.dto.response.*;
import com.grooming.pet.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me() {
        return ResponseEntity.ok(authService.me());
    }

    @PatchMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody PasswordChangeRequest req) {
        authService.changePassword(req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}
