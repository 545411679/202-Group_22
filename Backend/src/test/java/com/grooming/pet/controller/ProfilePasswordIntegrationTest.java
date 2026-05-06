package com.grooming.pet.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProfilePasswordIntegrationTest extends AbstractIntegrationTestSupport {

    @Test
    @DisplayName("client updates profile and changes password through authenticated APIs")
    void clientCanUpdateProfileAndChangePassword() throws Exception {
        String clientToken = login("client.integration@example.com");

        mockMvc.perform(patch("/api/auth/profile")
                        .header("Authorization", bearer(clientToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "name", "Updated Client",
                                "email", "client.updated.integration@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Client")))
                .andExpect(jsonPath("$.email", is("client.updated.integration@example.com")));

        String updatedClientToken = login("client.updated.integration@example.com");

        mockMvc.perform(patch("/api/auth/password")
                        .header("Authorization", bearer(updatedClientToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "oldPassword", PASSWORD,
                                "newPassword", "NewPassword123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Password changed successfully.")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "email", "client.updated.integration@example.com",
                                "password", "NewPassword123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Client")));
    }
}
