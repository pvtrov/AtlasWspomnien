"use client";

import { useEffect, useState } from "react";

import {
  PartialDateInput,
  type PartialDateValue,
} from "@/components/photos/partial-date-input";
import {
  PartialDateRangeInput,
  type PartialDateRangeValue,
} from "@/components/photos/partial-date-range-input";
import { PhotoImage } from "@/components/photos/photo-image";
import { SharedSelectedPhotoPanel } from "@/components/photos/shared-selected-photo-panel";
import { SimplePhotoMap } from "@/components/photos/simple-photo-map";
import { PHOTO_CATEGORY_OPTIONS } from "@/lib/photo-categories";
import {
  listSharedPhotos,
  type Photo,
  type SharedPhotoFilters,
} from "@/services/api-client";

type FilterFormValues = {
  query: string;
  category: string;
  location: string;
  exactDate: PartialDateValue;
  range: PartialDateRangeValue;
};

type DateFilterMode = "exact" | "range";
type FilterSummaryItem = {
  key: string;
  label: string;
};

const INITIAL_FILTERS: FilterFormValues = {
  query: "",
  category: "",
  location: "",
  exactDate: {
    year: "",
    month: "",
    day: "",
  },
  range: {
    from: {
      year: "",
      month: "",
      day: "",
    },
    to: {
      year: "",
      month: "",
      day: "",
    },
  },
};

function formatPhotoDate(photo: Photo): string {
  const parts = [String(photo.taken_year)];

  if (photo.taken_month !== null) {
    parts.push(String(photo.taken_month).padStart(2, "0"));
  }

  if (photo.taken_day !== null) {
    parts.push(String(photo.taken_day).padStart(2, "0"));
  }

  return parts.join("-");
}

function buildExactDateFilters(values: FilterFormValues): SharedPhotoFilters {
  const filters = buildBaseSharedPhotoFilters(values);
  const exactDate = buildPartialDateString(values.exactDate);

  if (!exactDate) {
    return filters;
  }

  if (values.exactDate.day.trim()) {
    filters.date_from = exactDate;
    filters.date_to = exactDate;
    return filters;
  }

  filters.taken_year = Number(values.exactDate.year);

  if (values.exactDate.month.trim()) {
    filters.taken_month = Number(values.exactDate.month);
  }

  return filters;
}

function buildRangeDateFilters(values: FilterFormValues): SharedPhotoFilters {
  const filters = buildBaseSharedPhotoFilters(values);
  const dateFrom = buildPartialDateString(values.range.from);
  const dateTo = buildPartialDateString(values.range.to);

  if (dateFrom) {
    filters.date_from = dateFrom;
  }

  if (dateTo) {
    filters.date_to = dateTo;
  }

  return filters;
}

function buildBaseSharedPhotoFilters(values: FilterFormValues): SharedPhotoFilters {
  const filters: SharedPhotoFilters = {};

  if (values.query.trim()) {
    filters.query = values.query.trim();
  }

  if (values.category) {
    filters.category = values.category;
  }

  if (values.location.trim()) {
    filters.location = values.location.trim();
  }

  return filters;
}

function buildPartialDateString(value: PartialDateValue): string | undefined {
  if (!value.year.trim()) {
    return undefined;
  }

  if (!value.month.trim()) {
    return value.year.trim();
  }

  const month = value.month.trim().padStart(2, "0");
  if (!value.day.trim()) {
    return `${value.year.trim()}-${month}`;
  }

  return `${value.year.trim()}-${month}-${value.day.trim().padStart(2, "0")}`;
}

function buildFilterSummary(filters: SharedPhotoFilters): FilterSummaryItem[] {
  const items: FilterSummaryItem[] = [];

  if (filters.query) {
    items.push({
      key: "query",
      label: `Query: ${filters.query}`,
    });
  }

  if (filters.category) {
    items.push({
      key: "category",
      label: `Category: ${filters.category}`,
    });
  }

  if (filters.location) {
    items.push({
      key: "location",
      label: `Location: ${filters.location}`,
    });
  }

  if (filters.taken_year !== undefined) {
    items.push({
      key: "exact-date",
      label:
        filters.taken_month !== undefined
          ? `Exact date: ${filters.taken_year}-${String(filters.taken_month).padStart(2, "0")}`
          : `Exact date: ${filters.taken_year}`,
    });
  } else if (filters.date_from || filters.date_to) {
    items.push({
      key: "range-date",
      label: `Range: ${filters.date_from ?? "..." } -> ${filters.date_to ?? "..."}`,
    });
  }

  return items;
}

