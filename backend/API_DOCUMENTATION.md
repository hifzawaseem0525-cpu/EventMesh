# EventMesh API Documentation

## 1. API Overview

EventMesh exposes a RESTful JSON API for an event management system. It supports two roles — **Student** and **Organizer** — with role-based access to event management, ticket tier management, booking, and ticket check-in functionality.

## 2. Base URL

```text
http://127.0.0.1:8000
```

## 3. Authentication

Authentication is handled using JWT access tokens.

1. Obtain a token by logging in via `POST /auth/login`.
2. Include the token on every request to a protected endpoint using the header:

```text
Authorization: Bearer <access_token>
```

Requests to protected endpoints without a valid token receive a `401 Unauthorized` response.

## 4. Authorization

Two roles exist:

- **Student** — the default role assigned at registration. Students can view published events, book tickets, and view their own bookings and tickets.
- **Organizer** — a role used for managing events. Organizers can create, update, and delete their own events and ticket tiers, and check students into their events.

Endpoints restricted to the Organizer role additionally verify **ownership**: an organizer may only modify or delete events and ticket tiers that they themselves created. Attempting to act on another organizer's resource returns `403 Forbidden`.

Role-restricted endpoints return `403 Forbidden` if the authenticated user does not have the required role or ownership.

## 5. Endpoint List

| Method | Endpoint | Auth Required | Role |
|---|---|---|---|
| POST | `/auth/register` | No | Public |
| POST | `/auth/login` | No | Public |
| GET | `/auth/me` | Yes | Authenticated User |
| GET | `/events/` | No | Public |
| POST | `/events/` | Yes | Organizer |
| GET | `/events/{event_id}` | No | Public |
| PUT | `/events/{event_id}` | Yes | Organizer (owner) |
| DELETE | `/events/{event_id}` | Yes | Organizer (owner) |
| GET | `/ticket-tiers/event/{event_id}` | No | Public |
| POST | `/ticket-tiers/` | Yes | Organizer (owner of event) |
| PUT | `/ticket-tiers/{tier_id}` | Yes | Organizer (owner of event) |
| DELETE | `/ticket-tiers/{tier_id}` | Yes | Organizer (owner of event) |
| POST | `/bookings/` | Yes | Authenticated User (Student) |
| GET | `/bookings/me` | Yes | Authenticated User |
| GET | `/tickets/me` | Yes | Authenticated User |
| GET | `/tickets/{ticket_id}` | Yes | Authenticated User (owner) |
| GET | `/tickets/{ticket_id}/qr` | Yes | Authenticated User (owner) |
| POST | `/tickets/check-in` | Yes | Organizer (owner of event) |
| GET | `/` | No | Public |

---

## 6. Authentication Endpoints

### Register User

**Method:** POST
**Endpoint:** `/auth/register`
**Authentication:** Not required
**Role:** Public

**Purpose:** Registers a new user. All registrations are created with the Student role; organizer accounts are not created through public registration.

**Request Body:**

```json
{
  "name": "string (1–100 characters)",
  "email": "valid email address",
  "password": "string (8–128 characters)"
}
```

**Successful Response (201 Created):**

```json
{
  "id": 1,
  "name": "string",
  "email": "user@example.com",
  "role": "student",
  "is_active": true
}
```

**Possible Errors:**

- `400 Bad Request` — email is already registered
- `422 Unprocessable Entity` — request body fails validation (e.g. missing fields, password too short, invalid email format)

---

### Login

**Method:** POST
**Endpoint:** `/auth/login`
**Authentication:** Not required
**Role:** Public

**Purpose:** Authenticates a user and issues a JWT access token.

**Request Body:**

```json
{
  "email": "valid email address",
  "password": "string"
}
```

