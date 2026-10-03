# EventMesh — Testing Guide

## 1. Overview

This guide describes how the EventMesh backend was manually tested using FastAPI's interactive Swagger UI. No automated test suite is included in this submission; all testing described below was performed manually, directly against the running API.

## 2. Starting the Backend

```bash
uvicorn main:app --reload
```

Confirm the server is running at `http://127.0.0.1:8000`.

## 3. Opening Swagger

Navigate to:

```text
http://127.0.0.1:8000/docs
```

This provides an interactive view of every endpoint, with the ability to send requests directly from the browser.

## 4. Registering a User

1. Open `POST /auth/register`.
2. Provide a name, a valid email, and a password of at least 8 characters.
3. Execute the request and confirm a `201` response containing the new user's `id`, `name`, `email`, `role` (`student`), and `is_active`.

## 5. Logging In

1. Open `POST /auth/login`.
2. Provide the same email and password used to register.
3. Execute the request and confirm a `200` response containing an `access_token`.

## 6. Obtaining and Using JWT Authentication

1. Copy the `access_token` value from the login response.
2. Click the **Authorize** button in Swagger.
3. Enter the token (as `Bearer <access_token>` if prompted, or per Swagger's authorize dialog for this project).
4. Confirm that protected endpoints can now be called from the Swagger UI using this token.

## 7. Calling a Protected Endpoint

1. Open `GET /auth/me`.
2. Execute the request while authorized.
3. Confirm the response matches the currently logged-in user.

## 8. Creating an Organizer Event

Creating and managing events requires an Organizer account.

> Use the organizer account configured for local testing. Credentials should be obtained securely and must not be committed to the repository.

1. Log in as the organizer account and authorize Swagger with its token.
2. Open `POST /events/` and submit event details (title, category, location, date, price, status, etc.).
3. Confirm a `201` response containing the created event, with `organizer_id` set to the organizer's own ID.

## 9. Creating Ticket Tiers

1. Open `POST /ticket-tiers/`.
2. Submit the `event_id` of the organizer's own event, along with a tier name, price, and available quantity.
3. Confirm a `201` response containing the created ticket tier.

## 10. Booking Tickets

1. Log in and authorize as a student account (not the organizer).
2. Open `POST /bookings/`.
3. Submit the `ticket_tier_id` of a published event's ticket tier, with a valid `quantity`.
4. Confirm a `201` response containing the booking, including `price_per_ticket`, `total_amount`, and `status: confirmed`.

## 11. Checking Bookings

1. Open `GET /bookings/me` while authorized as the student.
2. Confirm the booking created in the previous step appears in the response.

## 12. Checking Generated Tickets

1. Open `GET /tickets/me` while authorized as the student.
2. Confirm that one ticket exists per unit of quantity booked, each with a unique `ticket_code` and `status: active`.
3. Open `GET /tickets/{ticket_id}` for one of the returned ticket IDs and confirm the same ticket is returned.

## 13. Performing Organizer Ticket Check-In

1. Log in and authorize as the organizer who owns the event the ticket belongs to.
2. Open `POST /tickets/check-in` and submit the `ticket_code` from a previously booked ticket.
3. Confirm a `200` response with `status: used` and a populated `checked_in_at` timestamp.

## 14. Testing Validation Errors

Submit intentionally invalid data (e.g. an out-of-range booking `quantity`) to endpoints and confirm a `422` response is returned, as documented in Section 15 below.

## 15. Testing Authorization Errors

Call a protected or role-restricted endpoint without a token, or while logged in as a user without the required role, and confirm the expected `401` or `403` response, as documented below.

## 16. Testing Draft Event Booking

Attempt to book a ticket tier belonging to a draft (unpublished) event and confirm the expected `400` response, as documented below.

## 17. Testing Past Event Booking

Attempt to book a ticket tier belonging to an event whose date has already passed and confirm the expected `400` response, as documented below.

## 18. Testing Insufficient Ticket Stock

Attempt to book a quantity greater than a ticket tier's `available_quantity` and confirm the expected `400` response.

## 19. Testing Duplicate Ticket Tier Protection

Attempt to create a second ticket tier with the same name under the same event and confirm it is rejected.

## 20. Final End-to-End Verification

Confirm the full flow works in sequence: register → login → organizer creates event → organizer creates ticket tier → student books → tickets are generated → student views bookings/tickets → organizer checks a ticket in.

---

## 21. Test Results

All tests below were actually performed against the running backend via Swagger. Results marked **PASS** reflect the behavior actually observed.

### Authentication Tests

| # | Test | Result |
|---|---|---|
| 1 | User registration | PASS |
| 2 | User login | PASS |
| 3 | JWT authentication | PASS |
| 4 | `GET /auth/me` | PASS |

### Event Tests

| # | Test | Result |
|---|---|---|
| 5 | Event creation | PASS |
| 6 | Event retrieval | PASS |
| 7 | Event update | PASS |
| 8 | Event deletion | PASS |
| 9 | Organizer ownership / authorization | PASS |
| 10 | Published / draft event behavior | PASS |

### Ticket Tier Tests

| # | Test | Result |
|---|---|---|
| 11 | Create ticket tier | PASS |
| 12 | List ticket tiers | PASS |
| 13 | Update ticket tier | PASS |
| 14 | Delete ticket tier | PASS |
| 15 | Duplicate ticket tier protection | PASS — a duplicate ticket tier for the same event was rejected by the database's unique constraint |

### Booking Tests

| # | Test | Expected | Result |
|---|---|---|---|
| 16 | Successful booking | `201` | PASS |
| 17 | `GET /bookings/me` | `200` | PASS |
| 18 | Booking with `quantity = 11` | `422` validation error | PASS |
| 19 | Booking with `quantity = 0` | `422` validation error | PASS |
| 20 | Booking with `quantity = -1` | `422` validation error | PASS |
| 21 | Booking a non-existent ticket tier | `404` | PASS |
| 22 | Booking with insufficient ticket stock | `400` | PASS |

### Ticket Generation Tests

| # | Test | Result |
|---|---|---|
| 23 | Automatic ticket generation after booking | PASS |
| 24 | `GET /tickets/me` | PASS |
| 25 | Individual ticket retrieval | PASS |

### Ticket Check-In Tests

| # | Test | Result |
|---|---|---|
| 26 | Organizer ticket check-in | PASS |
| 27 | Ticket status changes to `used` after check-in | PASS |
| 28 | Check-in timestamp is recorded | PASS |

### Event Booking Validation Tests

| # | Test | Event / Tier Used | Expected | Result |
|---|---|---|---|---|
| 29 | Booking a draft/unpublished event | Draft event ID 5, draft ticket tier ID 6 | `400` — "This event is not available for booking" | PASS |
| 30 | Booking a past event | Past event ID 6, past ticket tier ID 7 | `400` — "This event has already started" | PASS |

> **Note:** During testing, a separate booking attempt was made against a ticket tier belonging to a published event by accident. That attempt is not a draft-event test and is not counted as one; it is excluded from the results above. The draft-event and past-event results listed are from the dedicated tests run against event ID 5 / tier ID 6, and event ID 6 / tier ID 7, respectively.

### Authorization Tests

| # | Test | Expected | Result |
|---|---|---|---|
| 31 | Unauthenticated access to a protected endpoint | `401` | PASS |
| 32 | Student attempting organizer-only ticket check-in | `403` | PASS |

---

## 22. Features Not Tested

- No automated/scripted test suite was run; all tests above were performed manually through Swagger.
- Load testing, performance testing, and concurrency testing were not performed.
- Frontend integration testing is outside the scope of this backend testing guide.
