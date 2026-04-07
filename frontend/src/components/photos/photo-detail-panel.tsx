"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  createPartialDateValue,
  PartialDateInput,
} from "@/components/photos/partial-date-input";
import { PhotoLocationEditor } from "@/components/photos/photo-location-editor";
import { PhotoImage } from "@/components/photos/photo-image";
import { PHOTO_CATEGORY_OPTIONS } from "@/lib/photo-categories";
import {
  deleteCreatorPhoto,
  getCreatorPhoto,
  type Photo,
  updateCreatorPhoto,
} from "@/services/api-client";

type EditValues = {
  category_slug: string;
  description: string;
  display_name: string;
  location_text: string;
  latitude: string;
  longitude: string;
  taken_year: string;
  taken_month: string;
  taken_day: string;
};

const AUTH_TOKEN_STORAGE_KEY = "aitsi.auth.access_token";

function createEditValues(photo: Photo): EditValues {
  return {
    category_slug: photo.category.slug,
    description: photo.description,
    display_name: photo.display_name ?? "",
    location_text: photo.location_text,
    latitude: photo.latitude !== null ? String(photo.latitude) : "",
    longitude: photo.longitude !== null ? String(photo.longitude) : "",
    taken_year: String(photo.taken_year),
    taken_month: photo.taken_month ? String(photo.taken_month) : "",
    taken_day: photo.taken_day ? String(photo.taken_day) : "",
  };
}

function buildUpdateCoordinates(values: EditValues): {
  latitude: number | null;
  longitude: number | null;
} {
  if (!values.latitude.trim() && !values.longitude.trim()) {
    return {
      latitude: null,
      longitude: null,
    };
  }

  return {
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
  };
}

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