**Successful Response (200 OK):**

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user_id": 1,
  "name": "string",
  "email": "user@example.com",
  "role": "student"
}
```

> This response is returned as a plain JSON object; it does not use a formal Pydantic `response_model`.

**Possible Errors:**

- `401 Unauthorized` — invalid email or password
- `403 Forbidden` — user account is inactive
- `422 Unprocessable Entity` — request body fails validation

---

### Get Current User

**Method:** GET
**Endpoint:** `/auth/me`
**Authentication:** Required
**Role:** Authenticated User

**Purpose:** Returns the profile of the currently authenticated user, based on the provided JWT access token.

**Successful Response (200 OK):**

```json
{
  "id": 1,
  "name": "string",
  "email": "user@example.com",
  "role": "student"
}
```

> This endpoint does not use an explicit `response_model` and does **not** return `is_active`. Its response is a subset of the `UserResponse` schema, not the full schema — `UserResponse` itself (with `is_active` included) is used by `POST /auth/register`, which does use it as a formal response model.

**Possible Errors:**

- `401 Unauthorized` — missing or invalid token

---

## 7. Event Endpoints

### List Events

**Method:** GET
**Endpoint:** `/events/`
**Authentication:** Not required
**Role:** Public

**Purpose:** Returns all published events.

**Successful Response (200 OK):** Array of Event objects (see Event Response fields below).

---

### Create Event

**Method:** POST
**Endpoint:** `/events/`
**Authentication:** Required
**Role:** Organizer

**Purpose:** Creates a new event owned by the authenticated organizer.

**Request Body:**

```json
{
  "title": "string",
  "description": "string or null",
  "category": "string",
  "location": "string",
  "date": "ISO 8601 datetime",
  "price": "decimal, >= 0",
  "image": "string or null",
  "status": "draft | published | completed | cancelled"
}
```

**Successful Response (201 Created):** Event object, including `organizer_id` set to the authenticated organizer.

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated user is not an organizer
- `422 Unprocessable Entity` — request body fails validation

---

### Get Event by ID

**Method:** GET
**Endpoint:** `/events/{event_id}`
**Authentication:** Not required
**Role:** Public

**Purpose:** Returns a single event by its ID.

**Successful Response (200 OK):** Event object.

**Possible Errors:**

- `404 Not Found` — event does not exist

---

### Update Event

**Method:** PUT
**Endpoint:** `/events/{event_id}`
**Authentication:** Required
**Role:** Organizer (must own the event)

**Purpose:** Updates an existing event.

**Request Body:** Same structure as Create Event.

**Successful Response (200 OK):** Updated Event object.

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated organizer does not own this event
- `404 Not Found` — event does not exist
- `422 Unprocessable Entity` — request body fails validation

---

### Delete Event

**Method:** DELETE
**Endpoint:** `/events/{event_id}`
**Authentication:** Required
**Role:** Organizer (must own the event)

**Purpose:** Deletes an event.

**Successful Response:** `204 No Content`

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated organizer does not own this event
- `404 Not Found` — event does not exist

---

### Event Response Fields

```json
{
  "id": 1,
  "title": "string",
  "description": "string or null",
  "category": "string",
  "location": "string",
  "date": "ISO 8601 datetime",
  "price": "decimal",
  "image": "string or null",
  "status": "draft | published | completed | cancelled",
  "organizer_id": 1
}
```

---

## 8. Ticket Tier Endpoints

### List Ticket Tiers for an Event

**Method:** GET
**Endpoint:** `/ticket-tiers/event/{event_id}`
**Authentication:** Not required
**Role:** Public

**Purpose:** Returns all ticket tiers belonging to a given event.

**Successful Response (200 OK):** Array of Ticket Tier objects.

**Possible Errors:**

- `404 Not Found` — event does not exist

---

### Create Ticket Tier

**Method:** POST
**Endpoint:** `/ticket-tiers/`
**Authentication:** Required
**Role:** Organizer (must own the event the tier belongs to)

**Purpose:** Creates a new ticket tier for an event.

**Request Body:**

```json
{
  "event_id": 1,
  "name": "string (1–100 characters)",
  "price": "decimal, >= 0",
  "available_quantity": "integer, >= 0"
}
```

**Successful Response (201 Created):** Ticket Tier object.

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated organizer does not own the referenced event
- `404 Not Found` — referenced event does not exist
- `422 Unprocessable Entity` — request body fails validation
- `400 Bad Request` — a duplicate ticket tier (same name for the same event) is rejected by a database uniqueness constraint

---

### Update Ticket Tier

**Method:** PUT
**Endpoint:** `/ticket-tiers/{tier_id}`
**Authentication:** Required
**Role:** Organizer (must own the event the tier belongs to)

**Purpose:** Updates an existing ticket tier.

**Request Body:** Same structure as Create Ticket Tier.

**Successful Response (200 OK):** Updated Ticket Tier object.

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated organizer does not own this ticket tier's event
- `404 Not Found` — ticket tier does not exist
- `400 Bad Request` — attempting to reassign the tier to a different event
- `422 Unprocessable Entity` — request body fails validation

---

### Delete Ticket Tier

**Method:** DELETE
**Endpoint:** `/ticket-tiers/{tier_id}`
**Authentication:** Required
**Role:** Organizer (must own the event the tier belongs to)

**Purpose:** Deletes a ticket tier.

**Successful Response:** `204 No Content`

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated organizer does not own this ticket tier's event
- `404 Not Found` — ticket tier does not exist

---

### Ticket Tier Response Fields

```json
{
  "id": 1,
  "event_id": 1,
  "name": "string",
  "price": "decimal",
  "available_quantity": 0
}
```

---

## 9. Booking Endpoints

### Create Booking

**Method:** POST
**Endpoint:** `/bookings/`
**Authentication:** Required
**Role:** Authenticated User (Student)

**Purpose:** Books tickets from a given ticket tier for the authenticated user.

**Request Body:**

```json
{
  "ticket_tier_id": 1,
  "quantity": 1
}
```

**Validation rules:**

- `ticket_tier_id` must be greater than 0
- `quantity` must be greater than 0 and no more than 10

**Successful Response (201 Created):**

```json
{
  "id": 1,
  "user_id": 1,
  "event_id": 1,
  "ticket_tier_id": 1,
  "quantity": 1,
  "price_per_ticket": "decimal",
  "total_amount": "decimal",
  "status": "confirmed",
  "created_at": "ISO 8601 datetime"
}
```

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `404 Not Found` — ticket tier or its event does not exist
- `400 Bad Request` — event is not published ("This event is not available for booking")
- `400 Bad Request` — event has already started ("This event has already started")
- `400 Bad Request` — insufficient ticket availability for the requested quantity
- `422 Unprocessable Entity` — `quantity` is 0, negative, or greater than 10, or `ticket_tier_id` is not valid

---

### Get My Bookings

**Method:** GET
**Endpoint:** `/bookings/me`
**Authentication:** Required
**Role:** Authenticated User

**Purpose:** Returns all bookings belonging to the authenticated user, newest first.

**Successful Response (200 OK):** Array of Booking objects (same structure as the Create Booking response).

**Possible Errors:**

- `401 Unauthorized` — not authenticated

---

## 10. Ticket Endpoints

### Get My Tickets

**Method:** GET
**Endpoint:** `/tickets/me`
**Authentication:** Required
**Role:** Authenticated User

**Purpose:** Returns all tickets belonging to the authenticated user, across all of their bookings, newest first.

**Successful Response (200 OK):** Array of Ticket objects (see Ticket Response fields below).

**Possible Errors:**

- `401 Unauthorized` — not authenticated

---

### Get Individual Ticket

**Method:** GET
**Endpoint:** `/tickets/{ticket_id}`
**Authentication:** Required
**Role:** Authenticated User (must own the ticket)

**Purpose:** Returns a single ticket, provided it belongs to the authenticated user.

**Successful Response (200 OK):** Ticket object.

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `404 Not Found` — ticket does not exist or does not belong to the authenticated user

---

### Get Ticket QR

**Method:** GET
**Endpoint:** `/tickets/{ticket_id}/qr`
**Authentication:** Required
**Role:** Authenticated User (must own the ticket)

**Purpose:** Returns a QR code image representation of the ticket, for presentation at check-in.

**Successful Response:** `200 OK` — image content

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `404 Not Found` — ticket does not exist or does not belong to the authenticated user

> This endpoint provides a QR code image generated by the backend. It does not include a frontend QR-scanning interface or scanning hardware.

---

### Ticket Check-In

**Method:** POST
**Endpoint:** `/tickets/check-in`
**Authentication:** Required
**Role:** Organizer (must own the event associated with the ticket)

**Purpose:** Checks a student into the event by validating their ticket code, marking the ticket as used.

**Request Body:**

```json
{
  "ticket_code": "string"
}
```

**Successful Response (200 OK):** Ticket object, with `status` now `"used"` and `checked_in_at` set to the check-in time.

**Possible Errors:**

- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated user is not the organizer of this ticket's event
- `404 Not Found` — ticket (or its booking/event) does not exist
- `400 Bad Request` — ticket has already been used or cancelled

---

### Ticket Response Fields

```json
{
  "id": 1,
  "booking_id": 1,
  "sequence": 1,
  "ticket_code": "string",
  "status": "active | used | cancelled",
  "checked_in_at": "ISO 8601 datetime or null",
  "created_at": "ISO 8601 datetime"
}
```

---

## 11. Default Endpoint

### Root

**Method:** GET
**Endpoint:** `/`
**Authentication:** Not required
**Role:** Public

**Purpose:** Basic health check confirming the API is running.

**Successful Response (200 OK):**

```json
{
  "message": "EventMesh API is running"
}
```

---

## 12. Booking Flow

1. An authenticated user submits a ticket tier ID and a quantity.
2. The backend verifies the ticket tier exists.
3. The backend retrieves the associated event and verifies it exists.
4. The backend verifies the event's status is `published`.
5. The backend verifies the event has not already started.
6. The backend verifies the ticket tier has sufficient available quantity.
7. The available quantity on the ticket tier is reduced.
8. The price per ticket is taken from the ticket tier at the time of booking.
9. The total amount is calculated from the price and quantity.
10. A booking record is created with status `confirmed`.
11. Tickets are automatically generated (see Ticket Generation Flow below).
12. The transaction is committed.
13. The booking is returned in the response.

## 13. Ticket Generation Flow

Immediately after a booking is created, one ticket is generated for each unit of the booked quantity. Each ticket is assigned a sequence number within the booking and a unique, randomly generated ticket code used for check-in and QR generation. All generated tickets start with status `active`.

## 14. Ticket Check-In Flow

1. An organizer submits a ticket code.
2. The backend locates the ticket by its code.
3. The backend retrieves the associated booking and event.
4. The backend verifies that the authenticated organizer owns the event.
5. The backend verifies the ticket's status is `active`.
6. The ticket's status is changed to `used`.
7. The check-in timestamp is recorded on the ticket.
8. The updated ticket is returned in the response.

## 15. Swagger / OpenAPI Documentation

Interactive documentation, generated automatically by FastAPI from the implemented endpoints and schemas, is available at:

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI schema (JSON): `http://127.0.0.1:8000/openapi.json`

## 16. Schema Reference

The following Pydantic schemas are used across the API:

| Schema | Used By |
|---|---|
| `UserCreate` | `POST /auth/register` (request) |
| `UserLogin` | `POST /auth/login` (request) |
| `UserResponse` | `POST /auth/register` (response, as a formal `response_model`) — **not** used by `GET /auth/me`, which returns a plain object with only `id`, `name`, `email`, `role` (no `is_active`) |
| `EventCreate` | `POST /events/`, `PUT /events/{event_id}` (request) |
| `EventResponse` | Event endpoints (response) |
| `TicketTierCreate` | `POST /ticket-tiers/`, `PUT /ticket-tiers/{tier_id}` (request) |
| `TicketTierResponse` | Ticket tier endpoints (response) |
| `BookingCreate` | `POST /bookings/` (request) |
| `BookingResponse` | Booking endpoints (response) |
| `TicketCheckIn` | `POST /tickets/check-in` (request) |
| `TicketResponse` | Ticket endpoints (response) |
| `HTTPValidationError` / `ValidationError` | Automatically returned by FastAPI on `422` validation failures |
