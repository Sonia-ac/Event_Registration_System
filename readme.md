# Event Registration System API

A secure RESTful backend API for managing events and event registrations, developed as **Task 2 of the CodeAlpha Backend Development Internship**.

The application allows users to create accounts, authenticate securely, browse available events, register for events, view and cancel their registrations. Organizers can create and manage events, while administrators have broader event management privileges.

---

## Features

### User Authentication
- User account registration
- Secure user login
- Password hashing using bcrypt
- JWT-based authentication
- Authenticated user profile retrieval

### Event Management
- Create events
- View all events
- View individual event details
- Update events
- Delete events
- Organizer ownership verification
- Role-based event management

### Event Registration
- Register for an event
- View personal event registrations
- Cancel an event registration
- Restore a previously cancelled registration
- Prevent duplicate registrations
- Enforce event capacity limits
- Prevent registration for expired events

### Security and Validation
- JWT authentication
- Role-based authorization
- Event ownership authorization
- Password hashing
- Input validation and sanitization
- Parameterized SQL queries
- Helmet security headers
- Environment variable protection
- Centralized 404 and error handling

---

## Technologies Used

- **Node.js** – JavaScript runtime
- **Express.js** – Backend web framework
- **MySQL** – Relational database
- **mysql2** – MySQL driver
- **JSON Web Token (JWT)** – Authentication
- **bcryptjs** – Password hashing
- **express-validator** – Request validation
- **Helmet** – HTTP security headers
- **CORS** – Cross-Origin Resource Sharing
- **Morgan** – HTTP request logging
- **dotenv** – Environment variable management
- **Nodemon** – Development server
- **Postman** – API testing

---

## Project Structure

```text
CodeAlpha Event_Registration_System/
│
├── docs/
│   └── Documentation.md
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── registrationController.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── validators.js
│   │
│   ├── models/
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── registrationRoutes.js
│   │
│   └── utils/
│
├── .env
├── .env_example
├── .gitignore
├── app.js
├── eventregistration_database.sql
├── package-lock.json
├── package.json
├── readme.md
└── server.js
```

> The `models` and `utils` directories are reserved for future expansion. Database operations in the current implementation are handled through the controllers using the MySQL connection configured in `src/config/db.js`.

---

## Database Structure

The system uses a MySQL database containing three main tables:

### Users

Stores registered user accounts.

Important fields include:

- `id`
- `name`
- `email`
- `password`
- `role`
- `created_at`
- `updated_at`

Supported roles:

- `user`
- `organizer`
- `admin`

---

### Events

Stores events created by organizers.

Important fields include:

- `id`
- `title`
- `description`
- `location`
- `event_date`
- `capacity`
- `organizer_id`
- `created_at`
- `updated_at`

Each event is associated with the user who created it through `organizer_id`.

---

### Registrations

Connects users to the events for which they have registered.

Important fields include:

- `id`
- `user_id`
- `event_id`
- `status`
- `registered_at`

Registration status can be:

- `registered`
- `cancelled`

A unique constraint on `user_id` and `event_id` prevents duplicate registration records for the same user and event.

---

## Database Relationships

The application uses the following relationships:

```text
USER
 │
 │ creates
 ▼
EVENT

USER
 │
 │ registers
 ▼
REGISTRATION
 ▲
 │
 │ belongs to
EVENT
```

A user can register for multiple events, and an event can contain registrations from multiple users.

The `registrations` table therefore implements the many-to-many relationship between users and events.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive a JWT | Public |
| GET | `/api/auth/me` | Get authenticated user information | Authenticated |

### Events

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/events` | Retrieve all events | Public |
| GET | `/api/events/:id` | Retrieve a single event | Public |
| POST | `/api/events` | Create a new event | Organizer/Admin |
| PATCH | `/api/events/:id` | Update an event | Event Owner/Admin |
| DELETE | `/api/events/:id` | Delete an event | Event Owner/Admin |

### Registrations

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/registrations/:eventId` | Register for an event | Authenticated |
| GET | `/api/registrations/my` | View personal registrations | Authenticated |
| PATCH | `/api/registrations/:eventId/cancel` | Cancel a registration | Authenticated |

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

Navigate into the project:

