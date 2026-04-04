# Sprint 3

## Sprint Goal

Build the first archive content foundation so creators can add photos with basic metadata, the system can persist both photo records and file references, and the application can begin supporting creator-owned photo management.

Sprint 3 is focused on the first usable content flow for archive materials, not on advanced moderation, search, or public browsing refinement.

## In Scope

Sprint 3 includes:

- photo model foundation,
- basic metadata representation for photos,
- photo organization foundation,
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
- a photo organization foundation suitable for later expansion,
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

### 2. Photo Organization Foundation

#### Goal

Prepare the first structure for organizing archive materials through a minimal category model that can support hierarchy later if needed.

#### Tasks

- Decide the initial category representation for photo organization.
- Ensure each photo belongs to one primary category in the first version.
- Make the category structure future-ready for optional parent-child hierarchy support.
- Use an initial MVP starter set of categories:
  - `ulica`
  - `budynek`
  - `park`
- Add the related backend model and migration if needed.
- Connect photo records to the category structure.
- Keep location and date as separate metadata concerns.
- Keep the first version simple and extendable.

#### Agent Notes

- The goal is structural readiness, not a full taxonomy or hierarchy management system.
- Treat the initial category list as a starting set for MVP, not as a final closed taxonomy.

#### Implementation Status

Implemented in the `feature/photo-organization-foundation` task slice:

- added a dedicated `photo_categories` table for minimal photo organization,
- linked each photo record to one required primary category through `category_id`,
- kept category hierarchy future-ready through an optional self-referencing `parent_id`,
- seeded the initial MVP starter categories: `ulica`, `budynek`, and `park`,
- kept `location_text` and historical date fields as separate photo metadata concerns,
- extended backend photo schemas so category data is part of the photo contract without introducing hierarchy management behavior.

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

#### Implementation Status

Implemented in the `feature/backend-photo-upload` task slice:

- added an authenticated backend upload endpoint for creator-owned photo materials,
- required creator authentication and rejected non-creator upload access,
- stored uploaded files on local filesystem storage in line with the accepted storage strategy,
- persisted photo metadata together with a database file reference,
- resolved and validated the primary category through the seeded photo category structure,
- validated the required Sprint 3 upload fields for the single-photo upload flow,
- documented the upload request and response contract for the next frontend work.

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

#### Implementation Status

Implemented in the `feature/frontend-creator-photo-flow` task slice:

- added a frontend creator photo workspace at `/photos`,
- added a frontend upload form for the required Sprint 3 metadata and image file,
- connected the upload form to the documented backend multipart upload endpoint,
- added simple success and failure feedback for upload attempts,
- kept category selection aligned with the seeded Sprint 3 category set: `ulica`, `budynek`, and `park`.

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

#### Implementation Status

Implemented in the `feature/frontend-creator-photo-flow` task slice:

- added creator-owned backend endpoints for photo listing, detail retrieval, metadata update, delete, and authenticated image retrieval,
- documented the Sprint 3 creator-owned photo management contract in `documentation/api/endpoints.md`,
- added a basic frontend list of the authenticated creator's uploaded photos,
- added a basic frontend detail view for a creator-owned photo,
- added the first edit flow for creator-owned photo metadata only,
- added the first delete flow for a creator-owned photo,
- kept the UI simple and intentionally limited to creator-owned management without public archive browsing or admin moderation behavior.

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

#### Implementation Status

Implemented in the `feature/frontend-creator-photo-flow` task slice:

- updated `documentation/api/endpoints.md` to document the creator-owned photo management contract required by the Sprint 3 frontend flow,
- updated this sprint document to reflect the completed frontend upload and creator-owned photo management slices.

## Suggested Delivery Order Inside Sprint 3

The recommended order of execution inside the sprint is:

1. photo domain foundation,
2. photo organization foundation,
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
- the photo organization foundation exists for later expansion,
- documentation reflects the implemented archive content foundation.
