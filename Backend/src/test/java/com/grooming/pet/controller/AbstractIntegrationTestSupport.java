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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class AbstractIntegrationTestSupport {

    protected static final String PASSWORD = "Password123";

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected PasswordEncoder passwordEncoder;
    @Autowired protected UserRepository userRepository;
    @Autowired protected SpecialistRepository specialistRepository;
    @Autowired protected SlotRepository slotRepository;
    @Autowired protected BookingRepository bookingRepository;
    @Autowired protected BookingSlotRepository bookingSlotRepository;

    @MockBean protected DataInitializer dataInitializer;

    protected Slot availableSlot;
    protected Specialist pendingSpecialist;

    @BeforeEach
    void setUpIntegrationData() {
        bookingSlotRepository.deleteAll();
        bookingRepository.deleteAll();
        slotRepository.deleteAll();
        specialistRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(user("client.integration@example.com", "Client User", User.Role.CLIENT));
        User specialistUser = userRepository.save(user("specialist.integration@example.com", "Specialist User", User.Role.SPECIALIST));
        User pendingSpecialistUser = userRepository.save(user("pending.integration@example.com", "Pending Specialist", User.Role.SPECIALIST));
        userRepository.save(user("admin.integration@example.com", "Admin User", User.Role.ADMIN));

        Specialist specialist = specialistRepository.save(activeSpecialist(specialistUser));
        pendingSpecialist = specialistRepository.save(pendingSpecialist(pendingSpecialistUser));
        availableSlot = slotRepository.save(slot(specialist));
    }

    protected String login(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", PASSWORD))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("token").asText();
    }

    protected String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    protected static String bearer(String token) {
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

    private static Specialist activeSpecialist(User user) {
        Specialist specialist = new Specialist();
        specialist.setUser(user);
        specialist.setName("Integration Specialist");
        specialist.setSpecialty("General Consultation");
        specialist.setQualificationLevel("Senior");
        specialist.setBio("Specialist used by integration test");
        specialist.setPriceAmount(new BigDecimal("200.00"));
        specialist.setStatus(Specialist.Status.ACTIVE);
        return specialist;
    }

    private static Specialist pendingSpecialist(User user) {
        Specialist specialist = activeSpecialist(user);
        specialist.setName("Pending Integration Specialist");
        specialist.setStatus(Specialist.Status.PENDING);
        return specialist;
    }

    private static Slot slot(Specialist specialist) {
        Slot slot = new Slot();
        slot.setSpecialist(specialist);
        slot.setSlotDate(LocalDate.now().plusDays(10));
        slot.setStartTime(LocalTime.of(10, 0));
        slot.setEndTime(LocalTime.of(11, 0));
        slot.setStatus(Slot.Status.AVAILABLE);
        return slot;
    }
}