export function SharedPhotosPanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Loading archive photos...");
  const [filterValues, setFilterValues] = useState<FilterFormValues>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SharedPhotoFilters>({});
  const [mapViewResetKey, setMapViewResetKey] = useState(0);
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("exact");
  const [areFiltersExpanded, setAreFiltersExpanded] = useState(false);

  useEffect(() => {
    async function loadPhotos(): Promise<void> {
      setIsLoading(true);
      try {
        const loadedPhotos = await listSharedPhotos(appliedFilters);
        setPhotos(loadedPhotos);
        setSelectedPhotoId((currentSelectedPhotoId) => {
          if (
            currentSelectedPhotoId !== null &&
            loadedPhotos.some((photo) => photo.id === currentSelectedPhotoId)
          ) {
            return currentSelectedPhotoId;
          }

          const firstMappedPhoto = loadedPhotos.find(
            (photo) => photo.latitude !== null && photo.longitude !== null,
          );
          return firstMappedPhoto?.id ?? loadedPhotos[0]?.id ?? null;
        });
        setMessage(
          loadedPhotos.length > 0
            ? "Browse the shared archive through one list, one map, and one inline detail panel."
            : Object.keys(appliedFilters).length > 0
              ? "No archive photos match the current filters."
              : "No archive photos are available yet.",
        );
      } catch (error) {
        setPhotos([]);
        setSelectedPhotoId(null);
        setMessage(
          error instanceof Error ? error.message : "Could not load archive photos.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadPhotos();
  }, [appliedFilters]);

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value } = event.target;
    setFilterValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleApplyFilters(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setAppliedFilters(buildSharedPhotoFiltersForMode(filterValues, dateFilterMode));
    setMapViewResetKey((currentValue) => currentValue + 1);
  }

  function handleResetFilters(): void {
    setFilterValues(INITIAL_FILTERS);
    setAppliedFilters({});
    setMapViewResetKey((currentValue) => currentValue + 1);
  }

  const selectedPhoto =
    photos.find((photo) => photo.id === selectedPhotoId) ?? null;
  const mappablePhotos = photos.filter(
    (photo) => photo.latitude !== null && photo.longitude !== null,
  );
  const hasActiveFilters = Object.keys(appliedFilters).length > 0;
  const activeFiltersLabel = hasActiveFilters ? "Filters active" : "No filters applied";
  const filterSummaryItems = buildFilterSummary(appliedFilters);

  return (
    <section className="photo-panel">
      <div className="photo-panel__heading">
        <div>
          <p className="eyebrow">Sprint 6</p>
          <h1>Archive search and filtering</h1>
        </div>
        <p className="photo-panel__meta">{message}</p>
      </div>

      <div className="photo-filters-shell">
        <div className="photo-panel__heading photo-panel__heading--compact">
          <div>
            <p className="eyebrow">Search and filters</p>
            <h2>Refine archive discovery</h2>
            <div className="photo-filter-summary" aria-live="polite">
              {filterSummaryItems.length > 0 ? (
                filterSummaryItems.map((item) => (
                  <span key={item.key} className="photo-filter-summary__item">
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="photo-filter-summary__empty">No filters applied.</span>
              )}
            </div>
          </div>
          <div className="photo-filters-shell__actions">
            <p className="photo-panel__meta">{activeFiltersLabel}</p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setAreFiltersExpanded((currentValue) => !currentValue)}
            >
              {areFiltersExpanded ? "Hide filters" : "Show filters"}
            </button>
          </div>
        </div>

        {areFiltersExpanded ? (
          <form className="photo-filters" onSubmit={handleApplyFilters}>
            <div className="photo-filters__grid">
              <div className="auth-field">
                <label htmlFor="query">Search text</label>
                <input
                  id="query"
                  name="query"
                  value={filterValues.query}
                  onChange={handleFilterChange}
                  placeholder="Description, location, or category"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={filterValues.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All categories</option>
                  {PHOTO_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="location">Location text</label>
                <input
                  id="location"
                  name="location"
                  value={filterValues.location}
                  onChange={handleFilterChange}
                  placeholder="Town square, district, street..."
                />
              </div>
            </div>

            <div className="photo-filters__date-mode">
              <span className="photo-filters__section-label">Date mode</span>
              <div className="photo-filters__toggle">
                <button
                  type="button"
                  className={`photo-filters__toggle-button${
                    dateFilterMode === "exact" ? " photo-filters__toggle-button--active" : ""
                  }`}
                  onClick={() => setDateFilterMode("exact")}
                >
                  Exact date
                </button>
                <button
                  type="button"
                  className={`photo-filters__toggle-button${
                    dateFilterMode === "range" ? " photo-filters__toggle-button--active" : ""
                  }`}
                  onClick={() => setDateFilterMode("range")}
                >
                  Range
                </button>
              </div>
            </div>

            <div className="photo-filters__date-layout">
              {dateFilterMode === "exact" ? (
                <PartialDateInput
                  legend="Exact archive date"
                  baseName="exactDate"
                  yearLabel="Year"
                  monthLabel="Month"
                  dayLabel="Day"
                  value={filterValues.exactDate}
                  onChange={(nextValue) =>
                    setFilterValues((currentValues) => ({
                      ...currentValues,
                      exactDate: nextValue,
                    }))
                  }
                />
              ) : (
                <PartialDateRangeInput
                  value={filterValues.range}
                  onChange={(nextValue) =>
                    setFilterValues((currentValues) => ({
                      ...currentValues,
                      range: nextValue,
                    }))
                  }
                />
              )}
            </div>

            <div className="photo-panel__actions">
              <button type="submit" className="auth-form__submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Apply filters"}
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={handleResetFilters}
                disabled={isLoading}
              >
                Clear filters
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {!isLoading && photos.length === 0 ? (
        <p className="photo-list__empty">
          {hasActiveFilters
            ? "No archive photos match the current filters."
            : "Archive browsing will appear here once photos are available."}
        </p>
      ) : null}

      <div className="archive-discovery-layout">
        <section className="archive-discovery-main">
          <article className="photo-panel">
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Archive list</p>
                <h2>Browse matching photos</h2>
              </div>
              <p className="photo-panel__meta">
                Selecting a list item opens its details on the right.
              </p>
            </div>

            <div className="photo-list photo-list--scrollable">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`photo-card photo-card--button photo-card--compact${
                    photo.id === selectedPhotoId ? " photo-card--selected" : ""
                  }`}
                  onClick={() => setSelectedPhotoId(photo.id)}
                >
                  <PhotoImage
                    photoId={photo.id}
                    alt={photo.description || `Archive photo from ${photo.location_text}`}
                    className="photo-card__image"
                  />
                  <div className="photo-card__body">
                    <p className="photo-card__category">{photo.category.name}</p>
                    <h3>{photo.location_text}</h3>
                    {photo.description ? <p>{photo.description}</p> : null}
                    <p className="photo-card__meta">{formatPhotoDate(photo)}</p>
                    <span className="inline-link">Show details on the right</span>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="photo-panel">
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Map view</p>
                <h2>Photos with coordinates</h2>
              </div>
              <p className="photo-panel__meta">
                Only photos with usable coordinates appear on the map.
              </p>
            </div>

            <SimplePhotoMap
              points={mappablePhotos.map((photo) => ({
                id: photo.id,
                latitude: photo.latitude as number,
                longitude: photo.longitude as number,
                label: photo.location_text,
              }))}
              viewResetKey={mapViewResetKey}
              selectedPointId={
                selectedPhoto &&
                selectedPhoto.latitude !== null &&
                selectedPhoto.longitude !== null
                  ? selectedPhoto.id
                  : null
              }
              onSelectPoint={(pointId) => setSelectedPhotoId(Number(pointId))}
              emptyLabel="No photos with coordinates are available yet."
            />
          </article>
        </section>

        <div className="archive-discovery-sidebar">
          <SharedSelectedPhotoPanel photo={selectedPhoto} />
        </div>
      </div>
    </section>
  );
}

function buildSharedPhotoFiltersForMode(
  values: FilterFormValues,
  mode: DateFilterMode,
): SharedPhotoFilters {
  if (mode === "exact") {
    return buildExactDateFilters(values);
  }

  return buildRangeDateFilters(values);
}
