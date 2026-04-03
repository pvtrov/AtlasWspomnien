# ADR 001: Technology Stack

## Status

Accepted

## Context

The project needs a maintainable full-stack architecture for a web-based community archive application. The system must support:

- multiple user roles,
- authenticated and unauthenticated access paths,
- metadata-rich photo records,
- future search and moderation workflows,
- accessible and responsive user experience,
- a public and a private REST API.

The selected stack should be practical for iterative development and suitable for a clean separation between backend and frontend responsibilities.

## Decision

The project will use:

- Python with FastAPI for the backend API,
- SQLAlchemy for the data model and persistence layer,
- Alembic for database migrations,
- PostgreSQL as the relational database,
- React with Next.js and TypeScript for the frontend,
- uv for Python dependency and project management,
- pnpm for frontend package management,
- Git and GitHub for version control and collaboration.

Docker is not part of the mandatory stack decision at this stage, but it remains an approved option for local infrastructure and environment consistency.

## Rationale

FastAPI is a strong fit for an API-oriented backend and offers a good balance between structure, speed, and clarity.

PostgreSQL fits the relational and metadata-heavy nature of the domain model, while SQLAlchemy and Alembic provide a reliable path for evolving the schema over time.

React and Next.js provide a structured frontend foundation suitable for a public-facing application with multiple user flows. TypeScript improves maintainability and reduces errors at the UI and integration layer.

uv and pnpm were selected as modern development tools that support efficient local workflows without introducing unnecessary complexity.

## Consequences

Positive consequences:

- clear separation between backend and frontend,
- good support for REST APIs and typed data exchange,
- scalable foundation for future features,
- documentation-friendly architecture.

Tradeoffs:

- the project will operate as a multi-part stack rather than a single monolith,
- the frontend and backend toolchains must be managed separately,
- some early setup effort is required to establish the development environment cleanly.
