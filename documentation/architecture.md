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
- image files will be handled separately from the relational database,
- `documentation/` stores project-facing knowledge and technical decisions.

## Container Responsibilities

The planned local container responsibilities are:

- `frontend`: runs the Next.js development application,
- `backend`: runs the FastAPI development application,
- `postgres`: provides persistent relational storage for application data.

Object storage for uploaded files is expected to be introduced later as a separate service when file handling is implemented.

## Documentation Principle

The repository will document not only what was built, but also why technical decisions were made. This is intended to keep architectural reasoning visible over time and reduce guesswork during future development.
