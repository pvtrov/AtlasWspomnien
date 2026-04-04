# Sprint 4

## Sprint Goal

Build the first administration and moderation foundation so administrators can manage users, block creators from adding further materials when necessary, and establish the backend moderation capabilities required for later photo moderation in shared archive views.

Sprint 4 is focused on the minimum usable moderation foundation for the MVP, not on a full administrative platform, advanced audit tooling, or shared-page photo moderation UI.

## In Scope

Sprint 4 includes:

- administrator-only backend moderation access,
- backend support for administrator photo removal,
- backend support for administrator metadata editing,
- backend support for blocking creators,
- administrator user listing,
- the first basic administrator-facing user moderation UI,
- documentation updates related to administration and moderation.

## Out of Scope

Sprint 4 does not include:

- advanced audit reporting,
- moderation queues and triage workflows,
- bulk moderation actions,
- advanced administrator dashboards,
- rich user management beyond blocking creators,
- administrator photo moderation controls embedded into shared archive photo pages,
- advanced permission systems beyond the roles already established,
- public archive browsing refinement,
- search enhancements,
- accessibility or visual refinement beyond what is needed for the implemented moderation flow.

## Expected Outcome

At the end of Sprint 4, the project should provide:

- backend role-aware administrator access for moderation actions,
- administrator backend ability to remove problematic photos,
- administrator backend ability to edit photo metadata,
- administrator ability to block a creator from further uploads,
- administrator user listing and blocking in the frontend,
- code and documentation ready for later moderation expansion if needed.

## Sprint 4 Task Breakdown

### 1. Admin Backend Moderation

#### Goal

Implement the core backend moderation capabilities required by the MVP administrator role.

#### Tasks

- Add administrator-only access checks for moderation routes.
- Add backend endpoint support for administrator removal of photos.
- Add backend endpoint support for administrator editing of photo metadata.
- Add backend endpoint support for blocking creators from further uploads.
- Ensure blocked creators are prevented from using creator upload functionality.
- Keep the moderation flow aligned with the existing user, auth, and photo architecture.
- Update `documentation/api/endpoints.md` so the moderation contract is clear for later frontend work.

#### Agent Notes

- Keep the moderation backend focused on the MVP administrator role.
- Prefer direct and understandable moderation behavior over complex workflow design.

#### Implemented

- added administrator-only moderation routes under `/api/v1/admin`,
- added administrator photo metadata editing for any stored photo,
- added administrator photo deletion for any stored photo,
- added administrator user listing for moderation work,
- added administrator promotion of existing users,
- added creator-blocking support using the existing `users.is_blocked` field,
- adjusted authentication rules so blocked creators may still log in,
- restricted blocked creators from uploading new photos and editing photo metadata,
- allowed blocked creators to keep deleting their own previously uploaded photos,
- allowed administrators to use shared photo list and detail visibility needed for moderation,
- added a backend bootstrap script for creating the first administrator account or promoting an existing user.

### 2. Admin Frontend Moderation

#### Goal

Implement the first usable administrator-facing user moderation flow in the frontend.

#### Tasks

- Add a basic administrator moderation area or page.
- Add a simple view of registered users.
- Add the first creator-blocking flow.
- Keep the frontend aligned with the documented moderation endpoints for administrator user management.

#### Agent Notes

- Keep the UI simple and operational.
- Do not attempt to build a full admin console or shared-page photo moderation UI in this sprint.

#### Implemented

- added a basic administrator moderation page in the frontend,
- added a simple administrator view of registered users,
- added the first creator-blocking flow aligned with `PATCH /api/v1/admin/users/{user_id}/block`,
- aligned the frontend owned-photo workspace with a dedicated authenticated `GET /api/v1/{user_id}/photos` endpoint so both creators and administrators manage only their own uploads in `/photos`,
- kept cross-user photo moderation backend endpoints available for later use without exposing that moderation flow in the current frontend admin page,
- intentionally deferred shared-page administrator photo edit/remove controls to the next product step built on shared archive browsing.

### 3. Documentation Updates

#### Goal

Keep repository documentation aligned with the administration and moderation implementation.

#### Tasks

- Update architecture documentation if moderation introduces important structural clarifications.
- Update setup documentation if moderation changes startup or environment expectations.
- Update `documentation/sprints/sprint-4.md` as the work packages are implemented.
- Ask whether `documentation/current-status.md` should be updated at the end of completed work.

#### Agent Notes

- Documentation changes are part of the sprint.
- Do not auto-update `current-status.md` without asking first.

#### Implemented

- updated `documentation/api/endpoints.md` with the Sprint 4 moderation contract,
- recorded the implemented backend moderation scope in this sprint document.

## Suggested Delivery Order Inside Sprint 4

The recommended order of execution inside the sprint is:

1. admin backend moderation,
2. admin frontend moderation,
3. documentation update pass.

Parallel work can still be considered, but the frontend moderation flow should rely on the backend moderation contract being stable enough first.

## Definition of Done for Sprint 4

Sprint 4 can be treated as complete when:

- administrators can access moderation-only backend behavior,
- administrators can remove problematic photos through backend moderation capabilities,
- administrators can edit photo metadata through backend moderation capabilities,
- administrators can block creators from further uploads,
- blocked creators are prevented from further upload attempts,
- a basic administrator user moderation UI exists,
- documentation reflects the implemented moderation foundation.

These conditions are now substantially satisfied for the currently planned Sprint 4 scope.