```bash
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Open MySQL Workbench or another MySQL client.

The project contains:

```text
eventregistration_database.sql
```

Import or execute this SQL file to recreate the database structure required by the application.

Alternatively, create the database first:

```sql
CREATE DATABASE event_registration_db;
```

and then import the SQL schema.

### 4. Configure environment variables

Create a `.env` file using `.env_example` as a template.

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

Do not commit your real `.env` file because it contains sensitive configuration values.

### 5. Start the application

Development mode:

```bash
npm run dev
```

Production/start mode:

```bash
npm start
```

By default, the API runs at:

```text
http://localhost:5000
```

A successful server startup confirms both the Express server and MySQL database connection.

---

## Authentication

The application uses JSON Web Tokens to authenticate users.

After successful login, the API returns a JWT.

For protected endpoints, send the token in the request header:

```text
Authorization: Bearer <your_token>
```

The authentication middleware:

1. Checks for the Bearer token.
2. Verifies the JWT.
3. Retrieves the associated user from the database.
4. Attaches the authenticated user to the request.
5. Allows the request to continue if authentication succeeds.

Missing, invalid or expired tokens are rejected with an appropriate `401 Unauthorized` response.

---

## Authorization

The API implements both **role-based authorization** and **resource ownership authorization**.

### User

A regular user can:

- Browse events
- View event details
- Register for events
- View their registrations
- Cancel their registrations

### Organizer

An organizer can perform normal authenticated operations and can also:

- Create events
- Update events they own
- Delete events they own

An organizer cannot modify another organizer's event.

### Admin

An administrator can manage events regardless of ownership.

---

## Event Registration Rules

The registration system applies several business rules.

### Duplicate Registration Prevention

A user cannot maintain multiple registration records for the same event.

### Capacity Enforcement

Before registration is completed, the system checks the number of active registrations against the event's capacity.

When the maximum capacity has been reached, additional registrations are rejected.

### Registration Cancellation

Users can cancel their own event registrations.

Instead of immediately deleting the database record, its status changes from:

```text
registered
```

to:

```text
cancelled
```

### Registration Restoration

If a user registers again after cancelling, the existing registration is restored rather than creating a duplicate database record.

Capacity is checked again before restoration.

### Event Date Validation

Users cannot register for events whose event date has already passed.

---

## Validation

`express-validator` is used to validate incoming requests.

Validation includes:

- Valid email addresses
- Required registration fields
- Minimum password length
- Valid event IDs
- Required event information
- Positive event capacities
- Valid event dates
- Partial validation for event updates

Invalid requests return `400 Bad Request` responses with information about the validation failure.

---

## Security Measures

The API implements several security controls.

### Password Security

Passwords are hashed using `bcryptjs` before being stored.

Plain-text passwords are never returned by the API.

### JWT Security

Protected endpoints require a valid JSON Web Token.

### Role-Based Access Control

Sensitive event operations are restricted according to user roles.

### Ownership Verification

Organizers cannot update or delete events belonging to another organizer.

### SQL Injection Protection

Database queries use parameterized queries rather than directly inserting user input into SQL statements.

### HTTP Security Headers

Helmet is used to configure security-related HTTP headers.

### Environment Variables

Database credentials and JWT secrets are stored in `.env` rather than hard-coded into the application.

### Request Validation

User-supplied input is validated before being processed by controllers.

---

## HTTP Status Codes

Common status codes returned by the API include:

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid request or validation failure |
| `401 Unauthorized` | Authentication failed or token missing |
| `403 Forbidden` | User lacks permission |
| `404 Not Found` | Resource or route does not exist |
| `409 Conflict` | Duplicate registration or capacity conflict |
| `500 Internal Server Error` | Unexpected server error |

---

## Error Response Format

Errors are returned as JSON.

Example:

```json
{
  "success": false,
  "message": "Event not found"
}
```

Validation errors may also include field-specific details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Enter a valid email address"
    }
  ]
}
```

---

## Testing

The API was manually tested using Postman.

Tests performed include:

- Successful account registration
- Duplicate email handling
- Successful login
- Incorrect password handling
- Missing authentication token
- Valid authentication token
- Tampered authentication token
- User role restrictions
- Organizer event creation
- Event listing
- Individual event retrieval
- Event update
- Event deletion
- Organizer ownership restrictions
- Successful event registration
- Duplicate registration prevention
- Registration listing
- Registration cancellation
- Registration restoration
- Event capacity enforcement
- Invalid event IDs
- Invalid request fields
- Unknown route handling

All core application endpoints and expected error cases were tested successfully.

---

## API Documentation

More detailed technical information and request/response examples are available in:

```text
docs/Documentation.md
```

---

## CodeAlpha Task Requirements

This project was created to satisfy the requirements of **Task 2 – Event Registration System** under the CodeAlpha Backend Development Internship.

The implementation covers:

- Backend setup using Express.js
- Event database model
- User registration model
- Event listing endpoint
- Event detail endpoint
- Event registration endpoint
- User-to-event registration relationship
- Viewing registrations
- Cancelling registrations
- Organizer authentication
- Role-based authorization
- Event management
- Additional security and validation

---

## Future Improvements

Possible future additions include:

- Email registration confirmations
- Event reminders
- Pagination
- Event searching and filtering
- Registration deadlines
- Waitlists for full events
- Organizer dashboards
- Attendance tracking
- Automated testing
- Swagger/OpenAPI documentation
- Deployment to a cloud platform

---

## Author

**Ekwebelem Sonia Ifeoma**

Backend Developer

CodeAlpha Backend Development Internship

---

## License

This project was developed for educational and internship purposes.