# Assignment Two API

Backend API for user authentication and issue tracking, built with Node.js, Express, TypeScript, PostgreSQL, and JWT-based authorization.

## Project Overview

- **Project Name:** Assignment Two API
- **Live URL:** Not deployed yet. Add your deployed API URL here.
- **Local URL:** `http://localhost:5000`

## Features

- User registration with `contributor` and `maintainer` roles
- User login with JWT token generation
- Protected issue creation for authenticated users
- Public issue listing with sorting and filtering
- Public single issue details endpoint
- Role-based issue update permissions
- Maintainer-only issue deletion
- PostgreSQL-backed persistent data storage

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT (`jsonwebtoken`)
- `bcryptjs`
- `pg`
- `dotenv`
- `tsx`

## Setup Instructions

### 1. Clone the project

```bash
git clone <your-repository-url>
cd "assignment Two"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add:

```env
PORT=5000
CONNECTIONSTRING=your_postgresql_connection_string
SECRET=your_jwt_secret
```

### 4. Run the project

```bash
npm run dev
```

The API will run at:

```text
http://localhost:5000
```

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login user and return JWT |

### Issues

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/issues` | Authenticated | Create a new issue |
| GET | `/api/issues` | Public | Get all issues with optional filters |
| GET | `/api/issues/:id` | Public | Get a single issue by id |
| PATCH | `/api/issues/:id` | Authenticated | Update an issue based on role rules |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

## Query Parameters

`GET /api/issues` supports:

| Parameter | Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

Example:

```text
/api/issues?sort=newest&type=bug&status=open
```

## Authentication

Protected routes require a JWT token in the `Authorization` header:

```text
Authorization: Bearer <your_token>
```

The JWT payload includes:

- `id`
- `name`
- `email`
- `role`

## Database Schema Summary

### `users` table

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | SERIAL | Primary key, unique |
| `name` | VARCHAR(255) | Not null |
| `email` | VARCHAR(255) | Not null, unique |
| `password` | VARCHAR(255) | Not null |
| `role` | VARCHAR(20) | Not null, default `contributor` |
| `created_at` | TIMESTAMP | Default current timestamp |
| `updated_at` | TIMESTAMP | Default current timestamp |

Allowed `role` values:

- `contributor`
- `maintainer`

### `issues` table

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | SERIAL | Primary key, unique |
| `title` | VARCHAR(150) | Not null |
| `description` | TEXT | Not null, minimum length 20 |
| `type` | VARCHAR(20) | Not null |
| `status` | VARCHAR(20) | Not null, default `open` |
| `reporter_id` | INTEGER | Not null |
| `created_at` | TIMESTAMP | Default current timestamp |
| `updated_at` | TIMESTAMP | Default current timestamp |

Allowed `type` values:

- `bug`
- `feature_request`

Allowed `status` values:

- `open`
- `in_progress`
- `resolved`

## Permission Rules

- Contributors can create issues
- Contributors can update only their own issues and only when status is `open`
- Maintainers can update any issue
- Only maintainers can delete issues

## Response Format

### Success response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error response

```json
{
  "success": false,
  "message": "Request failed",
  "errors": "Error details"
}
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |

## Notes

- Database tables are initialized automatically when the server starts
- Use Postman or any API client to test protected endpoints
- Replace the live URL placeholder after deployment
