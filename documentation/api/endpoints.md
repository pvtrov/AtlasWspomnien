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

# Photo Management

This section defines the Sprint 3 backend upload contract for creator-owned photo materials.

The current scope is limited to authenticated creator upload with local filesystem storage and database-backed metadata plus file reference persistence.

## Non-Public Endpoints

### `POST /api/v1/photos`

#### Purpose

Upload one photo for the currently authenticated creator and persist both its metadata and stored file reference.

#### Authentication

This endpoint requires a bearer access token for an authenticated user.

Only users with the `creator` role may upload photos through this Sprint 3 endpoint.

#### Request Headers

```text
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

#### Request Body

The request must be sent as `multipart/form-data`.

Fields:

- `file`: required uploaded file,
- `category_slug`: required string,
- `description`: optional string,
- `location_text`: required string,
- `taken_year`: required integer,
- `taken_month`: optional integer,
- `taken_day`: optional integer.

Example shape:

```text
file=<binary image>
category_slug=ulica
description=Historic market square in winter.
location_text=Rynek
taken_year=1982
taken_month=1
taken_day=14
```

#### Validation Notes

- `file` is required,
- `category_slug` is required and must match an existing backend photo category,
- `description` may be empty,
- `location_text` is required,
- `taken_year` is required,
- `taken_month`, if provided, must be between `1` and `12`,
- `taken_day`, if provided, must be between `1` and `31`,
- `taken_day` cannot be provided without `taken_month`,
- uploaded content is stored on the backend local filesystem,
- PostgreSQL stores the photo metadata and file reference only.

#### Success Response

Status:

```text
201 Created
```

Body:

```json
{
  "photo": {
    "id": 1,
    "owner_id": 1,
    "category_id": 1,
    "description": "Historic market square in winter.",
    "location_text": "Rynek",
    "taken_year": 1982,
    "taken_month": 1,
    "taken_day": 14,
    "category": {
      "id": 1,
      "slug": "ulica",
      "name": "Ulica",
      "parent_id": null
    },
    "created_at": "2026-04-04T10:00:00Z",
    "updated_at": "2026-04-04T10:00:00Z"
  }
}
```

#### Response Notes

- the backend keeps the persisted `file_reference` internally as part of the storage strategy,
- the frontend should treat photo file handling as a separate concern and should not display storage references to end users,
- the creator-owned photo image can be retrieved through the dedicated authenticated image endpoint documented below.

#### Error Responses

`400 Bad Request`

```json
{
  "detail": "Uploaded file is required."
}
```

or

```json
{
  "detail": "Unknown photo category."
}
```

`401 Unauthorized`

```json
{
  "detail": "Not authenticated."
}
```

`403 Forbidden`

```json
{
  "detail": "Only creators can manage photos."
}
```

or

```json
{
  "detail": "User account is blocked."
}
```

`422 Unprocessable Entity`

```json
{
  "detail": [
    {
      "loc": ["taken_day"],
      "msg": "Value error, taken_day requires taken_month.",
      "type": "value_error"
    }
  ]
}
```

### `GET /api/v1/photos`

#### Purpose

Return the list of photos owned by the currently authenticated creator.

#### Authentication

This endpoint requires a bearer access token for an authenticated creator.

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
  "photos": [
    {
      "id": 1,
      "owner_id": 1,
      "category_id": 1,
      "description": "Historic market square in winter.",
      "location_text": "Rynek",
      "taken_year": 1982,
      "taken_month": 1,
      "taken_day": 14,
      "category": {
        "id": 1,
        "slug": "ulica",
        "name": "Ulica",
        "parent_id": null
      },
      "created_at": "2026-04-04T10:00:00Z",
      "updated_at": "2026-04-04T10:00:00Z"
    }
  ]
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
  "detail": "Only creators can manage photos."
}
```

### `GET /api/v1/photos/{photo_id}`

#### Purpose

Return one photo owned by the currently authenticated creator.

#### Authentication

This endpoint requires a bearer access token for an authenticated creator.

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
  "photo": {
    "id": 1,
    "owner_id": 1,
    "category_id": 1,
    "description": "Historic market square in winter.",
    "location_text": "Rynek",
    "taken_year": 1982,
    "taken_month": 1,
    "taken_day": 14,
    "category": {
      "id": 1,
      "slug": "ulica",
      "name": "Ulica",
      "parent_id": null
    },
    "created_at": "2026-04-04T10:00:00Z",
    "updated_at": "2026-04-04T10:00:00Z"
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
  "detail": "Only creators can manage photos."
}
```

`404 Not Found`

```json
{
  "detail": "Photo not found."
}
```

### `GET /api/v1/photos/{photo_id}/image`

#### Purpose

Return the binary image file for one photo owned by the currently authenticated creator.

#### Authentication

This endpoint requires a bearer access token for an authenticated creator.

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

- binary image content with the detected media type.

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
  "detail": "Only creators can manage photos."
}
```

`404 Not Found`

```json
{
  "detail": "Photo file not found."
}
```

or

```json
{
  "detail": "Photo not found."
}
```

### `PATCH /api/v1/photos/{photo_id}`

#### Purpose

Update metadata for one photo owned by the currently authenticated creator.

#### Authentication

This endpoint requires a bearer access token for an authenticated creator.

#### Request Headers

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "category_slug": "ulica",
  "description": "Historic market square after renovation.",
  "location_text": "Rynek",
  "taken_year": 1982,
  "taken_month": 1,
  "taken_day": 14
}
```

#### Request Notes

- this first Sprint 3 edit flow covers metadata only,
- `description` may be empty in this first version,
- file replacement is out of scope for this endpoint,
- the same validation rules used by photo creation apply to category and date fields.

#### Success Response

Status:

```text
200 OK
```

Body:

```json
{
  "photo": {
    "id": 1,
    "owner_id": 1,
    "category_id": 1,
    "description": "Historic market square after renovation.",
    "location_text": "Rynek",
    "taken_year": 1982,
    "taken_month": 1,
    "taken_day": 14,
    "category": {
      "id": 1,
      "slug": "ulica",
      "name": "Ulica",
      "parent_id": null
    },
    "created_at": "2026-04-04T10:00:00Z",
    "updated_at": "2026-04-04T11:30:00Z"
  }
}
```

#### Error Responses

`400 Bad Request`

```json
{
  "detail": "Unknown photo category."
}
```

`401 Unauthorized`

```json
{
  "detail": "Not authenticated."
}
```

`403 Forbidden`

```json
{
  "detail": "Only creators can manage photos."
}
```

`404 Not Found`

```json
{
  "detail": "Photo not found."
}
```

`422 Unprocessable Entity`

```json
{
  "detail": [
    {
      "loc": ["taken_day"],
      "msg": "Value error, taken_day requires taken_month.",
      "type": "value_error"
    }
  ]
}
```

### `DELETE /api/v1/photos/{photo_id}`

#### Purpose

Delete one photo owned by the currently authenticated creator.

#### Authentication

This endpoint requires a bearer access token for an authenticated creator.

#### Request Headers

```text
Authorization: Bearer <access_token>
```

#### Success Response

Status:

```text
204 No Content
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
  "detail": "Only creators can manage photos."
}
```

`404 Not Found`

```json
{
  "detail": "Photo not found."
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
