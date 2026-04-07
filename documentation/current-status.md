# Current Status

## Project State

The project has completed Sprint 1 foundation work, Sprint 2 authentication foundation work, Sprint 3 for its currently planned scope covering photo domain, photo organization, backend upload, and creator-facing photo management, Sprint 4 for its currently planned moderation foundation scope, Sprint 5 shared archive browsing and moderation-in-context scope, Sprint 6 map-based discovery together with practical shared-archive search and filtering, and the currently planned Sprint 7 scope for public-facing polish, branding refinement, and core creator/admin UI refinement.

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
- successful-login timestamp tracking that now preserves the previous administrator login window for recent-photo review,
- frontend login and registration screens connected to backend authentication,
- minimal frontend authenticated state handling,
- a frontend creator photo workspace with upload, owned-photo list, detail, edit, and delete flows,
- administrator-only backend moderation routes for user listing, creator blocking, administrator promotion, photo metadata correction, and photo removal,
- an administrator-only backend recent-photo review route that lists photos with activity since the previous successful administrator login,
- administrator visibility into shared backend photo listing and detail routes for moderation work,
- public backend shared photo listing, detail, and image retrieval routes for archive browsing,
- public backend shared photo reading now extended with optional photo coordinates,
- public backend shared photo browsing now extended with practical text search and filtering by category, location text, and historical date fields,
- blocked-creator restrictions that still allow login and viewing while preventing new uploads and metadata edits,
- a backend bootstrap script for creating the first administrator account or promoting an existing user,
- a backend health endpoint,
- a protected backend auth route for current-user access,
- a shared frontend archive browsing page on the home route with public photo detail pages,
- a shared frontend archive discovery surface on the home route with a photo list, map-based browsing for coordinate-bearing photos, and inline photo details,
- a shared frontend archive filter surface on the home route with collapsible search and filtering controls, exact/range date filtering, and active-filter summaries,
- administrator-only moderation controls embedded into the shared frontend photo detail page,
- an administrator review section that lists recently active photos and links each item into the shared photo detail moderation flow,
- a frontend redirect from `/all_photos` to the shared home-page archive listing,
- photo metadata now separated into a human-facing optional `display_name` title and a required `location_text` location field,
- creator and administrator photo forms now include OSM-based location suggestions that can fill both the location text and coordinates,
- a Sprint 7 public archive visual refinement aligned with `Atlas Wspomnień` and the `Rose Dust` direction,
- a calmer Sprint 7 creator workspace and administrator moderation workspace aligned more closely with the public archive presentation,
- refined detailed photo views where the photo acts as the main visual anchor and can be opened in a larger overlay view,
- a creator blocked-state frontend treatment that greys out only add/edit panels while still allowing blocked creators to browse their own photo list and detail presentation,
- backend test coverage for the implemented administration and moderation behavior,
- backend test coverage for the implemented shared archive browsing behavior,
- project and sprint documentation aligned with the implemented Sprint 1, Sprint 2, Sprint 3, Sprint 4 moderation scope, Sprint 5 shared browsing and moderation-in-context scope, Sprint 6 map, search, and filtering scope, and current Sprint 7 polish work.

The current repository state now includes the shared archive browsing layer together with administrator moderation controls embedded into shared photo views, the first map-based discovery layer for photos with usable coordinates, practical Sprint 6 search-and-filtering wired directly into the shared archive experience, a focused administrator recent-photo review slice driven by successful-login windows, and a first substantial Sprint 7 polish pass across the public archive, creator workspaces, administrator moderation view, and detailed photo presentation.

## Confirmed Decisions

- Project purpose and product direction: see [project-overview.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/project-overview.md)
- High-level architecture: see [architecture.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/architecture.md)
- Technology stack decision: see [001-technology-stack.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/decisions/001-technology-stack.md)
- Photo storage strategy: see [002-photo-storage-strategy.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/decisions/002-photo-storage-strategy.md)
- Branding direction, product name, and UI language direction: see [003-branding-direction.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/decisions/003-branding-direction.md)
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
- Current implementation scope for Sprint 6: see [sprint-6.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/sprints/sprint-6.md)
- Current implementation scope for Sprint 7: see [sprint-7.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/sprints/sprint-7.md)

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

The repository now includes the implemented Sprint 1 foundation, the Sprint 2 authentication foundation, the Sprint 3 photo and creator-management scope, the Sprint 4 moderation foundation scope, the Sprint 5 shared browsing and moderation-in-context foundation, Sprint 6 map, search, and filtering foundation, and the current Sprint 7 UI polish and branding refinement foundation:

### Backend

