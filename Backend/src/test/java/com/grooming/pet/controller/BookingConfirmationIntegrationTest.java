package com.grooming.pet.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BookingConfirmationIntegrationTest extends AbstractIntegrationTestSupport {

    @Test
    @DisplayName("customer creates a booking and specialist confirms it through real REST APIs")
    void customerBookingCanBeConfirmedBySpecialist() throws Exception {
        String clientToken = login("client.integration@example.com");
        String specialistToken = login("specialist.integration@example.com");

        MvcResult createBookingResult = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(clientToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "slotIds", List.of(availableSlot.getId()),
                                "contact", "client.integration@example.com",
                                "topic", "Integration testing consultation",
                                "notes", "Created from integration test"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andReturn();

        long bookingId = objectMapper.readTree(createBookingResult.getResponse().getContentAsString())
                .get("bookingId")
                .asLong();

        mockMvc.perform(patch("/api/bookings/{id}/status", bookingId)
                        .header("Authorization", bearer(specialistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "action", "CONFIRM",
                                "meetingType", "ONLINE",
                                "meetingInfo", "Meeting link will be sent by email"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")));

        mockMvc.perform(get("/api/dashboard/appointments/{id}", bookingId)
                        .header("Authorization", bearer(clientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId", is((int) bookingId)))
                .andExpect(jsonPath("$.status", is("CONFIRMED")));
    }
}
