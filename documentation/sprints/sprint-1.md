# Sprint 1

## Sprint Goal

Build the technical foundation of the project so the repository contains a working backend, a working frontend, a working database connection path, and the minimum structure required for further feature implementation.

Sprint 1 is intentionally focused on infrastructure and application scaffolding rather than on full business functionality.

## In Scope

Sprint 1 includes:

- backend application scaffolding,
- frontend application scaffolding,
- backend configuration structure,
- frontend base structure,
- PostgreSQL connection scaffolding,
- migration scaffolding,
- backend health-check endpoint,
- frontend application status page,
- basic frontend-to-backend connectivity check,
- initial domain foundation preparation for future `User` and `Photo` entities,
- documentation updates related to the application foundation.

## Out of Scope

Sprint 1 does not include:

- full authentication,
- registration and login flows,
- file upload,
- image storage integration,
- full archive domain implementation,
- search and filtering features,
- administration views,
- moderation workflows,
- advanced accessibility refinements beyond sensible defaults in scaffolding.

## Expected Outcome

At the end of Sprint 1, the project should provide:

- a runnable FastAPI application,
- a runnable Next.js application,
- a working Docker-based development setup,
- a backend route for health/status verification,
- a frontend page that confirms the application is alive,
- a confirmed backend-to-database wiring path,
- a clear code structure ready for Sprint 2 work.

## Sprint 1 Task Breakdown

### 1. Backend Scaffolding

#### Goal

Create the initial FastAPI codebase shape that future features can build on.

#### Current Status

This backend scaffolding work package has been implemented.

The repository now includes:

- the FastAPI application entry point,
- application package initialization,
- central router structure,
- versioned API routing,
- a simple health-check route,
- a backend configuration module,
- an environment variable loading strategy,
- a basic backend smoke test for the health endpoint.

#### Tasks

- Create backend dependency management files.
- Create the FastAPI application entry point.
- Add application package initialization where needed.
- Add central router structure.
- Add a versioned API routing structure.
- Add a simple health-check route.
- Add backend configuration module.
- Add environment variable loading strategy.

#### Agent Notes

- Keep the structure aligned with the documented backend layout.
- Prefer simple scaffolding over feature-complete abstractions.
- Do not introduce authentication logic yet.

### 2. Database Foundation

#### Goal

Prepare the backend for PostgreSQL-backed persistence.

#### Current Status

This database foundation work package has now been scaffolded.

The repository includes:

- shared SQLAlchemy base configuration,
- database engine and session setup driven by environment configuration,
- Alembic migration scaffolding,
- an initial empty migration baseline for future schema evolution.

#### Tasks

- Add SQLAlchemy base configuration.
- Add database engine and session setup.
- Add Alembic configuration.
- Add initial migration baseline.
- Verify that environment variables can drive database connectivity.

#### Agent Notes

- The goal is readiness, not a fully populated domain model.
- If needed, use minimal placeholder model setup to establish the migration path.

### 3. Frontend Scaffolding

#### Goal

Create the initial Next.js application structure for future feature development.

#### Current Status

This frontend scaffolding work package has been implemented.

The repository now includes:

- frontend dependency management files,
- the base Next.js application structure,
- a root layout,
- a simple home/status page,
- a minimal shared styles setup,
- a basic frontend service layer placeholder for future backend communication.

#### Tasks

- Create frontend dependency management files.
- Create the base Next.js application structure.
- Add root layout.
- Add a simple home or status page.
- Add a minimal shared styles setup.
- Add a basic service layer placeholder for backend communication.

#### Agent Notes

- Keep the initial UI intentionally simple.
- The main purpose is to establish structure, not final product design.

### 4. Frontend-Backend Connectivity

#### Goal

Confirm that the frontend can communicate with the backend in the local development environment.

#### Tasks

- Define the frontend API base URL strategy.
- Add a basic status request from frontend to backend.
- Display a simple success or failure state in the UI.

#### Agent Notes

- This connectivity check is enough for Sprint 1.
- No full API client architecture is required yet.

### 5. Initial Domain Preparation

#### Goal

Prepare the minimum structure needed for later domain modeling work.

#### Tasks

- Reserve backend modules for models and schemas.
- Optionally add minimal placeholder entities or comments for `User` and `Photo`.
- Document any early assumptions that affect future domain design.

#### Agent Notes

- Do not overdesign the domain in Sprint 1.
- The real archive model belongs to the next stage.

### 6. Documentation Updates

#### Goal

Keep the repository state understandable for future threads and contributors.

#### Tasks

- Update setup documentation if startup steps become more concrete.
- Update architecture documentation if implementation introduces clarifications.
- Update current status documentation after Sprint 1 is implemented.

#### Agent Notes

- Documentation changes are part of the sprint, not a separate afterthought.

## Suggested Delivery Order Inside Sprint 1

The recommended order of execution inside the sprint is:

1. backend scaffolding,
2. database foundation,
3. frontend scaffolding,
4. frontend-backend connectivity,
5. documentation update pass.

## Definition of Done for Sprint 1

Sprint 1 can be treated as complete when:

- backend starts successfully,
- frontend starts successfully,
- Docker environment starts successfully,
- backend health endpoint responds,
- frontend can confirm backend status,
- codebase structure matches the intended architecture,
- the repository documentation reflects the implemented foundation.
