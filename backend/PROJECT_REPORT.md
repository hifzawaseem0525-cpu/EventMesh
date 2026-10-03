# EventMesh — Backend Internship Project Report

## 1. Title

EventMesh — Backend REST API for an Event Management System

## 2. Abstract

EventMesh is a backend REST API built for an event management system, developed as a backend internship assignment. It provides authentication, role-based authorization, event management, ticket tier management, a ticket booking system with automatic ticket generation, and organizer-side ticket check-in. The backend was built using Python, FastAPI, SQLAlchemy, and MySQL, and was manually tested end-to-end through Swagger. This report documents the project's objectives, architecture, implemented functionality, testing, and outcomes.

## 3. Introduction

Event management systems require coordination between two distinct groups of users: organizers, who create and manage events, and attendees, who discover and book them. This project implements the backend of such a system, named EventMesh, focusing on secure authentication, correct authorization and ownership checks, reliable booking logic, and a clean, RESTful API surface that can be consumed by any frontend client.

## 4. Problem Statement

A backend for an event management platform needs to let organizers manage their own events and ticket inventory independently of other organizers, let students discover and book tickets reliably (without overselling or double-booking), and generate verifiable tickets that can later be checked at the event. EventMesh addresses this by providing a REST API with role-based access control, ownership-scoped operations, and a validated booking and check-in flow.

## 5. Project Objectives

- Design and implement a RESTful backend API for event management.
- Implement full CRUD operations for the system's core resources.
- Integrate the backend with a relational database and model the relationships between its entities.
- Implement secure user authentication and role-based authorization.
- Validate incoming data and return consistent, correct HTTP status codes and error responses.
- Provide clear, professional API documentation.
- Manually test the API's functionality, validation, and authorization behavior.

## 6. Scope

This project covers the **backend API only**. It includes user authentication, event management, ticket tier management, booking, automatic ticket generation, ticket retrieval, and organizer check-in. It does not include a deployed frontend interface, payment processing, or automated test suites; these are noted explicitly where relevant throughout this report.

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Language | Python |
| Web framework | FastAPI |
| ASGI server | Uvicorn |
| ORM | SQLAlchemy |
| Database | MySQL |
| MySQL driver | PyMySQL |
| Data validation | Pydantic |
| Authentication | JWT |
| Password security | Password hashing |

## 8. System Architecture

EventMesh follows a layered backend architecture. Client requests arrive at FastAPI route handlers, which validate input using Pydantic schemas, apply authentication and role/ownership checks via reusable dependencies, perform the required database operations through SQLAlchemy models, and return a validated response shaped by a response schema.

## 9. Backend Architecture

The backend is organized by responsibility:

- **Models** — SQLAlchemy classes defining the database tables (Users, Events, Ticket Tiers, Bookings, Tickets) and their relationships.
- **Schemas** — Pydantic classes defining and validating request and response bodies for each endpoint.
- **Routes** — FastAPI routers implementing each group of endpoints (authentication, events, ticket tiers, bookings, tickets), including business logic and database queries.
- **Utils** — Shared logic, including authentication dependencies (`get_current_user`, role-checking dependencies) and security helpers.

This separation keeps request validation, access control, and business logic independently testable and maintainable.

## 10. Database Architecture

The backend uses a relational MySQL database, accessed through SQLAlchemy's ORM. The schema includes models/entities for:

- **Users** — holds account information and role (Student or Organizer).
- **Events** — holds event details and is associated with the organizer who owns it.
- **Ticket Tiers** — pricing/availability tiers associated with a specific event.
- **Bookings** — records of a user booking a quantity of a given ticket tier for an event.
- **Tickets** — individual tickets generated from a booking, used for check-in.

These entities are related to one another to support the application's required functionality — for example, an event is linked to its owning organizer, a ticket tier is linked to its event, and a booking and its generated tickets are linked to the user, event, and ticket tier involved in that booking. Further low-level schema detail (columns, constraints) is intentionally not reproduced in this report, consistent with the documentation scope for this submission.

## 11. Authentication and Authorization

User registration stores a securely hashed password rather than plaintext. Login verifies the submitted password against the stored hash and issues a JWT access token on success. Protected endpoints require this token via the `Authorization: Bearer` header.

Two roles exist: **Student** (the default role for all registered users) and **Organizer**. Role-restricted endpoints verify the authenticated user's role before allowing the operation. Event and ticket tier modification additionally verify **ownership** — an organizer may only create, update, or delete events and ticket tiers that they themselves own.

