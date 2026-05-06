package com.grooming.pet.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grooming.pet.config.DataInitializer;
import com.grooming.pet.model.Slot;
import com.grooming.pet.model.Specialist;
import com.grooming.pet.model.User;
import com.grooming.pet.repository.BookingRepository;
import com.grooming.pet.repository.BookingSlotRepository;
import com.grooming.pet.repository.SlotRepository;
import com.grooming.pet.repository.SpecialistRepository;
import com.grooming.pet.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Sprint2ApiTest {

    private static final String PASSWORD = "Password123";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private UserRepository userRepository;
    @Autowired private SpecialistRepository specialistRepository;
    @Autowired private SlotRepository slotRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private BookingSlotRepository bookingSlotRepository;



    private User client;
    private User specialistUser;
    private User admin;
    private Specialist activeSpecialist;
    private Specialist pendingSpecialist;
    private Slot availableSlot;

    @BeforeEach
    void setUp() {
        bookingSlotRepository.deleteAll();
        bookingRepository.deleteAll();
        slotRepository.deleteAll();
        specialistRepository.deleteAll();
        userRepository.deleteAll();

        client = userRepository.save(user("client@example.com", "Client User", User.Role.CLIENT));
        specialistUser = userRepository.save(user("specialist@example.com", "Specialist User", User.Role.SPECIALIST));
        admin = userRepository.save(user("admin@example.com", "Admin User", User.Role.ADMIN));
        User pendingUser = userRepository.save(user("pending@example.com", "Pending Specialist", User.Role.SPECIALIST));

        activeSpecialist = specialistRepository.save(specialist(specialistUser, "Dr. Active", Specialist.Status.ACTIVE));
        pendingSpecialist = specialistRepository.save(specialist(pendingUser, "Dr. Pending", Specialist.Status.PENDING));
        availableSlot = slotRepository.save(slot(activeSpecialist, LocalDate.now().plusDays(5), LocalTime.of(9, 0)));
    }

    @Test
    @DisplayName("public search endpoint is available without JWT")
    void publicSearchWorksWithoutToken() throws Exception {
        mockMvc.perform(get("/api/specialists/search")
                        .param("name", "Active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name", is("Dr. Active")));
    }

    @Test
    @DisplayName("protected dashboard requires authentication")
    void dashboardRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/dashboard/appointments"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("client can login, create booking, and see it in dashboard")
    void clientBookingFlowWorksWithJwt() throws Exception {
        String clientToken = login("client@example.com");

        MvcResult bookingResult = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(clientToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "slotIds", List.of(availableSlot.getId()),
                                "contact", "client@example.com",
                                "topic", "Planning session",
                                "notes", "First consultation"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andReturn();

        long bookingId = objectMapper.readTree(bookingResult.getResponse().getContentAsString()).get("bookingId").asLong();

        mockMvc.perform(get("/api/dashboard/appointments")
                        .header("Authorization", bearer(clientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointments", org.hamcrest.Matchers.hasSize(greaterThanOrEqualTo(1))));

        mockMvc.perform(get("/api/dashboard/appointments/{id}", bookingId)
                        .header("Authorization", bearer(clientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId", is((int) bookingId)))
                .andExpect(jsonPath("$.status", is("PENDING")));
    }

    @Test
    @DisplayName("specialist can create slot and confirm own booking")
    void specialistCanCreateSlotAndConfirmBooking() throws Exception {
        String clientToken = login("client@example.com");
        String specialistToken = login("specialist@example.com");

        mockMvc.perform(post("/api/specialists/slots")
                        .header("Authorization", bearer(specialistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "slotDate", LocalDate.now().plusDays(7).toString(),
                                "startTime", "14:00:00",
                                "endTime", "15:00:00"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("AVAILABLE")));

        MvcResult bookingResult = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(clientToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "slotIds", List.of(availableSlot.getId()),
                                "contact", "client@example.com",
                                "topic", "Confirm me"))))
                .andExpect(status().isCreated())
                .andReturn();
        long bookingId = objectMapper.readTree(bookingResult.getResponse().getContentAsString()).get("bookingId").asLong();

        mockMvc.perform(patch("/api/bookings/{id}/status", bookingId)
                        .header("Authorization", bearer(specialistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "action", "CONFIRM",
                                "meetingType", "ONLINE",
                                "meetingInfo", "Teams link"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")));
    }

    @Test
    @DisplayName("admin can list users, reject client admin access, and approve specialist profile")
    void adminEndpointsApplyRoleRules() throws Exception {
        String adminToken = login("admin@example.com");
        String clientToken = login("client@example.com");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(greaterThanOrEqualTo(4))));

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", bearer(clientToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/admin/specialists/profile/{id}/review", pendingSpecialist.getId())
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("action", "APPROVE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }

    private String login(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", PASSWORD))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("token").asText();
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private User user(String email, String name, User.Role role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        return user;
    }

    private static Specialist specialist(User user, String name, Specialist.Status status) {
        Specialist specialist = new Specialist();
        specialist.setUser(user);
        specialist.setName(name);
        specialist.setSpecialty("General Consultation");
        specialist.setQualificationLevel("Senior");
        specialist.setBio("Experienced consultant");
        specialist.setPriceAmount(new BigDecimal("200.00"));
        specialist.setStatus(status);
        specialist.setCertificates("Certificate A\nCertificate B");
        return specialist;
    }

    private static Slot slot(Specialist specialist, LocalDate date, LocalTime startTime) {
        Slot slot = new Slot();
        slot.setSpecialist(specialist);
        slot.setSlotDate(date);
        slot.setStartTime(startTime);
        slot.setEndTime(startTime.plusHours(1));
        slot.setStatus(Slot.Status.AVAILABLE);
        return slot;
    }
}
