# Event Registration System API
## Technical Documentation

**Project:** Event Registration System  
**Internship:** CodeAlpha Backend Development Internship  
**Task:** Task 2 – Event Registration System  
**Developer:** Ekwebelem Sonia Ifeoma  
**Backend:** Node.js / Express.js  
**Database:** MySQL  

---

# 1. Introduction

The Event Registration System is a RESTful backend application developed as part of the CodeAlpha Backend Development Internship.

The system provides functionality for user authentication, event management and event registration. Users can create accounts, log in, browse events, register for events, view their registrations and cancel registrations.

Organizers can create and manage events, while administrators have permission to manage events regardless of ownership.

The application also implements authentication, authorization, request validation, password hashing, event capacity management, duplicate-registration prevention and centralized error handling.

---

# 2. Objectives

The main objectives of the system are to:

- Provide secure user registration and authentication.
- Allow users to browse available events.
- Allow authenticated users to register for events.
- Associate registrations with both users and events.
- Allow users to view and cancel their registrations.
- Allow organizers to create and manage events.
- Prevent unauthorized event modification.
- Prevent duplicate event registrations.
- Enforce event capacity restrictions.
- Validate incoming API requests.
- Provide consistent RESTful API responses.

---

# 3. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime environment |
| Express.js | Backend framework and routing |
| MySQL | Relational database |
| mysql2 | MySQL database driver |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT generation and verification |
| express-validator | Request validation |
| Helmet | Security-related HTTP headers |
| CORS | Cross-origin request handling |
| Morgan | HTTP request logging |
| dotenv | Environment variable management |
| Nodemon | Automatic development server restart |
| Postman | API testing |

---

# 4. System Architecture

The application follows a modular backend structure.

```text
Client / Postman
       |
       v
Express Application
       |
       v
Routes
       |
       v
Middleware
       |
       v
Controllers
       |
       v
MySQL Database
```

## 4.1 Routes

Routes define the available API endpoints and connect incoming HTTP requests to the appropriate middleware and controller.

The application contains:

- `authRoutes.js`
- `eventRoutes.js`
- `registrationRoutes.js`

## 4.2 Middleware

Middleware performs operations before requests reach the controllers.

The application uses middleware for:

- JWT authentication
- Role authorization
- Request validation
- Security headers
- CORS
- JSON request parsing
- Request logging

## 4.3 Controllers

Controllers contain the main application and business logic.

The application contains:

- `authController.js`
- `eventController.js`
- `registrationController.js`

## 4.4 Database Configuration

The MySQL connection pool is configured in:

```text
src/config/db.js
```

Database credentials are obtained from environment variables rather than being hard-coded into the application.

---

# 5. Database Design

The system contains three main database tables:

1. `users`
2. `events`
3. `registrations`

---

## 5.1 Users Table

The `users` table stores application users.

| Column | Description |
|---|---|
| id | Unique user identifier |
| name | User's name |
| email | Unique email address |
| password | bcrypt password hash |
| role | user, organizer or admin |
| created_at | Account creation timestamp |
| updated_at | Last update timestamp |

The email address is unique.

Passwords are never stored as plain text.

---

## 5.2 Events Table

The `events` table stores events created by organizers.

| Column | Description |
|---|---|
| id | Unique event identifier |
| title | Event title |
| description | Event description |
| location | Event location |
| event_date | Scheduled date and time |
| capacity | Maximum number of attendees |
| organizer_id | User who created the event |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

`organizer_id` is a foreign key referencing the `users` table.

---

## 5.3 Registrations Table

The `registrations` table connects users to events.

| Column | Description |
|---|---|
| id | Unique registration identifier |
| user_id | Registered user |
| event_id | Registered event |
| status | registered or cancelled |
| registered_at | Registration timestamp |

`user_id` references the `users` table.

`event_id` references the `events` table.

A unique constraint exists across:

```text
user_id + event_id
```

This prevents multiple registration records for the same user and event.

---

# 6. Database Relationships

The system contains the following relationships:

```text
USERS
  |
  | 1
  |
  | creates
  |
  | *
EVENTS


USERS
  |
  | 1
  |
  | *
REGISTRATIONS
  | *
  |
  | 1
EVENTS
```

A user can create multiple events when acting as an organizer.

A user can also have multiple registrations.

An event can have multiple registrations.

The `registrations` table therefore creates the many-to-many relationship between users and events.

