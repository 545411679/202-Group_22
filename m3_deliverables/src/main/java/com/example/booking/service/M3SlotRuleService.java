package com.example.booking.service;

import com.example.booking.enums.BookingStatus;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class M3SlotRuleService {

    // Team-configurable advance booking window. Aligned with current team decision: 14 days.
    private static final int DEFAULT_ADVANCE_WINDOW_DAYS = 14;

    public void validateSlotInput(LocalDate slotDate, LocalTime startTime, LocalTime endTime) {
        if (slotDate == null || startTime == null || endTime == null) {
            throw new IllegalArgumentException("Incorrect input: date, startTime and endTime are required");
        }

        if (slotDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Incorrect input: Please select a future date");
        }

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Incorrect input: End time must be later than start time");
        }

        long minutes = Duration.between(startTime, endTime).toMinutes();
        if (minutes < 30) {
            throw new IllegalArgumentException(
                    "Incorrect input: The minimum duration for a consultation slot is 30 minutes"
            );
        }

        LocalDate maxAllowedDate = LocalDate.now().plusDays(DEFAULT_ADVANCE_WINDOW_DAYS);
        if (slotDate.isAfter(maxAllowedDate)) {
            throw new IllegalArgumentException(
                    "Incorrect input: Please select a date within the allowed advance booking window"
            );
        }
    }

    public void validateNoOverlap(boolean overlapExists) {
        if (overlapExists) {
            throw new IllegalArgumentException(
                    "Incorrect time slot: The time conflicts with an existing slot."
            );
        }
    }

    public void validateSlotCanBeModified(Set<BookingStatus> linkedBookingStatuses) {
        if (linkedBookingStatuses == null || linkedBookingStatuses.isEmpty()) {
            return;
        }
        if (linkedBookingStatuses.contains(BookingStatus.PENDING)
                || linkedBookingStatuses.contains(BookingStatus.CONFIRMED)) {
            throw new IllegalStateException(
                    "Operation blocked: booked slots cannot be removed or marked unavailable"
            );
        }
    }
}