export function PhotoDetailPanel() {
  const params = useParams<{ photoId: string }>();
  const router = useRouter();
  const { currentUser, status } = useAuth();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [values, setValues] = useState<EditValues | null>(null);
  const [message, setMessage] = useState("Ładowanie szczegółów zdjęcia...");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const openLightboxButtonRef = useRef<HTMLButtonElement | null>(null);
  const isBlocked = currentUser?.is_blocked ?? false;

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }, [status]);

  const photoId = Number(params.photoId);

  useEffect(() => {
    async function loadPhoto(): Promise<void> {
      if (!token || status !== "authenticated" || Number.isNaN(photoId)) {
        return;
      }

      try {
        const loadedPhoto = await getCreatorPhoto(token, photoId);
        setPhoto(loadedPhoto);
        setValues(createEditValues(loadedPhoto));
        setMessage("Możesz zaktualizować metadane albo usunąć to zdjęcie.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Nie udało się pobrać tego zdjęcia.",
        );
      }
    }

    void loadPhoto();
  }, [photoId, status, token]);

  useEffect(() => {
    const textarea = descriptionRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 52)}px`;
  }, [values?.description]);

  useEffect(() => {
    if (!isImageExpanded) {
      openLightboxButtonRef.current?.focus();
      return;
    }

    lightboxCloseButtonRef.current?.focus();

    function handleEscapeKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsImageExpanded(false);
      }
    }

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isImageExpanded]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target;
    setValues((currentValues) =>
      currentValues ? { ...currentValues, [name]: value } : currentValues,
    );
    setMessage("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isBlocked) {
      setMessage("Jesteś zablokowany, skontaktuj się z administracją.");
      return;
    }

    if (!token || !values || Number.isNaN(photoId)) {
      setMessage("Zaloguj się ponownie przed zapisaniem zmian.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedPhoto = await updateCreatorPhoto(token, photoId, {
        category_slug: values.category_slug,
        description: values.description.trim(),
        display_name: values.display_name.trim(),
        location_text: values.location_text.trim(),
        ...buildUpdateCoordinates(values),
        taken_year: Number(values.taken_year),
        taken_month: values.taken_month ? Number(values.taken_month) : undefined,
        taken_day: values.taken_day ? Number(values.taken_day) : undefined,
      });
      setPhoto(updatedPhoto);
      setValues(createEditValues(updatedPhoto));
      setMessage("Metadane zdjęcia zostały zaktualizowane.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Aktualizacja zdjęcia nie powiodła się.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (isBlocked) {
      setMessage("Jesteś zablokowany, skontaktuj się z administracją.");
      return;
    }

    if (!token || Number.isNaN(photoId)) {
      setMessage("Zaloguj się ponownie przed usunięciem tego zdjęcia.");
      return;
    }

    const confirmed = window.confirm(
      "Usunąć to zdjęcie? Spowoduje to usunięcie rekordu twórcy i zapisanego pliku.",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCreatorPhoto(token, photoId);
      router.push("/photos");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Usuwanie zdjęcia nie powiodło się.",
      );
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="photo-panel">
        <p className="lede">Sprawdzanie sesji twórcy...</p>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Zdjęcie twórcy</p>
        <h1>Szczegóły zdjęcia twórcy</h1>
        <p className="lede">Zaloguj się, aby otworzyć szczegóły swojego zdjęcia i zarządzać własnymi materiałami.</p>
        <Link href="/login" className="inline-link">
          Przejdź do logowania
        </Link>
      </section>
    );
  }

  if (!photo || !values || Number.isNaN(photoId)) {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Zdjęcie twórcy</p>
        <h1>Szczegóły zdjęcia</h1>
        <p className="lede">{message}</p>
        <Link href="/photos" className="inline-link">
          Wróć do listy zdjęć
        </Link>
      </section>
    );
  }

  return (
    <section className="photo-detail-layout creator-detail-layout">
      <article className="photo-panel creator-detail-layout__summary photo-story-panel">
        <div className="photo-story-panel__header">
          <div>
            <p className="eyebrow">Zdjęcie twórcy</p>
            <h1>{photo.display_name || photo.location_text}</h1>
            {photo.description ? <p className="lede">{photo.description}</p> : null}
          </div>

          <Link href="/photos" className="inline-link">
            Wróć do listy zdjęć
          </Link>
        </div>

        <div className="photo-story-panel__layout">
          <button
            ref={openLightboxButtonRef}
            type="button"
            className="photo-detail__image-button"
            onClick={() => setIsImageExpanded(true)}
            aria-label="Pokaż zdjęcie w dużym widoku"
            aria-haspopup="dialog"
          >
            <PhotoImage
              photoId={photo.id}
              alt={photo.display_name || photo.description || `Zdjęcie archiwalne z lokalizacji ${photo.location_text}`}
              className="photo-detail__image photo-detail__image--hero"
            />
          </button>
        </div>

        <div className="photo-detail__sidebar photo-detail__sidebar--below">
          <section className="photo-detail__meta-group">
            <p className="eyebrow">Metadane podstawowe</p>
            <dl className="photo-detail__meta">
              <div>
                <dt>Tytuł zdjęcia</dt>
                <dd>{photo.display_name || photo.location_text}</dd>
              </div>
              <div>
                <dt>Autor</dt>
                <dd>{photo.owner_username}</dd>
              </div>
              <div>
                <dt>Lokalizacja</dt>
                <dd>{photo.location_text}</dd>
              </div>
              <div>
                <dt>Kategoria</dt>
                <dd>{photo.category.name}</dd>
              </div>
            </dl>
          </section>

          <section className="photo-detail__meta-group">
            <p className="eyebrow">Kontekst archiwalny</p>
            <dl className="photo-detail__meta">
              <div>
                <dt>Data wykonania</dt>
                <dd>{formatPhotoDate(photo)}</dd>
              </div>
              {photo.latitude !== null && photo.longitude !== null ? (
                <div>
                  <dt>Współrzędne</dt>
                  <dd>
                    {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Ostatnia aktualizacja</dt>
                <dd>{new Date(photo.updated_at).toLocaleString()}</dd>
              </div>
            </dl>
          </section>
        </div>
      </article>

      <div className={`creator-blocked-surface creator-blocked-surface--panel${isBlocked ? " creator-blocked-surface--inactive" : ""}`}>
        <article className="photo-panel creator-detail-layout__editor">
          <div className="photo-panel__heading">
            <div>
              <p className="eyebrow">Edycja metadanych</p>
              <h2>Zarządzanie zdjęciem</h2>
            </div>
            <button
              type="button"
              className="button button--danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Usuwanie..." : "Usuń zdjęcie"}
            </button>
          </div>

          <form className="photo-form creator-photo-form" onSubmit={handleSave}>
            <div className="creator-photo-form__primary">
              <div className="auth-field">
                <label htmlFor="display_name">Tytuł zdjęcia</label>
                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  value={values.display_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="description">Opis</label>
                <textarea
                  ref={descriptionRef}
                  id="description"
                  name="description"
                  rows={1}
                  className="auth-field__textarea--autogrow"
                  value={values.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="photo-form__grid">
              <div className="auth-field">
                <label htmlFor="category_slug">Kategoria</label>
                <select
                  id="category_slug"
                  name="category_slug"
                  value={values.category_slug}
                  onChange={handleChange}
                >
                  {PHOTO_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PartialDateInput
              legend="Data zdjęcia"
              baseName="editDate"
              value={createPartialDateValue(
                values.taken_year,
                values.taken_month,
                values.taken_day,
              )}
              onChange={(nextValue) =>
                setValues((currentValues) =>
                  currentValues
                    ? {
                        ...currentValues,
                        taken_year: nextValue.year,
                        taken_month: nextValue.month,
                        taken_day: nextValue.day,
                      }
                    : currentValues,
                )
              }
            />

            <PhotoLocationEditor
              locationText={values.location_text}
              latitudeText={values.latitude}
              longitudeText={values.longitude}
              onLocationTextChange={(value) =>
                setValues((currentValues) =>
                  currentValues
                    ? { ...currentValues, location_text: value }
                    : currentValues,
                )
              }
              onLatitudeTextChange={(value) =>
                setValues((currentValues) =>
                  currentValues ? { ...currentValues, latitude: value } : currentValues,
                )
              }
              onLongitudeTextChange={(value) =>
                setValues((currentValues) =>
                  currentValues ? { ...currentValues, longitude: value } : currentValues,
                )
              }
            />

            <button className="auth-form__submit" type="submit" disabled={isSaving}>
              {isSaving ? "Zapisywanie..." : "Zapisz metadane"}
            </button>
          </form>

          <p className="auth-form__message" aria-live="polite" role="status">
            {message}
          </p>
        </article>

        {isBlocked ? (
          <div className="creator-blocked-surface__overlay" role="status" aria-live="polite">
            <p>Jesteś zablokowany, skontaktuj się z administracją.</p>
          </div>
        ) : null}
      </div>

      {isImageExpanded ? (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Duży widok zdjęcia"
          onClick={() => setIsImageExpanded(false)}
        >
          <button
            ref={lightboxCloseButtonRef}
            type="button"
            className="photo-lightbox__close"
            onClick={() => setIsImageExpanded(false)}
            aria-label="Zamknij duży widok zdjęcia"
          >
            Zamknij
          </button>
          <div className="photo-lightbox__content" onClick={(event) => event.stopPropagation()}>
            <PhotoImage
              photoId={photo.id}
              alt={photo.display_name || photo.description || `Zdjęcie archiwalne z lokalizacji ${photo.location_text}`}
              className="photo-lightbox__image"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
