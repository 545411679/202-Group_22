package com.grooming.pet.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminSpecialistApprovalIntegrationTest extends AbstractIntegrationTestSupport {

    @Test
    @DisplayName("admin approves a pending specialist profile")
    void adminCanApprovePendingSpecialistProfile() throws Exception {
        String adminToken = login("admin.integration@example.com");

        mockMvc.perform(put("/api/admin/specialists/profile/{id}/review", pendingSpecialist.getId())
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("action", "APPROVE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.specialistId", is(pendingSpecialist.getId().intValue())))
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }
}
