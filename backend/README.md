# EventMesh — Backend REST API

## 1. Project Overview

EventMesh is a backend REST API for an event management system. It allows **organizers** to create and manage events and ticket tiers, and allows **students** to browse published events, book tickets, and view their bookings and generated tickets. Organizers can also check students into an event by validating a ticket.

## 2. Purpose

The project was built as a backend internship assignment, with the objective of demonstrating the ability to design, develop, test, and document a production-structured backend REST API, including authentication, authorization, database integration, validation, and error handling.

## 3. Key Features

- User registration and login with hashed passwords
- JWT-based authentication
- Role-based authorization for two roles: **Student** and **Organizer**
- Full CRUD for events, scoped to the organizer who owns each event
- Ticket tier management per event, with duplicate-tier protection
- Ticket booking with availability, published-status, and past-event validation
- Automatic ticket generation (one ticket per booked quantity) after a successful booking
- Retrieval of a user's own bookings and tickets
- Per-ticket QR endpoint
- Organizer-only ticket check-in, with ticket status and check-in timestamp tracking
- Input validation and consistent error responses
- Interactive API documentation via Swagger/OpenAPI

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Language | Python |
| Web framework | FastAPI |
| ASGI server | Uvicorn |
| ORM | SQLAlchemy |
| Database | MySQL |
| MySQL driver | PyMySQL |
| Data validation | Pydantic |
| Authentication | JWT (JSON Web Tokens) |
| Password security | Password hashing |

## 5. Backend Architecture Overview

The backend follows a layered, modular structure built on FastAPI:

- **Models** define the database tables and their relationships via SQLAlchemy.
- **Schemas** define the request and response data contracts via Pydantic, including field-level validation.
- **Routes** implement the API endpoints, handling request validation, authentication/authorization checks, business logic, and database operations.
- **Utils** contains supporting logic such as authentication dependencies and security helpers.

Authentication and role checks are implemented as reusable FastAPI dependencies, applied to routes that require an authenticated user or a specific role (Student or Organizer).

## 6. Project Structure

```text
backend/
│
├── app/
│   ├── routes/
│   ├── models/
│   ├── schemas/
│   ├── utils/
│   └── ...
│
├── main.py
├── requirements.txt
├── .env.example
└── ...
```

> The structure above reflects the general organization of the backend. Refer to the actual project files for the complete and current structure.

## 7. Authentication Overview

EventMesh uses JWT-based authentication:

1. A user registers via `POST /auth/register`.
2. A user logs in via `POST /auth/login` and receives a JWT access token.
3. The token is sent on subsequent requests as an `Authorization: Bearer <token>` header.
4. Protected endpoints validate this token and, where required, check the authenticated user's role (Student or Organizer) before allowing the operation.

See `API_DOCUMENTATION.md` for full authentication and authorization requirements per endpoint.

## 8. API Documentation Reference

Full endpoint-by-endpoint documentation is provided in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

Interactive, auto-generated documentation is also available once the backend is running:

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

## 9. Database Overview

EventMesh uses a relational MySQL database accessed through SQLAlchemy. The database contains models/entities related to:

- Users
- Events
- Ticket Tiers
- Bookings
- Tickets

These entities are related to one another (for example, an event belongs to an organizer, a ticket tier belongs to an event, and a booking and its generated tickets are tied to the user, event, and ticket tier involved). Further database detail is provided in `PROJECT_REPORT.md`.

## 10. Setup Requirements

- Python (3.x)
- MySQL server
- `pip` for dependency installation

## 11. Installation Steps

1. Clone or download the project repository.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 12. Environment Variable Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Fill in the required values in `.env`, including the database connection string and the JWT secret key.

`.env` must never be committed to version control. Only `.env.example` (with placeholder values) should be included in the submission.

## 13. Database Configuration

1. Ensure a MySQL server is running and accessible.
2. Create a database for the project.
3. Set the `DATABASE_URL` value in `.env` to point to that MySQL database (including the appropriate PyMySQL-compatible connection string).
4. Database tables are created automatically from the SQLAlchemy models when the backend starts.

## 14. Running the Backend

Start the backend with Uvicorn:

```bash
uvicorn main:app --reload
```

By default, the API will be available at:

```text
http://127.0.0.1:8000
```

## 15. Swagger Documentation URL

Once the backend is running, open:

```text
http://127.0.0.1:8000/docs
```

This provides an interactive interface to explore and test every endpoint directly in the browser.

## 16. Basic API Usage Flow

1. Register a user via `POST /auth/register` (registers as a Student).
2. Log in via `POST /auth/login` to obtain a JWT access token.
3. Use the token (`Authorization: Bearer <token>`) to call `GET /auth/me` and confirm the authenticated identity.
4. An Organizer account creates an event (`POST /events/`) and one or more ticket tiers for it (`POST /ticket-tiers/`).
5. A Student books a ticket tier (`POST /bookings/`), which generates tickets automatically.
6. The Student views their bookings (`GET /bookings/me`) and tickets (`GET /tickets/me`, `GET /tickets/{ticket_id}`).
7. The Organizer checks a student in at the event (`POST /tickets/check-in`) using the ticket code.

Full request/response detail for each step is in `API_DOCUMENTATION.md`.

## 17. Testing Overview

The backend was manually tested through Swagger, covering authentication, event CRUD, ticket tier CRUD, the booking flow, automatic ticket generation, ticket retrieval, organizer check-in, and a range of validation and authorization error cases. See `TESTING_GUIDE.md` for the full list of tests performed and their results.

## 18. Security Considerations

- Passwords are never stored in plain text; they are hashed before being saved.
- Authentication is handled via JWT access tokens.
- Protected endpoints require a valid token; role-restricted endpoints additionally verify the authenticated user's role.
- Organizer-only operations on events and ticket tiers additionally verify that the authenticated organizer owns the resource being modified.
- Secrets (database credentials, JWT secret key) are read from environment variables and are not hardcoded in the source code.
- `.env` is excluded from version control and from the final submission; `.env.example` is provided instead, with placeholder values only.

## 19. Important Notes

- This submission is the backend API only. No automated test suite is included; all testing was performed manually via Swagger, as documented in `TESTING_GUIDE.md`.
- Credentials for any test accounts used during development are not included in this documentation or the repository. See `TESTING_GUIDE.md` for how to obtain test credentials securely.
- Any functionality not explicitly documented here or in the other documentation files should be considered not implemented.
