# Endpoints

## Purpose

This document is the central place for API endpoint contracts in the project.

Endpoints should be grouped by functional area, for example authentication, archive browsing, photo management, or administration.

Within each functional area, endpoints should be separated into:

- public endpoints,
- non-public endpoints.

Public endpoints are available without authentication unless stated otherwise.

Non-public endpoints require an authenticated user and may later require role-based authorization depending on the business domain.

# Authentication

This section defines the initial authentication-related API contract needed for Sprint 2 frontend and backend work.

The current goal is to provide a minimal creator authentication foundation.

Sprint 2 authentication uses signed bearer JWT access tokens.

The initial implementation is intentionally limited to access tokens only and does not include refresh tokens.

## Public Endpoints

### `POST /api/v1/auth/register`

#### Purpose

Create a new creator account.

#### Request Body

```json
{
  "username": "creator_name",
  "email": "user@example.com",
  "password": "secret123"
}
```

#### Request Notes

- `username` must be unique,
- `email` must be unique,
- `password` is provided in plain text by the client and must be hashed by the backend before storage,
- the created account should use the `creator` role in the initial Sprint 2 implementation.

#### Success Response

Status:

```text
201 Created
```

Body:

```json
{
  "user": {
    "id": 1,
    "username": "creator_name",
    "email": "user@example.com",
    "role": "creator",
    "is_blocked": false
  }
}
```

#### Error Responses

`400 Bad Request`

```json
{
  "detail": "Validation error."
}
```

`409 Conflict`

```json
{
  "detail": "Email or username is already in use."
}
```

### `POST /api/v1/auth/login`

#### Purpose

Authenticate an existing user and return the minimal authentication payload required by the frontend.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

#### Request Notes

- the backend verifies the provided credentials,
- the backend returns a minimal authentication token payload,
- the exact token implementation may be refined later, but the response contract should remain simple and frontend-friendly.

#### Success Response

Status:

```text
200 OK
```

Body:

```json
{
  "access_token": "jwt-or-other-token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "creator_name",
    "email": "user@example.com",
    "role": "creator",
    "is_blocked": false
  }
}
```

#### Error Responses

`400 Bad Request`

```json
{
  "detail": "Validation error."
}
```

`401 Unauthorized`

```json
{
  "detail": "Invalid credentials."
}
```

`403 Forbidden`

```json
{
  "detail": "User account is blocked."
}
```

## Non-Public Endpoints

### `GET /api/v1/auth/me`

#### Purpose

Return the currently authenticated user.

This endpoint exists to support minimal frontend authentication state handling in the later Sprint 2 step.

#### Request Headers

```text
Authorization: Bearer <access_token>
```

#### Success Response

Status:

```text
200 OK
```

Body:

```json
{
  "user": {
    "id": 1,
    "username": "creator_name",
    "email": "user@example.com",
    "role": "creator",
    "is_blocked": false
  }
}
```

#### Error Responses

`401 Unauthorized`

```json
{
  "detail": "Not authenticated."
}
```

`403 Forbidden`

```json
{
  "detail": "User account is blocked."
}
```
