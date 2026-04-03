# Sprint 2

## Sprint Goal

Build the first user and authentication foundation for the project so the application can represent users, support creator registration and login, protect selected backend routes, and prepare the frontend for basic authentication flows.

Sprint 2 is focused on identity and access foundation, not on complete account management or advanced security features.

## In Scope

Sprint 2 includes:

- user model foundation,
- role representation,
- database migration for user-related persistence,
- creator registration,
- login,
- password hashing and credential verification,
- basic authentication mechanism,
- protected backend route example,
- frontend login screen,
- frontend registration screen,
- initial frontend authenticated state handling,
- documentation updates related to authentication foundation.

## Out of Scope

Sprint 2 does not include:

- OAuth login through Google, Facebook, or other identity providers,
- password reset and recovery flows,
- user profile editing,
- advanced account management,
- administrator-facing user management tools,
- refresh token architecture,
- advanced security hardening beyond the initial MVP auth foundation,
- permissions across all business domains,
- photo upload or archive management features.

## Expected Outcome

At the end of Sprint 2, the project should provide:

- a persisted user model,
- role-aware user representation,
- backend registration and login endpoints,
- hashed password storage,
- at least one protected backend route,
- frontend login and registration views,
- a minimal frontend authentication flow connected to backend auth endpoints,
- a code structure ready for archive and creator-specific functionality in the next stage.

## Sprint 2 Task Breakdown

### 1. User Domain Foundation

#### Goal

Introduce the minimum backend domain model required to represent users and roles.

#### Tasks

- Define the user model.
- Decide how roles are represented in the initial version.
- Add user-related schemas where needed.
- Add database migration for the user model.
- Ensure the model fits future creator and administrator flows.

#### Agent Notes

- Keep the model simple and aligned with MVP needs.
- Do not expand into profile management or advanced permissions.

#### Implementation Status

This task package is implemented with:

- a persisted `users` table,
- explicit stored roles for `creator` and `administrator`,
- an implicit public `viewer` role outside persisted user records,
- a unique `username` field as the initial nick/handle representation,
- an `is_blocked` field to support later administrator moderation flow,
- backend user schemas prepared for the next authentication slice.

### 2. Backend Authentication

#### Goal

Add backend authentication primitives required for creator registration, login, and route protection.

#### Tasks

- Implement creator registration endpoint.
- Implement login endpoint.
- Add password hashing.
- Add credential verification.
- Add basic auth token or session strategy.
- Add dependency or helper for authenticated route access.
- Add one protected route to confirm the auth flow works.

#### Agent Notes

- Prefer a simple, maintainable approach suitable for MVP foundation.
- Avoid introducing advanced auth patterns unless strictly necessary.

### 3. Frontend Authentication Screens

#### Goal

Create the initial user-facing authentication entry points.

#### Tasks

- Add login page.
- Add registration page.
- Add basic form structure and validation.
- Keep the UI simple and aligned with the existing Sprint 1 frontend foundation.

#### Agent Notes

- Focus on working forms, not final visual polish.
- Keep the work within Sprint 2 auth scope only.

### 4. Frontend Auth State

#### Goal

Connect the frontend authentication UI to backend auth behavior.

#### Tasks

- Add frontend calls for registration and login.
- Add minimal auth state handling.
- Add minimal logged-in vs logged-out behavior.
- Add a simple example of calling a protected backend route.

#### Agent Notes

- Keep the auth state simple.
- The goal is foundation, not a full application shell.

### 5. Documentation Updates

#### Goal

Keep repository documentation aligned with authentication-related implementation work.

#### Tasks

- Update setup documentation if auth-related startup or environment details change.
- Update architecture documentation if the auth approach introduces important structural decisions.
- Update `documentation/sprints/sprint-2.md` as work packages are implemented.
- Ask whether `documentation/current-status.md` should be updated at the end of completed work.

#### Agent Notes

- Documentation changes are part of the sprint.
- Do not auto-update `current-status.md` without asking first.

## Suggested Delivery Order Inside Sprint 2

The recommended order of execution inside the sprint is:

1. user domain foundation,
2. backend authentication,
3. frontend authentication screens,
4. frontend auth state,
5. documentation update pass.

Parallel work can be considered carefully, especially between user domain groundwork and frontend authentication screens, but dependent backend and frontend auth integration should remain coordinated.

## Definition of Done for Sprint 2

Sprint 2 can be treated as complete when:

- user persistence exists in the database,
- registration and login work through the backend,
- password storage is hashed rather than plain text,
- at least one backend route is protected,
- frontend login and registration flows exist,
- frontend can authenticate against backend auth endpoints,
- documentation reflects the implemented authentication foundation.
