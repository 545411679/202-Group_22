package com.grooming.pet.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SpecialistBookingForbiddenIntegrationTest extends AbstractIntegrationTestSupport {

    @Test
    @DisplayName("specialist cannot create a customer booking")
    void specialistCannotCreateCustomerBooking() throws Exception {
        String specialistToken = login("specialist.integration@example.com");

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(specialistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "slotIds", List.of(availableSlot.getId()),
                                "contact", "specialist.integration@example.com",
                                "topic", "Invalid booking"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }
}
