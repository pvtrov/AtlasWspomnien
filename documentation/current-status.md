# Current Status

## Project State

The project has completed Sprint 1 foundation work, Sprint 2 authentication foundation work, and Sprint 3 for its currently planned scope covering photo domain, photo organization, backend upload, and creator-facing photo management.

The repository structure has been created, the core technology stack has been selected, Git workflow has been established, and Docker has been adopted as the primary local development environment.

The repository now includes:

- a working FastAPI scaffold,
- a working Next.js scaffold,
- PostgreSQL database foundation and migration scaffolding,
- a persisted user domain model with role representation,
- a persisted photo domain foundation with creator ownership and first-version metadata fields,
- a persisted photo organization foundation with primary category linkage and future-ready parent-child support,
- a backend photo upload flow with local filesystem storage and persisted database file references,
- creator-owned backend photo listing, detail, metadata edit, delete, and authenticated image retrieval,
- backend creator registration and login endpoints,
- password hashing and JWT-based authentication foundation,
- frontend login and registration screens connected to backend authentication,
- minimal frontend authenticated state handling,
- a frontend creator photo workspace with upload, owned-photo list, detail, edit, and delete flows,
- a backend health endpoint,
- a protected backend auth route for current-user access,
- a frontend status page with backend connectivity and auth-state visibility,
- project and sprint documentation aligned with the implemented Sprint 1, Sprint 2, and current Sprint 3 scope.

The current repository state is ready to move beyond the current Sprint 3 creator upload and management scope into later archive browsing, search, moderation, and refinement work.

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
- `requirements/` for source requirements and original project input.

## Implemented Foundation So Far

The repository now includes the implemented Sprint 1 foundation, the Sprint 2 authentication foundation, and the currently planned Sprint 3 photo and creator-management scope:

### Backend

- FastAPI foundation with application entry point, central routing, versioned API routing, configuration, and a health-check endpoint,
- environment-loading structure for local and Docker-based development,
- a backend CORS configuration path driven by environment settings for local frontend access,
- creator registration and login endpoints,
- password hashing and credential verification,
- JWT-based bearer-token authentication for Sprint 2,
- an authenticated current-user route at `/api/v1/auth/me`,
- an authenticated creator-only photo upload route at `/api/v1/photos`,
- authenticated creator-owned photo listing, detail, metadata update, delete, and image retrieval routes under `/api/v1/photos`,
- local filesystem photo storage handling for uploaded archive materials,
- backend validation for Sprint 3 photo upload and edit fields, including optional empty descriptions,
- request-validation and upload-flow logging for easier debugging when creator photo requests fail,
- backend auth tests alongside the existing health smoke test coverage.

### Database

- SQLAlchemy base, engine, and session scaffolding,
- Alembic configuration wired to the backend environment settings,
- an initial empty migration baseline ready for future schema changes,
- a user persistence migration that creates the initial `users` table,
- a photo persistence migration that creates the initial `photos` table,
- photo records now persisted together with local-storage file references after upload,
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
- a `file_reference` field now used to link persisted metadata with separately stored local photo files,
- backend photo schemas for creation, upload validation, and read operations,
- database indexes that support creator ownership and later date/location filtering work.

### Photo Organization

- an initial persisted `PhotoCategory` model,
- a required primary category relationship from each photo through `category_id`,
- optional `parent_id` support on categories so the structure can grow into parent-child hierarchy later,
- seeded MVP starter categories: `ulica`, `budynek`, and `park`,
- category kept separate from `location_text` and historical date metadata,
- backend photo schemas extended to carry category input and read data without adding hierarchy management behavior.

### Frontend

- Next.js application foundation with root layout and a simple status page,
- shared frontend styling foundation through global styles and design tokens,
- a minimal layout component and shared frontend API base URL resolution,
- a browser-side connectivity check from frontend to backend health endpoint,
- login and registration pages,
- frontend auth API calls for registration, login, and current-user lookup,
- minimal client-side auth state using the Sprint 2 access token,
- simple logged-in vs logged-out behavior on the frontend home page,
- a creator photo workspace at `/photos`,
- a creator-owned photo detail view at `/photos/[photoId]`,
- frontend upload, list, detail, edit, and delete flows aligned with the documented backend contract,
- private photo rendering through an authenticated backend image endpoint without exposing storage references in the UI.

### Local Development

- Docker-based local structure for backend, frontend, and PostgreSQL services.
- backend startup now waits for healthy PostgreSQL and applies migrations automatically before starting the development server.
- uploaded photo files are stored through a local backend storage directory mounted into the backend container.

## Working Rules

- Before making changes in the codebase, propose the idea step by step and wait for user approval before implementation.
- Keep project knowledge in `documentation/` so future threads can continue work from repository state instead of chat history alone.
- Local helper files such as `AI-NOTES.md` and `AGENTS.md` may be used if needed, but they should remain local-only and must not be pushed to the remote repository.
- Use Git and GitHub as the project version control workflow.
- Functional tests should be added at the end when requested by the user, or explicitly proposed once functional code is ready.

## Next Recommended Step

The next recommended implementation step is to move into the first post-creator-management product slice now that the Sprint 3 creator upload and management flow is working.

The most natural next product and implementation area is:

- public archive browsing built on top of the now-stable photo domain and creator-management foundation,
- the first browse/search backend contracts for non-public and later public archive access,
- follow-up refinement such as stronger frontend validation and broader automated test coverage for the creator photo flow.