---

# 7. Authentication

Authentication is implemented using JSON Web Tokens (JWT).

## 7.1 Registration

When a user creates an account:

1. The request is validated.
2. The application checks whether the email already exists.
3. The password is hashed using bcrypt.
4. The user is inserted into the database.
5. A JWT is generated.
6. User information and the token are returned.

The password hash is never returned in the API response.

---

## 7.2 Login

During login:

1. The email and password are received.
2. The application retrieves the corresponding user.
3. bcrypt compares the submitted password with the stored password hash.
4. If the credentials are valid, a JWT is generated.
5. The token is returned to the client.

Invalid credentials return:

```text
401 Unauthorized
```

---

## 7.3 Protected Routes

Protected routes require the following HTTP header:

```text
Authorization: Bearer <token>
```

The authentication middleware:

1. Reads the Authorization header.
2. Extracts the Bearer token.
3. Verifies the JWT.
4. Retrieves the user from the database.
5. Stores the authenticated user in `req.user`.
6. Passes control to the next middleware or controller.

Missing, expired or invalid tokens are rejected.

---

# 8. Authorization

The system uses role-based access control.

Three roles are supported:

```text
user
organizer
admin
```

## 8.1 User Permissions

A regular user can:

- View events
- View event details
- Register for events
- View their registrations
- Cancel their registrations

## 8.2 Organizer Permissions

An organizer can:

- Perform authenticated user operations
- Create events
- Update events they own
- Delete events they own

Organizers cannot modify events created by another organizer.

## 8.3 Administrator Permissions

Administrators can manage events regardless of event ownership.

---

# 9. API Base URL

During local development:

```text
http://localhost:5000
```

API endpoints are grouped under:

```text
/api/auth
/api/events
/api/registrations
```

---

# 10. Authentication API

## 10.1 Register User

### Endpoint

```http
POST /api/auth/register
```

### Access

Public

### Request Body

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

### Successful Response

**Status: `201 Created`**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "<jwt-token>"
  }
}
```

### Possible Errors

- `400` – Missing or invalid fields
- `409` – Email already registered
- `500` – Internal server error

---

## 10.2 Login User

### Endpoint

```http
POST /api/auth/login
```

### Access

Public

### Request Body

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

### Successful Response

**Status: `200 OK`**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "<jwt-token>"
  }
}
```

### Invalid Credentials

**Status: `401 Unauthorized`**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 10.3 Get Current User

### Endpoint

```http
GET /api/auth/me
```

### Access

Authenticated

### Header

```text
Authorization: Bearer <token>
```

### Successful Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

---

# 11. Events API

## 11.1 Get All Events

### Endpoint

```http
GET /api/events
```

### Access

Public

### Description

Retrieves all available events ordered according to event date.

### Successful Response

**Status: `200 OK`**

```json
{
  "success": true,
  "count": 1,
  "data": {
    "events": [
      {
        "id": 1,
        "title": "Backend Development Conference",
        "description": "A conference for backend developers.",
        "location": "Port Harcourt",
        "event_date": "2026-12-15T10:00:00.000Z",
        "capacity": 150,
        "organizer_id": 2,
        "organizer_name": "Event Organizer"
      }
    ]
  }
}
```

---

## 11.2 Get Event by ID

### Endpoint

```http
GET /api/events/:id
```

### Access

Public

### Example

```http
GET /api/events/1
```

### Event Not Found

**Status: `404 Not Found`**

```json
{
  "success": false,
  "message": "Event not found"
}
```

---

## 11.3 Create Event

### Endpoint

```http
POST /api/events
```

### Access

Organizer or Admin

### Header

```text
Authorization: Bearer <token>
```

### Request Body

```json
{
  "title": "Backend Development Conference",
  "description": "A conference for backend developers and software engineers.",
  "location": "Port Harcourt",
  "event_date": "2026-12-15T10:00:00",
  "capacity": 150
}
```

### Successful Response