- FastAPI foundation with application entry point, central routing, versioned API routing, configuration, and a health-check endpoint,
- environment-loading structure for local and Docker-based development,
- a backend CORS configuration path driven by environment settings for local frontend access,
- creator registration and login endpoints,
- password hashing and credential verification,
- JWT-based bearer-token authentication for Sprint 2,
- successful-login timestamp rotation that preserves the previous administrator login window for moderation review,
- an authenticated current-user route at `/api/v1/auth/me`,
- public shared photo listing, detail, and image retrieval routes under `/api/v1/photos`,
- public shared photo listing now supports practical archive `query`, `category`, `location`, `taken_year`, `taken_month`, `date_from`, and `date_to` filters,
- an authenticated creator-only photo upload route at `/api/v1/photos`,
- authenticated creator-owned photo listing, detail, metadata update, delete, and image retrieval routes under `/api/v1/photos`,
- administrator visibility into backend photo list, detail, and image access for moderation work,
- administrator moderation routes under `/api/v1/admin` for user listing, creator blocking, administrator promotion, photo metadata edit, and photo removal,
- an administrator-only `/api/v1/admin/recent-photos` route that returns photos whose latest activity falls inside the previous successful administrator login window,
- blocked-creator backend rules that allow login and viewing but prevent upload and metadata update actions,
- local filesystem photo storage handling for uploaded archive materials,
- backend validation for Sprint 3 photo upload and edit fields, including optional empty descriptions,
- backend search normalization that ignores case and Polish diacritics in both stored photo data and user-entered shared archive filters,
- request-validation and upload-flow logging for easier debugging when creator photo requests fail,
- a backend bootstrap script for creating the first administrator account or promoting an existing user,
- backend auth tests alongside health, moderation, and admin bootstrap script coverage.

### Database

- SQLAlchemy base, engine, and session scaffolding,
- Alembic configuration wired to the backend environment settings,
- an initial empty migration baseline ready for future schema changes,
- a user persistence migration that creates the initial `users` table,
- a photo persistence migration that creates the initial `photos` table,
- a follow-up photo persistence migration that adds optional `latitude` and `longitude` fields,
- a follow-up photo persistence migration that adds optional `display_name` for human-facing photo titles,
- photo records now persisted together with local-storage file references after upload,
- Docker-based automatic `alembic upgrade head` during backend startup,
- database connectivity driven through `DATABASE_URL`.

### User Domain

- an initial persisted `User` model,
- explicit stored roles for `creator` and `administrator`,
- an implicit public `viewer` role for non-authenticated archive access,
- a unique `username` field as the initial nick or handle representation,
- a user blocking flag now used by the implemented MVP moderation flow,
- login-tracking fields for `last_successful_login_at` and `previous_successful_login_at`,
- backend user and auth schemas for registration, login, and current-user flows.

### Photo Domain

- an initial persisted `Photo` model,
- creator ownership through `owner_id` linked to `users.id`,
- first-version photo metadata stored directly on the `photos` table,
- photo metadata fields for `description`, optional `display_name`, `location_text`, optional `latitude`, optional `longitude`, `taken_year`, `taken_month`, and `taken_day`,
- a `file_reference` field now used to link persisted metadata with separately stored local photo files,
- backend photo schemas for creation, upload validation, update, and read operations now extended to support optional coordinates and optional `display_name`,
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
- a shared archive discovery view on the frontend home page at `/`,
- a shared public photo detail page at `/all_photos/[photoId]`,
- administrator-only photo metadata edit and removal controls embedded into that shared photo detail page,
- a redirect from `/all_photos` back to the shared home-page archive listing,
- a creator photo workspace at `/photos`,
- a creator-owned photo detail view at `/photos/[photoId]`,
- creator and administrator location input that supports typed place names, OSM-based suggestions, browser-side geocoding, direct pin placement, and coordinate clearing,
- shared archive filters with collapsible search controls, exact/range date input, active-filter chips, and map reset behavior after filter application,
- frontend upload, list, detail, edit, and delete flows aligned with the documented backend contract,
- a basic administrator page for user listing and creator blocking,
- an administrator review section for photos added or updated since the previous successful administrator login,
- photo rendering through a shared public image endpoint without exposing storage references in the UI,
- frontend behavior that keeps non-admin users on the same shared photo detail layer without showing moderation controls,
- a shared map view that shows only photos with usable coordinates, supports pan/zoom/reset interaction, and keeps the selected photo details visible beside the map on desktop layouts,
- photo cards and detail views that use `display_name` as the preferred title while still showing `location_text` as the location field,
- a public archive browsing layer visually refined around the `Atlas Wspomnień` branding and `Rose Dust` direction,
- creator upload, owned-photo, and edit views with improved hierarchy, calmer spacing, and more product-consistent layout polish,
- an administrator user-management page with improved readability and stronger visual consistency with the rest of the archive product,
- detailed photo pages that emphasize the image more strongly, group metadata more clearly, and support click-to-enlarge image viewing,
- blocked-creator frontend treatment that keeps owned-photo browsing available while disabling add/edit panels with a clear Polish-language status message.

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

The most natural next implementation step after the current Sprint 7 polish work is to continue from the now-refined shared archive and authenticated workspace foundation into whichever post-Sprint-7 slice is prioritized next.

The strongest current follow-up areas are:

- closing any remaining Polish-language and branding inconsistencies outside the already polished primary views,
- targeted accessibility refinement across the newly polished public, creator, and administrator surfaces,
- further archive discovery or moderation improvements built on the now more consistent shared detail and workspace layouts.
