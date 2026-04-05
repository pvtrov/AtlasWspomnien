# Sprint 6

## Sprint Goal

Build the first archive discovery layer beyond basic browsing so users can search and filter photos more effectively and discover archive materials through a map-based view driven by more detailed location data.

Sprint 6 is focused on practical discovery features for the MVP, not on advanced GIS capabilities or highly optimized large-scale search.

## In Scope

Sprint 6 includes:

- text search for archive photos,
- filtering by category,
- filtering by location text,
- filtering by historical date or date range,
- photo model extension for more detailed location data,
- support for `latitude` and `longitude` on photos,
- frontend location input through address/name or map pin,
- frontend geocoding-driven map preparation,
- a map view showing photos with coordinates,
- documentation updates related to search, filtering, and map-based discovery.

## Out of Scope

Sprint 6 does not include:

- PostGIS or advanced GIS infrastructure,
- radius search,
- polygon or area search,
- marker clustering,
- advanced geospatial analytics,
- bulk geocoding workflows,
- advanced search ranking,
- large public archive UX redesign,
- complex filtering dashboards.

## Expected Outcome

At the end of Sprint 6, the project should provide:

- archive search by phrase,
- filtering by category, location text, and date-related fields,
- photos enriched with optional geographic coordinates,
- creator input that supports address/name-based location or direct pin placement,
- a map-based archive discovery view showing photos with coordinates,
- a code and documentation foundation ready for later refinement of archive discovery.

## Sprint 6 Task Breakdown

### 1. Search and Filtering

#### Goal

Improve archive discovery by allowing users to search and filter across the shared photo layer.

#### Tasks

- Add backend support for text search across photo-relevant fields.
- Add backend support for filtering by category.
- Add backend support for filtering by location text.
- Add backend support for filtering by date or date-related fields.
- Add frontend controls for search and filtering in the shared archive experience.
- Keep the implementation aligned with the current public/shared archive viewing layer.

#### Agent Notes

- Keep the first search and filtering implementation practical and understandable.
- Do not overbuild ranking or advanced search behavior in this sprint.

#### Implemented In This Task

- extended the public shared archive list endpoint with optional search and filter query parameters instead of adding a separate discovery endpoint,
- added backend text search across photo `description`, `location_text`, and category `name` and `slug`,
- extended backend text search so public archive `query` also matches the optional user-provided `display_name` photo title,
- added backend filtering by category slug and location text,
- added backend filtering by exact `taken_year` and `taken_month`,
- added backend date-range filtering through inclusive `date_from` and `date_to` query parameters that accept `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`,
- made shared archive text search and location filtering accent-insensitive so searches such as `Krakow` can match `Kraków`,
- kept date-range matching strict for partially known historical dates so narrow ranges do not return photos whose stored date precision is too broad,
- added frontend search and filter controls directly into the existing shared archive browsing layer on the home page,
- kept the current shared archive list, map, and inline-detail layout so filtering narrows the same browsing surface instead of introducing a redesigned discovery experience,
- updated API documentation for the implemented search and filtering contract.

### 2. Map-Based Photo Discovery

#### Goal

Allow users to discover photos through map-based interaction driven by more detailed location data.

#### Tasks

- Extend the photo model with `latitude` and `longitude`.
- Add the required database migration.
- Extend backend create, update, and read contracts for photo location coordinates where needed.
- Keep `location_text` as the human-readable location field.
- Allow creators to provide location through address/name input or direct pin placement.
- Use frontend geocoding to resolve typed location input into coordinates when possible.
- Add a map view for photos that have coordinates.
- Allow users to open or navigate to a photo from the map view.

#### Implemented In This Task

- extended the photo model with optional `latitude` and `longitude` fields,
- added a database migration that keeps existing photos valid without coordinates,
- extended backend create, update, and read contracts so coordinates flow through creator, administrator, and shared archive responses,
- kept `location_text` as the required human-readable location field while allowing coordinate storage to remain optional,
- separated the human-facing photo title into optional `display_name` while keeping `location_text` focused on the address or place description,
- added OSM-based autocomplete in photo add and edit flows so selecting a suggestion fills both the location text and coordinates,
- added creator and administrator location input that supports typed location text, frontend geocoding, direct pin placement, and coordinate clearing,
- added a shared archive discovery layout on the home page with a photo list, a map for photos that have coordinates, and an inline detail panel,
- kept the existing dedicated shared photo page as a fallback deep-link while making list selection and map-pin selection open details beside the map,
- updated API and sprint documentation for the implemented map-based discovery slice.

#### Agent Notes

- Keep the implementation simple and MVP-oriented.
- Photos without coordinates may still exist; the map view only needs to show photos that have usable coordinates.
- Prefer frontend geocoding over adding a new backend geocoding service in this sprint.

### 3. Documentation Updates

#### Goal

Keep repository documentation aligned with search, filtering, and map-based archive discovery.

#### Tasks

- Update architecture documentation if the location model or map flow introduces important structural clarifications.
- Update `documentation/api/endpoints.md` if search, filter, or location contracts change.
- Update `documentation/sprints/sprint-6.md` as the work packages are implemented.
- Ask whether `documentation/current-status.md` should be updated at the end of completed work.

#### Agent Notes

- Documentation changes are part of the sprint.
- Do not auto-update `current-status.md` without asking first.

## Suggested Delivery Order Inside Sprint 6

The recommended order of execution inside the sprint is:

1. search and filtering,
2. map-based photo discovery,
3. documentation update pass.

The map work depends on stable photo and archive contracts, so location-model updates and map-view implementation should stay coordinated.

## Definition of Done for Sprint 6

Sprint 6 can be treated as complete when:

- users can search archive photos by phrase,
- users can filter archive photos by category, location text, and date-related fields,
- photos can store optional geographic coordinates,
- creators can provide more detailed location information through text or map pin interaction,
- the archive offers a map-based discovery view for photos with coordinates,
- documentation reflects the implemented discovery foundation.