**Status: `201 Created`**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": 1,
      "title": "Backend Development Conference",
      "description": "A conference for backend developers and software engineers.",
      "location": "Port Harcourt",
      "capacity": 150
    }
  }
}
```

A regular user attempting this operation receives:

```text
403 Forbidden
```

---

## 11.4 Update Event

### Endpoint

```http
PATCH /api/events/:id
```

### Access

Event Owner or Admin

Partial updates are supported.

### Example Request

```json
{
  "location": "Lagos",
  "capacity": 200
}
```

### Successful Response

**Status: `200 OK`**

```json
{
  "success": true,
  "message": "Event updated successfully"
}
```

An organizer attempting to modify another organizer's event receives:

```text
403 Forbidden
```

The system also prevents event capacity from being reduced below the current number of active registrations.

---

## 11.5 Delete Event

### Endpoint

```http
DELETE /api/events/:id
```

### Access

Event Owner or Admin

### Successful Response

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

Deleting an event also removes its associated registration records through the configured foreign-key cascade.

---

# 12. Registration API

All registration endpoints require authentication.

---

## 12.1 Register for Event

### Endpoint

```http
POST /api/registrations/:eventId
```

### Example

```http
POST /api/registrations/1
```

### Header

```text
Authorization: Bearer <token>
```

No request body is required because the user ID is obtained from the authenticated user.

### Successful Response

**Status: `201 Created`**

```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "registrationId": 1,
    "event": {
      "id": 1,
      "title": "Backend Development Conference"
    }
  }
}
```

---

## 12.2 Duplicate Registration

If an actively registered user attempts to register for the same event again:

**Status: `409 Conflict`**

```json
{
  "success": false,
  "message": "You are already registered for this event"
}
```

---

## 12.3 Full Event

If the event has reached maximum capacity:

**Status: `409 Conflict`**

```json
{
  "success": false,
  "message": "This event has reached its maximum capacity"
}
```

---

## 12.4 View My Registrations

### Endpoint

```http
GET /api/registrations/my
```

### Access

Authenticated

### Successful Response

```json
{
  "success": true,
  "count": 1,
  "data": {
    "registrations": [
      {
        "registration_id": 1,
        "status": "registered",
        "event_id": 1,
        "title": "Backend Development Conference",
        "location": "Port Harcourt"
      }
    ]
  }
}
```

Users can only retrieve registrations associated with their authenticated account.

---

## 12.5 Cancel Registration

### Endpoint

```http
PATCH /api/registrations/:eventId/cancel
```

### Example

```http
PATCH /api/registrations/1/cancel
```

### Successful Response

```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

The registration record remains in the database, but its status changes to:

```text
cancelled
```

---

## 12.6 Restore Cancelled Registration

If a user registers for the same event after previously cancelling, the existing registration record is restored.

### Successful Response

```json
{
  "success": true,
  "message": "Event registration restored successfully"
}
```

Before restoration, event capacity is checked again.

---

# 13. Business Rules

The application enforces the following business rules:

1. Email addresses must be unique.
2. Passwords must meet the configured minimum length.
3. Passwords must be hashed before database storage.
4. Only organizers and administrators can create events.
5. Organizers can modify only their own events.
6. Event capacity must be greater than zero.
7. Events must have valid future dates when created.
8. Users cannot register for past events.
9. A user cannot have duplicate active registrations for the same event.
10. Event capacity cannot be exceeded.
11. Event capacity cannot be reduced below the number of currently registered attendees.
12. Users can cancel only their own registrations.
13. Cancelled registrations may be restored if capacity is available.

---

# 14. Request Validation

The application uses `express-validator`.

Validation occurs before relevant controller logic.

Examples include:

### Invalid Email

```json
{
  "email": "not-an-email"
}
```

Result:

```text
400 Bad Request
```

### Invalid Capacity

```json
{
  "capacity": -10
}
```

Result:

```text
400 Bad Request
```

### Invalid Event ID

```http
GET /api/events/abc
```

Result:

```text
400 Bad Request
```

