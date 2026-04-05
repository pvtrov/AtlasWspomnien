"use client";

import { useEffect, useState } from "react";

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
  takenYear: string;
  takenMonth: string;
  dateFrom: string;
  dateTo: string;
};

const INITIAL_FILTERS: FilterFormValues = {
  query: "",
  category: "",
  location: "",
  takenYear: "",
  takenMonth: "",
  dateFrom: "",
  dateTo: "",
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

function buildSharedPhotoFilters(values: FilterFormValues): SharedPhotoFilters {
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

  if (values.takenYear.trim()) {
    filters.taken_year = Number(values.takenYear);
  }

  if (values.takenMonth.trim()) {
    filters.taken_month = Number(values.takenMonth);
  }

  if (values.dateFrom.trim()) {
    filters.date_from = values.dateFrom.trim();
  }

  if (values.dateTo.trim()) {
    filters.date_to = values.dateTo.trim();
  }

  return filters;
}

export function SharedPhotosPanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Loading archive photos...");
  const [filterValues, setFilterValues] = useState<FilterFormValues>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SharedPhotoFilters>({});
  const [mapViewResetKey, setMapViewResetKey] = useState(0);

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

  function handleFilterChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;
    setFilterValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleApplyFilters(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setAppliedFilters(buildSharedPhotoFilters(filterValues));
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

  return (
    <section className="photo-panel">
      <div className="photo-panel__heading">
        <div>
          <p className="eyebrow">Sprint 6</p>
          <h1>Archive search and filtering</h1>
        </div>
        <p className="photo-panel__meta">{message}</p>
      </div>

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

          <div className="auth-field">
            <label htmlFor="takenYear">Exact year</label>
            <input
              id="takenYear"
              name="takenYear"
              type="number"
              inputMode="numeric"
              value={filterValues.takenYear}
              onChange={handleFilterChange}
              placeholder="1982"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="takenMonth">Exact month</label>
            <input
              id="takenMonth"
              name="takenMonth"
              type="number"
              inputMode="numeric"
              value={filterValues.takenMonth}
              onChange={handleFilterChange}
              placeholder="Requires exact year"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="dateFrom">Range start</label>
            <input
              id="dateFrom"
              name="dateFrom"
              value={filterValues.dateFrom}
              onChange={handleFilterChange}
              placeholder="YYYY or YYYY-MM"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="dateTo">Range end</label>
            <input
              id="dateTo"
              name="dateTo"
              value={filterValues.dateTo}
              onChange={handleFilterChange}
              placeholder="YYYY or YYYY-MM"
            />
          </div>
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