## 12. Event Management

Organizers can create, read, update, and delete events through the `/events/` endpoints. Event creation and modification require the Organizer role, and modification/deletion additionally require that the authenticated organizer owns the event. Events carry a status (draft, published, completed, or cancelled); only published events are returned by the public event listing and are eligible for booking.

**Verified example (published event used during testing):**

| Field | Value |
|---|---|
| ID | 3 |
| Title | Backend Integration Test Event |
| Description | Testing the complete EventMesh backend flow. |
| Category | Technology |
| Location | Bishop Cotton Women's Christian College |
| Date | 2026-10-25T10:00:00 |
| Price | 150.0 |
| Status | published |
| Organizer ID | 3 |

## 13. Ticket Tier Management

Each event can have one or more ticket tiers, each with its own name, price, and available quantity. Ticket tiers are managed through the `/ticket-tiers/` endpoints, restricted to the organizer who owns the parent event. Creating a duplicate ticket tier (same name) for the same event is rejected by a database-level uniqueness constraint, preventing accidental duplication of pricing tiers.

## 14. Booking System

Students book tickets by submitting a ticket tier ID and a quantity to `POST /bookings/`. The backend verifies, in order, that the ticket tier exists, its event exists, the event is published, the event has not already started, and sufficient ticket quantity is available. On success, the tier's available quantity is reduced, the price per ticket and total amount are calculated and stored on the booking, and the booking is created with status `confirmed`.

## 15. Automatic Ticket Generation

Immediately following a successful booking, the backend automatically generates one ticket per unit of the booked quantity. Each ticket is assigned a sequence number within its booking and a unique, randomly generated ticket code, and starts with status `active`.

## 16. Ticket Management

Students can retrieve all of their tickets (`GET /tickets/me`) or an individual ticket (`GET /tickets/{ticket_id}`), scoped to their own bookings. A QR endpoint (`GET /tickets/{ticket_id}/qr`) returns a QR code image representation of a ticket's code, for presentation at check-in. This endpoint provides the QR image only; no frontend scanning interface or scanning hardware is part of this backend submission.

## 17. Ticket Check-In

Organizers check a student into an event by submitting the ticket's code to `POST /tickets/check-in`. The backend locates the ticket, verifies the authenticated organizer owns the event associated with the ticket, verifies the ticket is still `active`, and then marks it `used` and records the check-in timestamp.

## 18. Validation and Error Handling

Request bodies are validated through Pydantic schemas, with field-level constraints (for example, booking quantity bounds, minimum password length). Invalid input returns `422 Unprocessable Entity`. Business-rule violations (such as booking a draft or already-started event, or insufficient ticket stock) return `400 Bad Request` with a descriptive message. Missing resources return `404 Not Found`. Authentication failures return `401 Unauthorized`, and authorization/ownership failures return `403 Forbidden`.

## 19. API Testing

The API was tested manually through Swagger's interactive UI, covering authentication, event CRUD, ticket tier CRUD, the full booking flow, automatic ticket generation, ticket retrieval, organizer check-in, and a set of validation and authorization error cases. Full results are documented in `TESTING_GUIDE.md`. No automated test suite is included in this submission.

## 20. Security Considerations

- Passwords are hashed before storage; plaintext passwords are never stored.
- Authentication uses JWT access tokens, validated on every protected request.
- Role-based authorization restricts organizer-only operations to users with the Organizer role.
- Ownership validation further restricts event and ticket tier modification to the organizer who created the resource.
- Input validation is enforced at the schema level before any database operation.
- Database constraints (such as the ticket tier uniqueness constraint) provide a second layer of data integrity.
- Secrets (database credentials, JWT secret key) are read from environment variables, not hardcoded, and `.env` is excluded from version control; only `.env.example` with placeholder values is included in the submission.

## 21. Development Phases

**Phase 1 — Project Setup**
*Objective:* Establish the FastAPI project foundation.
*Implemented:* FastAPI project structure, Uvicorn setup, initial backend organization.
*Status:* Verified.

**Phase 2 — Database Setup**
*Objective:* Connect the backend to a persistent database.
*Implemented:* MySQL database, SQLAlchemy ORM integration, initial database models, database connectivity.
*Status:* Verified.

**Phase 3 — User Management**
*Objective:* Support user accounts.
*Implemented:* User registration, user model, password hashing.
*Status:* Verified.

