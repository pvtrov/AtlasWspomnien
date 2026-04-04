# Current Status

## Project State

The project has completed Sprint 1 foundation work, Sprint 2 authentication foundation work, Sprint 3 for its currently planned scope covering photo domain, photo organization, backend upload, and creator-facing photo management, Sprint 4 for its currently planned moderation foundation scope, and the currently planned Sprint 5 shared archive browsing and moderation-in-context scope.

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
- administrator-only backend moderation routes for user listing, creator blocking, administrator promotion, photo metadata correction, and photo removal,
- administrator visibility into shared backend photo listing and detail routes for moderation work,
- public backend shared photo listing, detail, and image retrieval routes for archive browsing,
- blocked-creator restrictions that still allow login and viewing while preventing new uploads and metadata edits,
- a backend bootstrap script for creating the first administrator account or promoting an existing user,
- a backend health endpoint,
- a protected backend auth route for current-user access,
- a shared frontend archive browsing page on the home route with public photo detail pages,
- administrator-only moderation controls embedded into the shared frontend photo detail page,
- a frontend redirect from `/all_photos` to the shared home-page archive listing,
- backend test coverage for the implemented administration and moderation behavior,
- backend test coverage for the implemented shared archive browsing behavior,
- project and sprint documentation aligned with the implemented Sprint 1, Sprint 2, Sprint 3, Sprint 4 moderation scope, and current Sprint 5 shared browsing and moderation-in-context scope.

The current repository state now includes the first shared archive browsing layer together with administrator moderation controls embedded into shared photo views, and is ready for later browsing/search refinements beyond the current Sprint 5 scope.

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
- Current implementation scope for Sprint 4: see [sprint-4.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/sprints/sprint-4.md)
- Current implementation scope for Sprint 5: see [sprint-5.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/sprints/sprint-5.md)

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

The repository now includes the implemented Sprint 1 foundation, the Sprint 2 authentication foundation, the Sprint 3 photo and creator-management scope, the Sprint 4 moderation foundation scope, and the current Sprint 5 shared browsing and moderation-in-context foundation:

### Backend

- FastAPI foundation with application entry point, central routing, versioned API routing, configuration, and a health-check endpoint,
- environment-loading structure for local and Docker-based development,
- a backend CORS configuration path driven by environment settings for local frontend access,
- creator registration and login endpoints,
- password hashing and credential verification,
- JWT-based bearer-token authentication for Sprint 2,
- an authenticated current-user route at `/api/v1/auth/me`,
- public shared photo listing, detail, and image retrieval routes under `/api/v1/photos`,
- an authenticated creator-only photo upload route at `/api/v1/photos`,
- authenticated creator-owned photo listing, detail, metadata update, delete, and image retrieval routes under `/api/v1/photos`,
- administrator visibility into backend photo list, detail, and image access for moderation work,
- administrator moderation routes under `/api/v1/admin` for user listing, creator blocking, administrator promotion, photo metadata edit, and photo removal,
- blocked-creator backend rules that allow login and viewing but prevent upload and metadata update actions,
- local filesystem photo storage handling for uploaded archive materials,
- backend validation for Sprint 3 photo upload and edit fields, including optional empty descriptions,
- request-validation and upload-flow logging for easier debugging when creator photo requests fail,
- a backend bootstrap script for creating the first administrator account or promoting an existing user,
- backend auth tests alongside health, moderation, and admin bootstrap script coverage.

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
- a user blocking flag now used by the implemented MVP moderation flow,
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

- Next.js application foundation with root layout,
- shared frontend styling foundation through global styles and design tokens,
- a minimal layout component and shared frontend API base URL resolution,
- a browser-side connectivity check from frontend to backend health endpoint,
- login and registration pages,
- frontend auth API calls for registration, login, and current-user lookup,
- minimal client-side auth state using the Sprint 2 access token,
- a shared archive listing on the frontend home page at `/`,
- a shared public photo detail page at `/all_photos/[photoId]`,
- administrator-only photo metadata edit and removal controls embedded into that shared photo detail page,
- a redirect from `/all_photos` back to the shared home-page archive listing,
- a creator photo workspace at `/photos`,
- a creator-owned photo detail view at `/photos/[photoId]`,
- frontend upload, list, detail, edit, and delete flows aligned with the documented backend contract,
- a basic administrator page for user listing and creator blocking,
- photo rendering through a shared public image endpoint without exposing storage references in the UI,
- frontend behavior that keeps non-admin users on the same shared photo detail layer without showing moderation controls.

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

The next recommended implementation step is to move beyond the current Sprint 5 foundation into later archive refinement work.

The most natural next product and implementation area is:

- shared archive browsing search improvements,
- richer filtering built on the unified archive-viewing layer,
- refinement of the shared archive experience without replacing the in-context moderation overlay.
