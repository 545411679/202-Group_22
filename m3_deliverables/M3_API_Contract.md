# M3 API Contract (Final Alignment Draft for M4/M5/M6)

## 0) Team decisions frozen in this contract
- Role enum is unified as: `CUSTOMER`, `SPECIALIST`, `ADMIN`
- Advance booking window is fixed at: `14 days`
- On `CANCELLED`: slot returns to `AVAILABLE` by default, then specialist may choose:
  - keep it `AVAILABLE`
  - mark it `UNAVAILABLE`
  - delete it (if all delete preconditions are met)
- On `REJECTED`: slot returns to `AVAILABLE` by default (same handling as `CANCELLED`)

## 1) Create Slot (M3 PBI1, PBI2, PBI3)
- **POST** `/api/specialists/{specialistId}/slots`
- **Auth**: Specialist only (self)
- **Request**
```json
{
  "slotDate": "2026-04-15",
  "startTime": "09:00",
  "endTime": "09:30"
}
```
- **Success 201**
```json
{
  "id": 1001,
  "specialistId": 301,
  "slotDate": "2026-04-15",
  "startTime": "09:00",
  "endTime": "09:30",
  "status": "AVAILABLE"
}
```
- **Business errors**
  - `400 INVALID_INPUT_PAST_DATE`
  - `400 INVALID_INPUT_END_BEFORE_START`
  - `400 INVALID_INPUT_MIN_DURATION`
  - `400 INVALID_INPUT_ADVANCE_WINDOW`
  - `409 SLOT_OVERLAP_CONFLICT`

## 2) List Specialist Slots by Date (M3->M4/M5)
- **GET** `/api/specialists/{specialistId}/slots?date=2026-04-15&status=AVAILABLE`
- **Auth**: Public for customer browsing, specialist self, admin
- **Success 200**
```json
{
  "specialistId": 301,
  "date": "2026-04-15",
  "slots": [
    {
      "slotId": 1001,
      "startTime": "09:00",
      "endTime": "09:30",
      "slotStatus": "AVAILABLE",
      "bookingStatus": null,
      "customerName": null
    }
  ]
}
```

## 3) Delete Slot (M3 PBI5)
- **DELETE** `/api/specialists/{specialistId}/slots/{slotId}`
- **Auth**: Specialist only (self)
- **Success 204**: deleted
- **Business errors**
  - `403 FORBIDDEN_ROLE_OR_OWNER`
  - `409 SLOT_BOOKED_CANNOT_DELETE` (linked booking in `PENDING/CONFIRMED`)
  - `404 SLOT_NOT_FOUND`

## 4) Mark Slot Unavailable (M3 PBI5)
- **PATCH** `/api/specialists/{specialistId}/slots/{slotId}/unavailable`
- **Auth**: Specialist only (self)
- **Success 200**
```json
{
  "slotId": 1001,
  "status": "UNAVAILABLE"
}
```
- **Business errors**
  - `403 FORBIDDEN_ROLE_OR_OWNER`
  - `409 SLOT_BOOKED_CANNOT_MARK_UNAVAILABLE`
  - `404 SLOT_NOT_FOUND`

## 5) M6 update feedback to M3 (lifecycle sync)
- When booking status changes, M6 should notify or update in shared transaction:
  - `PENDING/CONFIRMED`: slot is non-removable / non-markable
  - `CANCELLED/REJECTED`: slot auto-returns to `AVAILABLE`
  - `COMPLETED`: slot remains historical and non-bookable

## 6) Slot lifecycle matrix (agreed)
| Booking status | Slot operation rule |
| :--- | :--- |
| `PENDING` | Slot cannot be deleted or marked unavailable |
| `CONFIRMED` | Slot cannot be deleted or marked unavailable |
| `CANCELLED` | Slot returns to `AVAILABLE`; specialist can keep/mark unavailable/delete |
| `REJECTED` | Slot returns to `AVAILABLE`; specialist can keep/mark unavailable/delete |
| `COMPLETED` | Slot is historical and non-bookable |

## 7) Notes for frontend and testing
- Customer-facing wording should use "Customer" (not "Client")
- Boundary tests for advance window must include:
  - `today + 14 days` -> allowed
  - `today + 15 days` -> rejected with `INVALID_INPUT_ADVANCE_WINDOW`
