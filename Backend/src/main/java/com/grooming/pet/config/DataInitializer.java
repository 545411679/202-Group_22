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
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final SpecialistRepository specialistRepo;
    private final CategoryRepository categoryRepo;
    private final SlotRepository slotRepo;
    private final BookingRepository bookingRepo;
    private final BookingSlotRepository bookingSlotRepo;
    private final ReviewRepository reviewRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepo,
                           SpecialistRepository specialistRepo,
                           CategoryRepository categoryRepo,
                           SlotRepository slotRepo,
                           BookingRepository bookingRepo,
                           BookingSlotRepository bookingSlotRepo,
                           ReviewRepository reviewRepo,
                           PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.specialistRepo = specialistRepo;
        this.categoryRepo = categoryRepo;
        this.slotRepo = slotRepo;
        this.bookingRepo = bookingRepo;
        this.bookingSlotRepo = bookingSlotRepo;
        this.reviewRepo = reviewRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String pwd = passwordEncoder.encode("Password123");

        // ── Users ────────────────────────────────────────────────
        ensureUser("admin@example.com",         pwd, "System Admin",  User.Role.ADMIN,      User.Status.ACTIVE);
        User chen   = ensureUser("dr.chen@example.com",      pwd, "Dr. Wei Chen", User.Role.SPECIALIST, User.Status.ACTIVE);
        User miller = ensureUser("sarah.miller@example.com", pwd, "Sarah Miller", User.Role.SPECIALIST, User.Status.ACTIVE);
        User park   = ensureUser("james.park@example.com",   pwd, "James Park",   User.Role.SPECIALIST, User.Status.ACTIVE);
        User liu    = ensureUser("dr.liu@example.com",       pwd, "Dr. Fang Liu", User.Role.SPECIALIST, User.Status.ACTIVE);
        User hart   = ensureUser("emily.hart@example.com",   pwd, "Emily Hart",   User.Role.SPECIALIST, User.Status.ACTIVE);
        User alice  = ensureUser("alice@example.com",  pwd, "Alice Wang", User.Role.CLIENT, User.Status.ACTIVE);
        User bob    = ensureUser("bob@example.com",    pwd, "Bob Zhang",  User.Role.CLIENT, User.Status.ACTIVE);
        User carol  = ensureUser("carol@example.com",  pwd, "Carol Lee",  User.Role.CLIENT, User.Status.ACTIVE);
        User david  = ensureUser("david@example.com",  pwd, "David Kim",  User.Role.CLIENT, User.Status.ACTIVE);
        User emma   = ensureUser("emma@example.com",   pwd, "Emma Liu",   User.Role.CLIENT, User.Status.ACTIVE);
        User frank  = ensureUser("frank@example.com",  pwd, "Frank Sun",  User.Role.CLIENT, User.Status.ACTIVE);

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

        // ── Future slots (available for booking) ─────────────────
        if (slotRepo.findBySpecialistAndStatus(sp1, Slot.Status.AVAILABLE).isEmpty()) {
            LocalDate d1 = LocalDate.now().plusDays(1);
            LocalDate d2 = LocalDate.now().plusDays(2);
            LocalDate d3 = LocalDate.now().plusDays(3);
            LocalDate d4 = LocalDate.now().plusDays(4);

            addSlot(sp1, d1, "09:00", "10:00");
            addSlot(sp1, d1, "11:00", "12:00");
            addSlot(sp1, d2, "09:00", "10:00");
            addSlot(sp1, d2, "14:00", "15:00");
            addSlot(sp1, d3, "10:00", "11:00");

            addSlot(sp2, d1, "10:00", "11:00");
            addSlot(sp2, d1, "14:00", "15:00");
            addSlot(sp2, d2, "10:00", "11:00");
            addSlot(sp2, d3, "09:00", "10:00");

            addSlot(sp3, d1, "13:00", "14:00");
            addSlot(sp3, d2, "13:00", "14:00");
            addSlot(sp3, d3, "11:00", "12:00");

            addSlot(sp4, d1, "08:00", "09:00");
            addSlot(sp4, d1, "16:00", "17:00");
            addSlot(sp4, d2, "08:00", "09:00");
            addSlot(sp4, d3, "14:00", "15:00");

            addSlot(sp5, d2, "10:00", "11:00");
            addSlot(sp5, d2, "15:00", "16:00");
            addSlot(sp5, d3, "10:00", "11:00");
            addSlot(sp5, d4, "13:00", "14:00");
        }

        // ── Historical bookings + reviews ────────────────────────
        // Guard: check for a unique topic that only exists in the rich seed block.
        // This is idempotent — runs once even when old sparse bookings already exist.
        if (!bookingRepo.existsByTopic("Annual health checkup")) {

            // — Reviewed bookings (REVIEWED status, all have a review) —
            Booking b01 = booking(alice, sp1, LocalDate.now().minusDays(30), "09:00", "10:00",
                "alice@example.com", "Annual health checkup",
                "Please review recent blood test results.",
                "200.00", Booking.Status.REVIEWED, "ONLINE", "https://meet.example.com/chen-alice");
            review(b01, alice, sp1, 5, true,
                "Dr. Chen was incredibly thorough and patient. He explained everything clearly and I left feeling much more informed about my health.");

            Booking b02 = booking(bob, sp2, LocalDate.now().minusDays(28), "10:00", "11:00",
                "+86 139 0001 0001", "Anxiety management",
                "Ongoing anxiety since last month.",
                "280.00", Booking.Status.REVIEWED, "ONLINE", "https://zoom.us/j/12345678");
            review(b02, bob, sp2, 5, true,
                "Sarah is an exceptional psychologist. Her CBT techniques have already started helping me manage my anxiety. Highly recommend.");

            Booking b03 = booking(carol, sp3, LocalDate.now().minusDays(25), "13:00", "14:00",
                "carol@example.com", "Career transition advice",
                "Looking to switch from finance to tech.",
                "350.00", Booking.Status.REVIEWED, "OFFLINE", "Room 305, Tower A, CBD Business Centre");
            review(b03, carol, sp3, 4, true,
                "James gave very practical advice about transitioning into tech. The session was structured and he helped me build a clear roadmap.");

            Booking b04 = booking(david, sp4, LocalDate.now().minusDays(22), "08:00", "09:00",
                "+86 138 0002 0002", "Weight loss diet plan",
                "BMI is 27, need a structured plan.",
                "150.00", Booking.Status.REVIEWED, "ONLINE", "https://teams.microsoft.com/l/meetup/demo");
            review(b04, david, sp4, 4, true,
                "Dr. Liu provided a very detailed and personalised meal plan. The portion-control tips are easy to follow. Seeing results after 3 weeks!");

            Booking b05 = booking(emma, sp5, LocalDate.now().minusDays(20), "10:00", "11:00",
                "emma@example.com", "Employment contract review",
                "Non-compete clause added by employer.",
                "400.00", Booking.Status.REVIEWED, "OFFLINE", "Floor 8, Legal Tower, Suzhou SIP");
            review(b05, emma, sp5, 5, true,
                "Emily is extremely knowledgeable. She identified three clauses I should negotiate and drafted a response letter for me. Worth every yuan.");

            Booking b06 = booking(frank, sp2, LocalDate.now().minusDays(18), "14:00", "15:00",
                "frank@example.com", "Work-related stress",
                "Struggling with burnout and sleep issues.",
                "280.00", Booking.Status.REVIEWED, "ONLINE", "https://zoom.us/j/99887766");
            review(b06, frank, sp2, 5, true,
                "Sarah helped me reframe how I think about work pressure. Simple breathing techniques and journaling prompts have made a real difference.");

            Booking b07 = booking(alice, sp3, LocalDate.now().minusDays(15), "13:00", "14:00",
                "alice@example.com", "Interview preparation",
                "Preparing for senior product manager interview.",
                "350.00", Booking.Status.REVIEWED, "ONLINE", "https://meet.example.com/park-alice");
            review(b07, alice, sp3, 5, true,
                "James ran a mock interview and gave detailed feedback on my answers. I felt fully prepared on the actual day and got the offer!");

            Booking b08 = booking(bob, sp4, LocalDate.now().minusDays(14), "16:00", "17:00",
                "bob@example.com", "Sports nutrition plan",
                "Training for half-marathon, need fueling strategy.",
                "150.00", Booking.Status.REVIEWED, "ONLINE", "https://zoom.us/j/55443322");
            review(b08, bob, sp4, 4, false,
                "Good session. Got a solid pre-race and post-race nutrition plan. Felt she could have spent more time on supplement advice.");

            Booking b09 = booking(carol, sp1, LocalDate.now().minusDays(12), "11:00", "12:00",
                "carol@example.com", "Persistent headaches",
                "Frequent headaches over 2 months, unsure of cause.",
                "200.00", Booking.Status.REVIEWED, "ONLINE", "https://meet.example.com/chen-carol");
            review(b09, carol, sp1, 5, true,
                "Dr. Chen asked thorough questions and ordered the right tests. Turned out to be tension headaches — now managed with simple changes.");

            Booking b10 = booking(david, sp5, LocalDate.now().minusDays(10), "15:00", "16:00",
                "+86 138 0002 0002", "Landlord dispute",
                "Landlord refusing to return deposit.",
                "400.00", Booking.Status.REVIEWED, "OFFLINE", "Floor 8, Legal Tower, Suzhou SIP");
            review(b10, david, sp5, 4, true,
                "Emily gave clear and actionable steps. Wrote a formal demand letter template on the spot. Deposit was returned within the week.");

            Booking b11 = booking(emma, sp2, LocalDate.now().minusDays(8), "09:00", "10:00",
                "emma@example.com", "Relationship counselling",
                "Communication issues with partner.",
                "280.00", Booking.Status.REVIEWED, "ONLINE", "https://zoom.us/j/11223344");
            review(b11, emma, sp2, 5, true,
                "Sarah is warm, non-judgmental, and insightful. She gave us practical frameworks for communicating during disagreements. Life-changing session.");

            Booking b12 = booking(frank, sp3, LocalDate.now().minusDays(6), "13:00", "14:00",
                "frank@example.com", "Promotion negotiation",
                "Want to negotiate for a senior title.",
                "350.00", Booking.Status.REVIEWED, "OFFLINE", "Room 201, Innovation Hub");
            review(b12, frank, sp3, 4, true,
                "James helped me build a strong case using data from my projects. His negotiation script was exactly what I needed. Got the title bump!");

            // — Conducted (no review yet) —
            booking(alice, sp5, LocalDate.now().minusDays(4), "10:00", "11:00",
                "alice@example.com", "Startup equity agreement",
                "Co-founder equity split dispute.",
                "400.00", Booking.Status.CONDUCTED, "ONLINE", "https://zoom.us/j/66554433");

            booking(bob, sp1, LocalDate.now().minusDays(3), "09:00", "10:00",
                "+86 139 0001 0001", "Pre-employment medical",
                "Need fitness-to-work certificate.",
                "200.00", Booking.Status.CONDUCTED, "ONLINE", "https://meet.example.com/chen-bob");

            booking(carol, sp4, LocalDate.now().minusDays(2), "14:00", "15:00",
                "carol@example.com", "Postpartum nutrition",
                "Diet guidance for breastfeeding period.",
                "150.00", Booking.Status.CONDUCTED, "OFFLINE", "Room 101, Health Centre, Suzhou");

            // — Confirmed (upcoming) —
            booking(david, sp2, LocalDate.now().plusDays(2), "10:00", "11:00",
                "+86 138 0002 0002", "Depression management",
                "Feeling low for several weeks.",
                "280.00", Booking.Status.CONFIRMED, "ONLINE", "https://zoom.us/j/77665544");

            booking(emma, sp3, LocalDate.now().plusDays(3), "11:00", "12:00",
                "emma@example.com", "Career pivot to data science",
                "Currently a marketing analyst looking to switch.",
                "350.00", Booking.Status.CONFIRMED, "ONLINE", "https://meet.example.com/park-emma");

            // — Pending —
            booking(frank, sp1, LocalDate.now().plusDays(1), "11:00", "12:00",
                "frank@example.com", "General consultation",
                "Annual checkup request.",
                "200.00", Booking.Status.PENDING, null, null);

            booking(alice, sp4, LocalDate.now().plusDays(4), "16:00", "17:00",
                "alice@example.com", "Vegetarian diet planning",
                "Recently switched to plant-based diet.",
                "150.00", Booking.Status.PENDING, null, null);

            // — Cancelled —
            booking(bob, sp5, LocalDate.now().minusDays(35), "15:00", "16:00",
                "+86 139 0001 0001", "Contract review",
                "Freelance contract dispute.",
                "400.00", Booking.Status.CANCELLED, null, null);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────

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

    private Slot addSlot(Specialist specialist, LocalDate date, String start, String end) {
        LocalTime s = LocalTime.parse(start);
        return slotRepo.findBySpecialistAndSlotDate(specialist, date).stream()
                .filter(sl -> sl.getStartTime().equals(s))
                .findFirst()
                .orElseGet(() -> {
                    Slot slot = new Slot();
                    slot.setSpecialist(specialist);
                    slot.setSlotDate(date);
                    slot.setStartTime(s);
                    slot.setEndTime(LocalTime.parse(end));
                    slot.setStatus(Slot.Status.AVAILABLE);
                    return slotRepo.save(slot);
                });
    }

    private Slot pastSlot(Specialist specialist, LocalDate date, String start, String end) {
        LocalTime s = LocalTime.parse(start);
        return slotRepo.findBySpecialistAndSlotDate(specialist, date).stream()
                .filter(sl -> sl.getStartTime().equals(s))
                .findFirst()
                .orElseGet(() -> {
                    Slot slot = new Slot();
                    slot.setSpecialist(specialist);
                    slot.setSlotDate(date);
                    slot.setStartTime(s);
                    slot.setEndTime(LocalTime.parse(end));
                    slot.setStatus(Slot.Status.UNAVAILABLE);
                    return slotRepo.save(slot);
                });
    }

    private Booking booking(User customer, Specialist specialist,
                            LocalDate date, String start, String end,
                            String contact, String topic, String notes,
                            String fee, Booking.Status status,
                            String meetingType, String meetingInfo) {
        Slot slot = pastSlot(specialist, date, start, end);
        Booking b = new Booking();
        b.setCustomer(customer);
        b.setSpecialist(specialist);
        b.setContact(contact);
        b.setTopic(topic);
        b.setNotes(notes);
        b.setTotalFee(new BigDecimal(fee));
        b.setStatus(status);
        b.setMeetingType(meetingType);
        b.setMeetingInfo(meetingInfo);
        b = bookingRepo.save(b);
        bookingSlotRepo.save(new BookingSlot(b, slot));
        return b;
    }

    private void review(Booking booking, User customer, Specialist specialist,
                        int rating, boolean visible, String comment) {
        if (!reviewRepo.existsByBooking(booking)) {
            Review r = new Review();
            r.setBooking(booking);
            r.setCustomer(customer);
            r.setRating(rating);
            r.setComment(comment);
            r.setSpecialistName(specialist.getName());
            r.setSpecialty(specialist.getSpecialty());
            r.setVisible(visible);
            reviewRepo.save(r);
        }
    }
}
