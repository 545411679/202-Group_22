package com.grooming.pet.config;

import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Seeds demo data on every startup.
 * Passwords are BCrypt-encoded at runtime so they always match "Password123".
 * Uses "upsert-like" logic: update if exists, create if not.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final SpecialistRepository specialistRepo;
    private final CategoryRepository categoryRepo;
    private final SlotRepository slotRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepo,
                           SpecialistRepository specialistRepo,
                           CategoryRepository categoryRepo,
                           SlotRepository slotRepo,
                           PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.specialistRepo = specialistRepo;
        this.categoryRepo = categoryRepo;
        this.slotRepo = slotRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Encode once — reused for all seed users
        String pwd = passwordEncoder.encode("Password123");

        // ── Users ────────────────────────────────────────────────
        ensureUser("admin@example.com",         pwd, "System Admin",  User.Role.ADMIN,      User.Status.ACTIVE);
        User chen   = ensureUser("dr.chen@example.com",      pwd, "Dr. Wei Chen", User.Role.SPECIALIST, User.Status.ACTIVE);
        User miller = ensureUser("sarah.miller@example.com", pwd, "Sarah Miller", User.Role.SPECIALIST, User.Status.ACTIVE);
        User park   = ensureUser("james.park@example.com",   pwd, "James Park",   User.Role.SPECIALIST, User.Status.ACTIVE);
        User liu    = ensureUser("dr.liu@example.com",       pwd, "Dr. Fang Liu", User.Role.SPECIALIST, User.Status.ACTIVE);
        User hart   = ensureUser("emily.hart@example.com",   pwd, "Emily Hart",   User.Role.SPECIALIST, User.Status.ACTIVE);
        ensureUser("alice@example.com",  pwd, "Alice Wang", User.Role.CLIENT, User.Status.ACTIVE);
        ensureUser("bob@example.com",    pwd, "Bob Zhang",  User.Role.CLIENT, User.Status.ACTIVE);
        ensureUser("carol@example.com",  pwd, "Carol Lee",  User.Role.CLIENT, User.Status.ACTIVE);
        ensureUser("david@example.com",  pwd, "David Kim",  User.Role.CLIENT, User.Status.ACTIVE);

        // ── Categories ───────────────────────────────────────────
        ensureCategory("General Consultation");
        ensureCategory("Mental Health");
        ensureCategory("Nutrition & Diet");
        ensureCategory("Legal Advice");
        ensureCategory("Career Coaching");
        ensureCategory("Financial Planning");

        // ── Specialist profiles ──────────────────────────────────
        Specialist sp1 = ensureSpecialist(chen,   "Dr. Wei Chen",  "General Consultation", "Senior",
            "Board-certified physician with 12 years of clinical experience in internal medicine and preventive care. Fluent in English and Mandarin.",
            new BigDecimal("200.00"), Specialist.Status.ACTIVE);
        Specialist sp2 = ensureSpecialist(miller, "Sarah Miller",  "Mental Health", "Expert",
            "Licensed clinical psychologist specialising in anxiety, depression, and stress management. CBT and mindfulness-based practitioner.",
            new BigDecimal("280.00"), Specialist.Status.ACTIVE);
        Specialist sp3 = ensureSpecialist(park,   "James Park",    "Career Coaching", "Senior",
            "Certified executive coach with a background in HR leadership at Fortune 500 companies. Specialises in career transitions and leadership development.",
            new BigDecimal("350.00"), Specialist.Status.ACTIVE);
        Specialist sp4 = ensureSpecialist(liu,    "Dr. Fang Liu",  "Nutrition & Diet", "Intermediate",
            "Registered dietitian focused on evidence-based nutrition for weight management, sports performance, and chronic disease prevention.",
            new BigDecimal("150.00"), Specialist.Status.ACTIVE);
        Specialist sp5 = ensureSpecialist(hart,   "Emily Hart",    "Legal Advice", "Senior",
            "Practising solicitor with 8 years of experience in employment law and contract disputes. Provides initial consultation and document review.",
            new BigDecimal("400.00"), Specialist.Status.ACTIVE);

        // ── Slots ────────────────────────────────────────────────
        // Only seed if there are no slots yet (avoids duplicates on restart)
        if (slotRepo.count() == 0) {
            LocalDate d1 = LocalDate.now().plusDays(1);
            LocalDate d2 = LocalDate.now().plusDays(2);
            LocalDate d3 = LocalDate.now().plusDays(3);
            LocalDate d4 = LocalDate.now().plusDays(4);

            // Dr. Wei Chen
            addSlot(sp1, d1, "09:00", "10:00");
            addSlot(sp1, d1, "11:00", "12:00");
            addSlot(sp1, d2, "09:00", "10:00");
            addSlot(sp1, d2, "14:00", "15:00");
            addSlot(sp1, d3, "10:00", "11:00");

            // Sarah Miller
            addSlot(sp2, d1, "10:00", "11:00");
            addSlot(sp2, d1, "14:00", "15:00");
            addSlot(sp2, d2, "10:00", "11:00");
            addSlot(sp2, d3, "09:00", "10:00");

            // James Park
            addSlot(sp3, d1, "13:00", "14:00");
            addSlot(sp3, d2, "13:00", "14:00");
            addSlot(sp3, d3, "11:00", "12:00");

            // Dr. Fang Liu
            addSlot(sp4, d1, "08:00", "09:00");
            addSlot(sp4, d1, "16:00", "17:00");
            addSlot(sp4, d2, "08:00", "09:00");
            addSlot(sp4, d3, "14:00", "15:00");

            // Emily Hart
            addSlot(sp5, d2, "10:00", "11:00");
            addSlot(sp5, d2, "15:00", "16:00");
            addSlot(sp5, d3, "10:00", "11:00");
            addSlot(sp5, d4, "13:00", "14:00");
        }
    }

    /**
     * Find user by email; create if absent. Always updates the password hash
     * so demo accounts always work with "Password123" regardless of DB state.
     */
    private User ensureUser(String email, String encodedPassword, String name,
                            User.Role role, User.Status status) {
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole(role);
            user.setStatus(status);
        }
        user.setPasswordHash(encodedPassword);
        return userRepo.save(user);
    }

    private void ensureCategory(String name) {
        if (!categoryRepo.existsByName(name)) {
            categoryRepo.save(new Category(name));
        }
    }

    private Specialist ensureSpecialist(User user, String name, String specialty, String level,
                                        String bio, BigDecimal price, Specialist.Status status) {
        return specialistRepo.findByUser(user).orElseGet(() -> {
            Specialist sp = new Specialist();
            sp.setUser(user);
            sp.setName(name);
            sp.setSpecialty(specialty);
            sp.setQualificationLevel(level);
            sp.setBio(bio);
            sp.setPriceAmount(price);
            sp.setStatus(status);
            return specialistRepo.save(sp);
        });
    }

    private void addSlot(Specialist specialist, LocalDate date, String start, String end) {
        Slot slot = new Slot();
        slot.setSpecialist(specialist);
        slot.setSlotDate(date);
        slot.setStartTime(LocalTime.parse(start));
        slot.setEndTime(LocalTime.parse(end));
        slot.setStatus(Slot.Status.AVAILABLE);
        slotRepo.save(slot);
    }
}
