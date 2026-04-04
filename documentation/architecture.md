# Architecture

## Selected Stack

The project will use the following technology stack:

- Backend: Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Frontend: React, Next.js, TypeScript
- Development tools: Git, GitHub, uv, pnpm
- Local development environment: Docker and Docker Compose

## Why This Stack

### Backend

Python was selected for the backend because it matches the intended project direction and provides a productive, well-supported environment for building web APIs and business logic.

FastAPI was selected as the backend framework because it offers:

- a modern API-first development model,
- built-in request and response validation,
- clean support for REST services,
- automatic OpenAPI documentation,
- a structure that fits well with a separate frontend application.

SQLAlchemy was selected as the persistence layer because it provides a mature and flexible way to model application entities and organize data access logic.

Alembic was selected for schema migrations so database changes can be introduced incrementally and safely as the project evolves.

PostgreSQL was selected as the database because the system requires a strong relational model for:

- users and roles,
- photo records,
- metadata,
- hierarchical classification,
- moderation history,
- audit-related data.

The initial Sprint 2 user domain foundation is based on a single `users` table with:

- unique email identity,
- a unique `username` used as the initial public nick/handle,
- explicit stored roles for `creator` and `administrator`,
- an `is_blocked` flag for future MVP moderation flow,
- an implicit public `viewer` role that is not stored in the database at this stage.

## Authentication Foundation

The Sprint 2 authentication foundation uses:

- password hashing for stored credentials,
- signed bearer JWT access tokens for authenticated API access,
- a simple authenticated-user dependency for protected route access.

This first implementation is intentionally limited to a minimal MVP foundation and does not include refresh tokens, external identity providers, or full business-domain authorization rules.

### Frontend

React was selected for the frontend because it provides a strong ecosystem for component-based user interfaces and supports building accessible, interactive applications.

Next.js was selected as the frontend framework because it provides:

- a clear application structure from the beginning,
- built-in routing,
- a good foundation for public-facing pages,
- a strong long-term fit for a production web application.

TypeScript was selected to improve maintainability, reduce avoidable UI integration errors, and make API contracts easier to work with as the project grows.

### Local Development Environment

Docker was selected as the primary local development environment because the project should run through a consistent, reproducible stack rather than depending on manually aligned host-level runtime installations.

The local Docker setup is intended to manage:

- the frontend application runtime,
- the backend application runtime,
- the PostgreSQL database.

This approach was selected to:

- reduce environment drift between machines,
- simplify onboarding,
- keep service boundaries explicit,
- make the project easier to run as a full stack from the beginning.

## High-Level System Shape

The current architectural direction is:

- `frontend/` contains the user-facing web application,
- `backend/` contains the API and business logic,
- PostgreSQL stores structured application data,
- Docker Compose orchestrates the local multi-service development environment,
- image files are handled separately from the relational database,
- uploaded photos are currently planned to be stored on local filesystem storage mounted into the backend container,
- photo metadata and file reference information are stored in PostgreSQL,
- `documentation/` stores project-facing knowledge and technical decisions.

## Implemented Application Foundation

The repository currently includes:

- a working authentication foundation with persisted users, password hashing, login, registration, and JWT-based API access,
- a persisted photo domain with creator ownership and first-version metadata fields,
- a minimal photo organization foundation based on one primary category per photo,
- local filesystem storage for uploaded photo files,
- creator-owned photo upload and management flows across backend and frontend,
- documented API contracts for authentication and creator photo management.

## Container Responsibilities

The planned local container responsibilities are:

- `frontend`: runs the Next.js development application,
- `backend`: runs the FastAPI development application,
- `postgres`: provides persistent relational storage for application data.

Object storage for uploaded files is expected to be introduced later as a separate service when file handling is implemented.

The current storage decision for uploaded photos is documented in [002-photo-storage-strategy.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/decisions/002-photo-storage-strategy.md).

## Documentation Principle

The repository will document not only what was built, but also why technical decisions were made. This is intended to keep architectural reasoning visible over time and reduce guesswork during future development.
