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

class DuplicateSlotBookingIntegrationTest extends AbstractIntegrationTestSupport {

    @Test
    @DisplayName("customer cannot book the same slot twice")
    void bookedSlotCannotBeBookedAgain() throws Exception {
        String clientToken = login("client.integration@example.com");

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(clientToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "slotIds", List.of(availableSlot.getId()),
                                "contact", "client.integration@example.com",
                                "topic", "First booking"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")));

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(clientToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "slotIds", List.of(availableSlot.getId()),
                                "contact", "client.integration@example.com",
                                "topic", "Second booking"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("Conflict")));
    }
}
