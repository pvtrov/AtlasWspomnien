# Sprint 3

## Sprint Goal

Build the first archive content foundation so creators can add photos with basic metadata, the system can persist both photo records and file references, and the application can begin supporting creator-owned photo management.

Sprint 3 is focused on the first usable content flow for archive materials, not on advanced moderation, search, or public browsing refinement.

## In Scope

Sprint 3 includes:

- photo model foundation,
- basic metadata representation for photos,
- category or hierarchy foundation,
- backend photo upload flow,
- local file storage handling for uploaded photos,
- file reference persistence in the database,
- frontend photo upload form,
- creator-owned photo listing,
- creator-owned photo detail and basic management foundation,
- documentation updates related to photo storage and archive content handling.

## Out of Scope

Sprint 3 does not include:

- administrator moderation workflows,
- advanced search and filtering,
- full public archive browsing experience,
- migration to S3-compatible object storage,
- advanced image processing,
- photo versioning,
- bulk upload,
- advanced category management UI,
- accessibility or visual refinement beyond what is necessary for the implemented flow.

## Expected Outcome

At the end of Sprint 3, the project should provide:

- a persisted photo model,
- persisted basic photo metadata,
- a category or hierarchy foundation suitable for later expansion,
- backend upload support for creator-owned photos,
- local file storage with database file reference linkage,
- a frontend photo upload flow,
- basic creator-owned photo management views,
- a code structure ready for later browse, search, and moderation work.

## Storage Strategy in This Sprint

Sprint 3 follows the accepted storage decision documented in [002-photo-storage-strategy.md](/Users/apatro/Repos/priv/PW/AITSI/documentation/decisions/002-photo-storage-strategy.md).

That means:

- uploaded photo files are stored on local filesystem storage mounted into the backend container,
- PostgreSQL stores metadata and file reference information,
- S3-compatible object storage remains a later evolution, not part of this sprint.

## Sprint 3 Task Breakdown

### 1. Photo Domain Foundation

#### Goal

Introduce the minimum backend domain model required to represent photos and their core metadata.

#### Tasks

- Define the photo model.
- Decide how core metadata is represented in the first version.
- Add schemas required for photo creation and reading.
- Add database migration for the photo model.
- Ensure the design is compatible with creator ownership and later search needs.

#### Agent Notes

- Keep the model aligned with MVP metadata requirements.
- Do not overdesign future search or moderation concerns at this stage.

#### Implementation Status

Implemented in the `feature/photo-domain-foundation` task slice:

- added an initial `photos` table with creator ownership through `owner_id`,
- represented first-version photo metadata as direct columns on the `photos` table,
- included `description`, `location_text`, and partial historical date fields: `taken_year`, `taken_month`, `taken_day`,
- added a nullable `file_reference` field so the database model is ready for later upload work,
- added creation and read schemas for the photo domain foundation,
- added indexes that support creator-owned access patterns and later date/location filtering work.

### 2. Category or Hierarchy Foundation

#### Goal

Prepare the first structure for organizing archive materials by category or hierarchy.

#### Tasks

- Decide the initial representation of category or hierarchy nodes.
- Add the related backend model and migration if needed.
- Connect photo records to the category or hierarchy structure.
- Keep the first version simple and extendable.

#### Agent Notes

- The goal is structural readiness, not a full taxonomy management system.

### 3. Backend Photo Upload

#### Goal

Enable authenticated creators to upload a photo and persist both its metadata and its file reference.

#### Tasks

- Add backend endpoint for authenticated photo upload.
- Implement local file storage handling in line with the accepted storage strategy.
- Store file reference information together with photo metadata in the database.
- Ensure upload behavior is scoped to creator-owned materials.
- Add backend validation for required upload fields.

#### Agent Notes

- Keep the storage implementation simple and local-first.
- Do not introduce S3-compatible storage in this sprint.

### 4. Frontend Photo Upload Form

#### Goal

Allow creators to submit a new photo with the required metadata through the frontend.

#### Tasks

- Add a frontend photo upload page or view.
- Add form fields for the initial required metadata.
- Connect the form to the backend upload endpoint.
- Provide simple success and failure feedback.

#### Agent Notes

- Focus on a working creator upload flow, not final UI polish.

### 5. Creator Photo Management

#### Goal

Allow creators to view and manage their own uploaded materials in the first usable version of the creator workflow.

#### Tasks

- Add creator-owned photo listing on the backend.
- Add creator-owned photo detail retrieval.
- Add a basic frontend list of the creator's uploaded photos.
- Add a basic frontend detail view for a creator-owned photo.
- Add the first edit flow for creator-owned photo metadata.
- Add the first delete flow for a creator-owned photo.

#### Agent Notes

- Keep the first management flow simple.
- Listing, detail view, edit, and delete should all remain basic and aligned with MVP needs for this sprint's first pass.

### 6. Documentation Updates

#### Goal

Keep repository documentation aligned with the archive content foundation and storage approach.

#### Tasks

- Update setup documentation if storage or runtime behavior changes.
- Update architecture documentation if the photo flow introduces important structural decisions.
- Update `documentation/sprints/sprint-3.md` as work packages are implemented.
- Ask whether `documentation/current-status.md` should be updated at the end of completed work.

#### Agent Notes

- Documentation changes are part of the sprint.
- Do not auto-update `current-status.md` without asking first.

## Suggested Delivery Order Inside Sprint 3

The recommended order of execution inside the sprint is:

1. photo domain foundation,
2. category or hierarchy foundation,
3. backend photo upload,
4. frontend photo upload form,
5. creator photo management,
6. documentation update pass.

Parallel work can be considered carefully once the domain and upload contract are stable, but storage, backend upload, and frontend upload integration should remain coordinated.

## Definition of Done for Sprint 3

Sprint 3 can be treated as complete when:

- photo persistence exists in the database,
- photo metadata is stored together with file reference information,
- uploaded files are stored through the agreed local storage strategy,
- creators can upload a photo through the application,
- creators can retrieve their own uploaded photo records,
- the category or hierarchy foundation exists for later expansion,
- documentation reflects the implemented archive content foundation.