**Phase 4 — Authentication**
*Objective:* Secure the API with authenticated access.
*Implemented:* Login, JWT authentication, protected routes, current-user endpoint, Student/Organizer roles.
*Status:* Verified.

**Phase 5 — Event Management**
*Objective:* Allow organizers to manage events.
*Implemented:* Create, read, update, and delete events; organizer ownership checks; event status handling.
*Status:* Verified.

**Phase 6 — Ticket Tier Management**
*Objective:* Allow organizers to define ticket pricing and availability per event.
*Implemented:* Create, list, update, and delete ticket tiers; duplicate tier protection.
*Status:* Verified.

**Phase 7 — Booking System**
*Objective:* Allow students to book tickets.
*Implemented:* Booking creation, ticket quantity validation, ticket availability validation, price and total amount calculation, booking status.
*Status:* Verified.

**Phase 8 — Automatic Ticket Generation**
*Objective:* Produce individual tickets from a successful booking.
*Implemented:* One ticket generated automatically per booked unit.
*Status:* Verified.

**Phase 9 — Ticket Management**
*Objective:* Let students view and present their tickets.
*Implemented:* View own tickets, view an individual ticket, ticket QR endpoint, ticket status.
*Status:* Verified.

**Phase 10 — Ticket Check-In**
*Objective:* Let organizers check students into their events.
*Implemented:* Organizer-only check-in, ticket status transition from active to used, check-in timestamp storage.
*Status:* Verified.

**Phase 11 — Validation and Error Handling**
*Objective:* Ensure the API responds correctly to invalid or disallowed requests.
*Implemented:* Request validation, authentication errors, authorization errors, invalid ticket tier handling, insufficient stock handling, draft-event booking protection, past-event booking protection, duplicate ticket tier protection.
*Status:* Verified.

**Phase 12 — API Testing**
*Objective:* Confirm the backend behaves correctly end-to-end.
*Implemented:* Swagger-based manual testing of successful flows, validation errors, authorization errors, and error handling.
*Status:* Verified.

**Phase 13 — Final Backend Verification**
*Objective:* Confirm all major flows work together correctly.
*Implemented:* Authentication, event, ticket tier, booking, ticket generation, ticket retrieval, and check-in flows all verified; error cases verified.
*Status:* Verified.

## 22. Challenges Encountered and Solutions Implemented

| Challenge | Solution |
|---|---|
| Preventing overselling when multiple booking requests target the same ticket tier | Ticket availability is checked and decremented as part of the same booking transaction, reducing the risk of a race condition between the check and the update. |
| Preventing one organizer from modifying another organizer's events or ticket tiers | Added explicit ownership checks (`organizer_id` matching the authenticated user) on every event and ticket tier modification endpoint. |
| Preventing duplicate ticket tiers for the same event | Enforced a database-level uniqueness constraint on event + tier name, rather than relying solely on application-level checks. |
| Ensuring booking totals remain accurate even if a ticket tier's price changes later | Booking records store a snapshot of the price per ticket and total amount at the time of booking, rather than recalculating from the current tier price. |
| Keeping ticket check-in tamper-resistant | Tickets are identified by a randomly generated, unguessable ticket code rather than a predictable sequential value. |

## 23. Final Outcome

The EventMesh backend implements and verifies a complete flow from registration through authentication, event and ticket tier management, booking, automatic ticket generation, ticket retrieval, and organizer check-in, with role-based and ownership-based authorization, input validation, and consistent error handling throughout. All functionality described in this report as implemented and tested was manually verified via Swagger, as documented in `TESTING_GUIDE.md`.

## 24. Future Improvements

The following are suggestions for future work and are **not** part of the current implementation:

- Automated test suite (unit and integration tests).
- A deployed, publicly accessible instance of the API.
- A frontend QR-scanning interface for organizer check-in (the backend currently provides only the QR image endpoint).
- Payment gateway integration for paid bookings.
- Pagination and filtering on event and listing endpoints.
- Rate limiting and additional abuse-prevention measures.
- Refresh tokens / token revocation for the authentication system.

## 25. Conclusion

EventMesh successfully demonstrates a backend REST API for an event management system, covering authentication, role-based and ownership-based authorization, full CRUD for events and ticket tiers, a validated booking system with automatic ticket generation, and an organizer check-in flow. The implementation was manually tested end-to-end, and this report, together with `README.md`, `API_DOCUMENTATION.md`, and `TESTING_GUIDE.md`, documents the project's actual scope, design, and verified behavior for evaluation.
