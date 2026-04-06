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
      label: `Fraza: ${filters.query}`,
    });
  }

  if (filters.category) {
    items.push({
      key: "category",
      label: `Kategoria: ${filters.category}`,
    });
  }

  if (filters.location) {
    items.push({
      key: "location",
      label: `Lokalizacja: ${filters.location}`,
    });
  }

  if (filters.taken_year !== undefined) {
    items.push({
      key: "exact-date",
      label:
        filters.taken_month !== undefined
          ? `Dokładna data: ${filters.taken_year}-${String(filters.taken_month).padStart(2, "0")}`
          : `Dokładna data: ${filters.taken_year}`,
    });
  } else if (filters.date_from || filters.date_to) {
    items.push({
      key: "range-date",
      label: `Zakres: ${filters.date_from ?? "..." } -> ${filters.date_to ?? "..."}`,
    });
  }

  return items;
}

export function SharedPhotosPanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Ładowanie zdjęć archiwalnych...");
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
            ? "Przeglądaj wspólne archiwum przez jedną listę, jedną mapę i jeden panel szczegółów."
            : Object.keys(appliedFilters).length > 0
              ? "Żadne zdjęcia nie pasują do obecnych filtrów."
              : "W archiwum nie ma jeszcze dostępnych zdjęć.",
        );
      } catch (error) {
        setPhotos([]);
        setSelectedPhotoId(null);
        setMessage(
          error instanceof Error ? error.message : "Nie udało się pobrać zdjęć archiwalnych.",
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
  const activeFiltersLabel = hasActiveFilters ? "Filtry aktywne" : "Brak aktywnych filtrów";
  const filterSummaryItems = buildFilterSummary(appliedFilters);
  const selectedPhotoHasMapCoordinates =
    selectedPhoto?.latitude !== null && selectedPhoto?.longitude !== null;

  return (
    <section className="archive-shell">
      <div className="photo-filters-shell">
        <div className="photo-filters-shell__intro">
          <div>
            <p className="eyebrow">Atlas Wspomnień</p>
            <h1>Odkrywaj archiwum</h1>
            <p className="photo-panel__meta">
              {message}
            </p>
          </div>
          <div className="photo-filters-shell__actions">
            <span className="photo-filters-shell__status">{activeFiltersLabel}</span>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setAreFiltersExpanded((currentValue) => !currentValue)}
            >
              {areFiltersExpanded ? "Ukryj filtry" : "Pokaż filtry"}
            </button>
          </div>
        </div>

        <div className="photo-filter-summary" aria-live="polite">
          {filterSummaryItems.length > 0 ? (
            filterSummaryItems.map((item) => (
              <span key={item.key} className="photo-filter-summary__item">
                {item.label}
              </span>
            ))
          ) : (
            <span className="photo-filter-summary__empty">Brak aktywnych filtrów.</span>
          )}
        </div>

        <p className="photo-filters-shell__caption">
          Filtry porządkują ten sam wspólny widok archiwum, dzięki czemu lista, mapa i detal
          reagują razem.
        </p>

        {areFiltersExpanded ? (
          <form className="photo-filters" onSubmit={handleApplyFilters}>
            <div className="photo-filters__grid">
              <div className="auth-field">
                <label htmlFor="query">Szukana fraza</label>
                <input
                  id="query"
                  name="query"
                  value={filterValues.query}
                  onChange={handleFilterChange}
                  placeholder="Opis, lokalizacja albo kategoria"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="category">Kategoria</label>
                <select
                  id="category"
                  name="category"
                  value={filterValues.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Wszystkie kategorie</option>
                  {PHOTO_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="location">Tekst lokalizacji</label>
                <input
                  id="location"
                  name="location"
                  value={filterValues.location}
                  onChange={handleFilterChange}
                  placeholder="Rynek, dzielnica, ulica..."
                />
              </div>
            </div>

            <div className="photo-filters__date-mode">
              <span className="photo-filters__section-label">Tryb daty</span>
              <div className="photo-filters__toggle">
                <button
                  type="button"
                  className={`photo-filters__toggle-button${
                    dateFilterMode === "exact" ? " photo-filters__toggle-button--active" : ""
                  }`}
                  onClick={() => setDateFilterMode("exact")}
                >
                  Dokładna data
                </button>
                <button
                  type="button"
                  className={`photo-filters__toggle-button${
                    dateFilterMode === "range" ? " photo-filters__toggle-button--active" : ""
                  }`}
                  onClick={() => setDateFilterMode("range")}
                >
                  Zakres
                </button>
              </div>
            </div>

            <div className="photo-filters__date-layout">
              {dateFilterMode === "exact" ? (
                <PartialDateInput
                  legend="Dokładna data archiwalna"
                  baseName="exactDate"
                  yearLabel="Rok"
                  monthLabel="Miesiąc"
                  dayLabel="Dzień"
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
                {isLoading ? "Ładowanie..." : "Zastosuj filtry"}
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={handleResetFilters}
                disabled={isLoading}
              >
                Wyczyść filtry
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {!isLoading && photos.length === 0 ? (
        <p className="photo-list__empty">
          {hasActiveFilters
            ? "Żadne zdjęcia nie pasują do obecnych filtrów."
            : "Przeglądanie archiwum pojawi się tutaj, gdy zdjęcia będą dostępne."}
        </p>
      ) : null}

      <div className="archive-discovery-layout">
        <section className="archive-discovery-main">
          <article className="photo-panel archive-collection-panel">
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Lista archiwum</p>
                <h2>Przeglądaj pasujące zdjęcia</h2>
              </div>
              <p className="photo-panel__meta">
                Wybranie elementu z listy otwiera jego szczegóły po prawej stronie.
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
                    alt={
                      photo.display_name || photo.description || `Zdjęcie archiwalne z lokalizacji ${photo.location_text}`
                    }
                    className="photo-card__image"
                  />
                  <div className="photo-card__body">
                    <p className="photo-card__category">{photo.category.name}</p>
                    <h3>{photo.display_name || photo.location_text}</h3>
                    <p className="photo-card__meta">{photo.location_text}</p>
                    {photo.description ? <p>{photo.description}</p> : null}
                    <div className="photo-card__footer">
                      <p className="photo-card__meta">{formatPhotoDate(photo)}</p>
                      <span className="inline-link">Pokaż szczegóły</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="photo-panel archive-map-panel">
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Widok mapy</p>
                <h2>Odkrywaj zdjęcia przez miejsca</h2>
              </div>
              <p className="photo-panel__meta">
                Na mapie pojawiają się tylko zdjęcia z użytecznymi współrzędnymi.
              </p>
            </div>

            <div className="archive-map-panel__status">
              <span>{mappablePhotos.length} punktów w aktualnym widoku</span>
              <span>
                {selectedPhotoHasMapCoordinates
                  ? "Wybrane zdjęcie jest widoczne także na mapie."
                  : "Wybrane zdjęcie nie ma współrzędnych lub nie zostało jeszcze wskazane."}
              </span>
            </div>

            <SimplePhotoMap
              points={mappablePhotos.map((photo) => ({
                id: photo.id,
                latitude: photo.latitude as number,
                longitude: photo.longitude as number,
                label: photo.location_text,
              }))}
              viewResetKey={mapViewResetKey}
              selectedPointId={selectedPhotoHasMapCoordinates ? selectedPhoto?.id : null}
              onSelectPoint={(pointId) => setSelectedPhotoId(Number(pointId))}
              emptyLabel="Nie ma jeszcze zdjęć z dostępnymi współrzędnymi."
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
