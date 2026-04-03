# Current Status

## Project State

The project has completed Sprint 1 foundation work, Sprint 2 authentication foundation work, and the first Sprint 3 photo domain foundation slice.

The repository structure has been created, the core technology stack has been selected, Git workflow has been established, and Docker has been adopted as the primary local development environment.

The repository now includes:

- a working FastAPI scaffold,
- a working Next.js scaffold,
- PostgreSQL database foundation and migration scaffolding,
- a persisted user domain model with role representation,
- a persisted photo domain foundation with creator ownership and first-version metadata fields,
- backend creator registration and login endpoints,
- password hashing and JWT-based authentication foundation,
- frontend login and registration screens connected to backend authentication,
- minimal frontend authenticated state handling,
- a backend health endpoint,
- a protected backend auth route for current-user access,
- a frontend status page with backend connectivity and auth-state visibility,
- project and sprint documentation aligned with the implemented Sprint 1, Sprint 2, and current Sprint 3 scope.

The current repository state is ready to move from authentication foundation work into the next Sprint 3 product slices that build on the new photo domain foundation.

## Confirmed Decisions

- Project purpose and product direction: see [project-overview.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/project-overview.md)
- High-level architecture: see [architecture.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/architecture.md)
- Technology stack decision: see [001-technology-stack.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/decisions/001-technology-stack.md)
- Photo storage strategy: see [002-photo-storage-strategy.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/decisions/002-photo-storage-strategy.md)
- Git branching strategy: see [git-workflow.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/git-workflow.md)
- Local development setup and Docker usage: see [setup.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/setup.md)
- MVP scope: see [mvp.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/product/mvp.md)
- User stories: see [user-stories.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/product/user-stories.md)
- Epics and implementation tasks: see [epics-and-tasks.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/product/epics-and-tasks.md)
- Current implementation scope for Sprint 1: see [sprint-1.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/sprints/sprint-1.md)
- Current implementation scope for Sprint 2: see [sprint-2.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/sprints/sprint-2.md)
- Current implementation scope for Sprint 3: see [sprint-3.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/sprints/sprint-3.md)

## Current Repository Structure

The repository currently contains the main areas agreed for the project:

- `backend/` for the Python API and backend logic,
- `frontend/` for the web application,
- `documentation/` for project-facing knowledge and decisions,
- `infra/` for infrastructure-related files,
- `scripts/` for helper scripts,
- `tests/` for top-level cross-system tests,
- `Requirements/` for source requirements and original project input.

## Implemented Foundation So Far

The repository now includes the implemented Sprint 1 foundation, the Sprint 2 authentication foundation, and the first Sprint 3 photo domain foundation slice:

### Backend

- FastAPI foundation with application entry point, central routing, versioned API routing, configuration, and a health-check endpoint,
- environment-loading structure for local and Docker-based development,
- a backend CORS configuration path driven by environment settings for local frontend access,
- creator registration and login endpoints,
- password hashing and credential verification,
- JWT-based bearer-token authentication for Sprint 2,
- an authenticated current-user route at `/api/v1/auth/me`,
- backend auth tests alongside the existing health smoke test coverage.

### Database

- SQLAlchemy base, engine, and session scaffolding,
- Alembic configuration wired to the backend environment settings,
- an initial empty migration baseline ready for future schema changes,
- a user persistence migration that creates the initial `users` table,
- a photo persistence migration that creates the initial `photos` table,
- Docker-based automatic `alembic upgrade head` during backend startup,
- database connectivity driven through `DATABASE_URL`.

### User Domain

- an initial persisted `User` model,
- explicit stored roles for `creator` and `administrator`,
- an implicit public `viewer` role for non-authenticated archive access,
- a unique `username` field as the initial nick or handle representation,
- a user blocking flag to support later MVP moderation flow,
- backend user and auth schemas for registration, login, and current-user flows.

### Photo Domain

- an initial persisted `Photo` model,
- creator ownership through `owner_id` linked to `users.id`,
- first-version photo metadata stored directly on the `photos` table,
- initial metadata fields for `description`, `location_text`, `taken_year`, `taken_month`, and `taken_day`,
- a nullable `file_reference` field to prepare for later upload and storage flows,
- backend photo schemas for creation and read operations,
- database indexes that support creator ownership and later date/location filtering work.

### Frontend

- Next.js application foundation with root layout and a simple status page,
- shared frontend styling foundation through global styles and design tokens,
- a minimal layout component and shared frontend API base URL resolution,
- a browser-side connectivity check from frontend to backend health endpoint,
- login and registration pages,
- frontend auth API calls for registration, login, and current-user lookup,
- minimal client-side auth state using the Sprint 2 access token,
- simple logged-in vs logged-out behavior on the frontend home page.

### Local Development

- Docker-based local structure for backend, frontend, and PostgreSQL services.
- backend startup now waits for healthy PostgreSQL and applies migrations automatically before starting the development server.

## Working Rules

- Before making changes in the codebase, propose the idea step by step and wait for user approval before implementation.
- Keep project knowledge in `documentation/` so future threads can continue work from repository state instead of chat history alone.
- Local helper files such as `AI-NOTES.md` and `AGENTS.md` may be used if needed, but they should remain local-only and must not be pushed to the remote repository.
- Use Git and GitHub as the project version control workflow.
- Functional tests should be added at the end when requested by the user, or explicitly proposed once functional code is ready.

## Next Recommended Step

The next recommended implementation step is to continue deeper into Sprint 3 beyond the photo domain foundation.

The most natural next product and implementation area is:

- category or hierarchy foundation,
- photo upload and file-reference persistence flows,
- authenticated creator-facing views built on top of the current auth foundation,
- additional protected backend routes tied to the next business slice.