Validation errors use the following general format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "capacity",
      "message": "Capacity must be a positive integer"
    }
  ]
}
```

---

# 15. Error Handling

The API uses consistent JSON error responses.

General format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

Unknown routes return:

```text
404 Not Found
```

Example:

```json
{
  "success": false,
  "message": "Route not found: GET /api/unknown"
}
```

Unexpected server errors return:

```text
500 Internal Server Error
```

In production, internal implementation details are not exposed to clients.

---

# 16. Security Implementation

## 16.1 Password Hashing

bcrypt is used to hash user passwords before storage.

This prevents the database from containing readable user passwords.

## 16.2 JWT Authentication

JWTs are used to authenticate protected API requests.

## 16.3 Role-Based Authorization

The `authorize` middleware restricts operations according to user roles.

## 16.4 Ownership Authorization

Event update and deletion operations verify event ownership in addition to checking the user's role.

## 16.5 Parameterized SQL Queries

User-supplied values are passed separately from SQL statements using placeholders.

Example:

```javascript
const [users] = await db.query(
  "SELECT id FROM users WHERE email = ?",
  [email]
);
```

This reduces SQL injection risk.

## 16.6 Helmet

Helmet configures security-related HTTP response headers.

## 16.7 Environment Variables

Sensitive configuration is stored in `.env`, including:

- Database credentials
- JWT secret
- Application environment

`.env` is excluded from source control.

## 16.8 Input Validation

Incoming data is validated before processing to reduce malformed or unexpected input.

## 16.9  Rate Limiting

The API uses `express-rate-limit` to limit excessive requests. API clients are limited to 100 requests per IP address within a 15-minute window.

---

# 17. HTTP Status Codes

| Code | Meaning | Typical Use |
|---|---|---|
| 200 | OK | Successful request |
| 201 | Created | New resource created |
| 400 | Bad Request | Validation/business rule failure |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not permitted |
| 404 | Not Found | Resource or route not found |
| 409 | Conflict | Duplicate registration/capacity conflict |
| 500 | Internal Server Error | Unexpected server error |

---

# 18. Environment Variables

Example `.env` configuration:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_registration_db

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
```

Actual credentials and secrets must not be committed to the repository.

---

# 19. Running the Project

Install dependencies:

```bash
npm install
```

Configure `.env`.

Import:

```text
eventregistration_database.sql
```

into MySQL.

Start development mode:

```bash
npm run dev
```

The default local server is:

```text
http://localhost:5000
```

---

# 20. Testing

Manual API testing was performed using Postman.

The following scenarios were tested successfully:

| Test | Expected Result |
|---|---|
| Register valid user | 201 Created |
| Register duplicate email | 409 Conflict |
| Login with valid credentials | 200 OK |
| Login with incorrect password | 401 Unauthorized |
| Access protected route without token | 401 Unauthorized |
| Access with valid token | Successful |
| Access with tampered token | 401 Unauthorized |
| User creates event | 403 Forbidden |
| Organizer creates event | 201 Created |
| Retrieve events | 200 OK |
| Retrieve nonexistent event | 404 Not Found |
| Owner updates event | 200 OK |
| Different organizer updates event | 403 Forbidden |
| Owner deletes event | 200 OK |
| Register for event | 201 Created |
| Duplicate registration | 409 Conflict |
| View personal registrations | 200 OK |
| Cancel registration | 200 OK |
| Restore cancelled registration | 200 OK |
| Register when event is full | 409 Conflict |
| Submit invalid email | 400 Bad Request |
| Submit negative capacity | 400 Bad Request |
| Use invalid event ID | 400 Bad Request |
| Request unknown route | 404 Not Found |

---

# 21. CodeAlpha Task Requirements Fulfilled

The original Task 2 requirements were to:

- Set up a backend using Django or Express.js.
- Create models for events and user registrations.
- Build API endpoints to view event lists and details.
- Allow users to submit registrations.
- Link registrations to users and events.
- Allow users to view and cancel registrations.
- Optionally implement authentication for event organizers.

The completed system satisfies these requirements and additionally implements:

- JWT authentication
- Password hashing
- Role-based authorization
- Event ownership authorization
- Admin privileges
- Event capacity management
- Duplicate-registration prevention
- Registration restoration
- Input validation
- Centralized error handling
- HTTP security headers
- SQL injection protection through parameterized queries

---

# 22. Future Improvements

Possible future improvements include:

- Email registration confirmation
- Event reminder emails
- Event search and filtering
- Pagination
- Registration deadlines
- Waiting lists for full events
- Organizer dashboard
- Attendance tracking
- QR-code event check-in
- Automated unit and integration testing
- Swagger/OpenAPI documentation
- Cloud deployment

---

# 23. Conclusion

The Event Registration System provides a functional and secure RESTful backend for managing events and registrations.

The project demonstrates practical backend development concepts including REST API design, relational database relationships, authentication, authorization, password security, request validation, business-rule enforcement, error handling and API testing.

The final implementation meets the requirements of the CodeAlpha Event Registration System task while extending the basic specification with additional security and event-management functionality.

---

## Developer

**Ekwebelem Sonia Ifeoma**  
Backend Developer  
CodeAlpha Backend Development Internship