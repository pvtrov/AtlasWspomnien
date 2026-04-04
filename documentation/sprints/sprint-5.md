# Sprint 5

## Sprint Goal

Build the first shared archive browsing experience so both non-authenticated and authenticated users can browse photos through the same page layer, while administrators can moderate photos directly from that shared viewing context.

Sprint 5 is focused on shared archive visibility and photo-detail interaction, not on advanced search, rich moderation dashboards, or a fully polished public archive experience.

## In Scope

Sprint 5 includes:

- shared photo listing for non-authenticated and authenticated users,
- shared photo detail view for non-authenticated and authenticated users,
- backend support for shared archive browsing routes if needed,
- frontend archive browsing and photo detail pages,
- administrator photo edit and remove controls embedded into the shared photo detail layer,
- documentation updates related to shared browsing and moderation-in-context.

For the currently implemented Sprint 5 task slice in this repository, the delivered scope is the shared archive browsing foundation only. Administrator moderation controls in shared photo views remain a later Sprint 5 step.

## Out of Scope

Sprint 5 does not include:

- advanced full-text search,
- complex filtering and faceted search,
- moderation queues or bulk moderation tools,
- advanced archive discovery UX,
- category management UI,
- advanced audit or reporting features,
- large visual redesign work,
- advanced accessibility refinement beyond what is necessary for the implemented shared browsing flow.

## Expected Outcome

At the end of Sprint 5, the project should provide:

- a shared photo listing view accessible to both logged and non-logged users,
- a shared photo detail view accessible to both logged and non-logged users,
- administrator photo edit and remove controls available from the shared photo detail page,
- a unified archive-viewing layer rather than separate browsing experiences for different user types,
- a code and documentation foundation ready for later browse/search expansion.

## Sprint 5 Task Breakdown

### 1. Shared Archive Browsing

#### Goal

Introduce the shared archive-viewing layer used by anonymous users, authenticated users, and administrators.

#### Tasks

- Define or confirm the backend contract for shared photo listing and detail retrieval.
- Add any backend support needed for public archive browsing routes.
- Add a shared frontend photo listing page.
- Add a shared frontend photo detail page.
- Keep the browsing layer unified across user types.

#### Implemented In This Task

- confirmed the shared browsing contract so `GET /api/v1/photos`, `GET /api/v1/photos/{photo_id}`, and `GET /api/v1/photos/{photo_id}/image` are public,
- kept backend file storage references internal and out of read responses,
- added the shared frontend browsing flow at `/all_photos`,
- added the shared frontend photo detail flow at `/all_photos/{photoId}`,
- kept the browsing layer unified for anonymous and authenticated users.

#### Agent Notes

- Prefer one shared archive-viewing layer over multiple role-specific browsing flows.
- Keep the first implementation simple and navigation-focused.

### 2. Admin Moderation in Shared Photo Views

#### Goal

Allow administrators to moderate photos from the same shared photo detail layer used by other users.

This part of Sprint 5 is not included in the currently implemented shared archive browsing task slice.

#### Tasks

- Add administrator-only photo edit controls to the shared photo detail page.
- Add administrator-only photo removal controls to the shared photo detail page.
- Keep the frontend aligned with the existing moderation endpoints documented in `documentation/api/endpoints.md`.
- Ensure non-admin users do not see administrator controls.

#### Agent Notes

- Moderation should feel like an overlay on shared archive viewing, not a separate primary browsing surface.
- Keep the edit and remove flow direct and understandable.

### 3. Documentation Updates

#### Goal

Keep repository documentation aligned with the shared browsing and in-context moderation implementation.

#### Tasks

- Update architecture documentation if shared archive browsing introduces important structural clarifications.
- Update `documentation/api/endpoints.md` if shared listing or shared detail contracts are refined.
- Update `documentation/sprints/sprint-5.md` as the work packages are implemented.
- Ask whether `documentation/current-status.md` should be updated at the end of completed work.

#### Agent Notes

- Documentation changes are part of the sprint.
- Do not auto-update `current-status.md` without asking first.

## Suggested Delivery Order Inside Sprint 5

The recommended order of execution inside the sprint is:

1. shared archive browsing,
2. admin moderation in shared photo views,
3. documentation update pass.

## Definition of Done for Sprint 5

Sprint 5 can be treated as complete when:

- non-authenticated users can browse the shared archive photo layer,
- authenticated users can browse the same shared archive photo layer,
- administrators can access photo edit and remove controls from shared photo detail pages,
- administrator controls are hidden from non-admin users,
- documentation reflects the implemented shared browsing and moderation-in-context foundation.
