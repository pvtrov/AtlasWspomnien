"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  createPartialDateValue,
  PartialDateInput,
} from "@/components/photos/partial-date-input";
import { PhotoLocationEditor } from "@/components/photos/photo-location-editor";
import { PHOTO_CATEGORY_OPTIONS } from "@/lib/photo-categories";
import {
  type Photo,
  listOwnedPhotos,
  uploadPhoto,
} from "@/services/api-client";
import { PhotoImage } from "@/components/photos/photo-image";

type UploadFormValues = {
  file: File | null;
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

const initialUploadValues: UploadFormValues = {
  file: null,
  category_slug: PHOTO_CATEGORY_OPTIONS[0].slug,
  description: "",
  display_name: "",
  location_text: "",
  latitude: "",
  longitude: "",
  taken_year: "",
  taken_month: "",
  taken_day: "",
};

const AUTH_TOKEN_STORAGE_KEY = "aitsi.auth.access_token";

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

function buildCreateCoordinates(values: UploadFormValues): {
  latitude?: number;
  longitude?: number;
} {
  if (!values.latitude.trim() && !values.longitude.trim()) {
    return {};
  }

  return {
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
  };
}

export function CreatorPhotosPanel() {
  const { currentUser, status } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState("W tym miejscu pojawią się Twoje dodane zdjęcia.");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<UploadFormValues>(initialUploadValues);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const isBlocked = currentUser?.is_blocked ?? false;

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }, [status]);

  useEffect(() => {
    async function loadPhotos(): Promise<void> {
      if (!token || status !== "authenticated" || !currentUser) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await listOwnedPhotos(token, currentUser.id);
        setPhotos(response);
        setLoadMessage(
          response.length > 0
            ? "Twoje najnowsze zdjęcia są gotowe do zarządzania."
            : "Nie dodano jeszcze żadnych zdjęć.",
        );
      } catch (error) {
        setLoadMessage(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać Twoich zdjęć.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadPhotos();
  }, [currentUser, status, token]);

  useEffect(() => {
    const textarea = descriptionRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 52)}px`;
  }, [values.description]);

  function handleFieldChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setSubmitMessage("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    setValues((currentValues) => ({ ...currentValues, file }));
    setSubmitMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isBlocked) {
      setSubmitMessage("Jesteś zablokowany, skontaktuj się z administracją.");
      return;
    }

    if (!token) {
      setSubmitMessage("Zaloguj się, aby dodać zdjęcie.");
      return;
    }

    if (!values.file) {
      setSubmitMessage("Wybierz plik ze zdjęciem.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdPhoto = await uploadPhoto(token, {
        file: values.file,
        category_slug: values.category_slug,
        description: values.description.trim(),
        display_name: values.display_name.trim(),
        location_text: values.location_text.trim(),
        ...buildCreateCoordinates(values),
        taken_year: Number(values.taken_year),
        taken_month: values.taken_month ? Number(values.taken_month) : undefined,
        taken_day: values.taken_day ? Number(values.taken_day) : undefined,
      });
      setPhotos((currentPhotos) => [createdPhoto, ...currentPhotos]);
      setValues(initialUploadValues);
      setSubmitMessage("Zdjęcie zostało dodane.");
      setLoadMessage("Twoje najnowsze zdjęcia są gotowe do zarządzania.");
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Dodawanie zdjęcia nie powiodło się.",
      );
    } finally {
      setIsSubmitting(false);
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
        <p className="eyebrow">Przestrzeń twórcy</p>
        <h1>Przestrzeń twórcy</h1>
        <p className="lede">
          Zaloguj się jako twórca, aby dodawać zdjęcia i zarządzać własnymi materiałami archiwalnymi.
        </p>
        <div className="photo-panel__actions">
          <Link href="/login" className="inline-link">
            Przejdź do logowania
          </Link>
          <Link href="/register" className="inline-link">
            Załóż konto
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="photo-workspace creator-workspace">
      <div className={`creator-blocked-surface creator-blocked-surface--panel${isBlocked ? " creator-blocked-surface--inactive" : ""}`}>
        <div className="photo-panel creator-workspace__form-panel">
          <p className="eyebrow">Atlas Wspomnień</p>
          <h1>Dodawaj i zarządzaj swoimi zdjęciami.</h1>
          <p className="lede">
            Dodaj zdjęcie archiwalne z wymaganymi metadanymi, a potem otwieraj jego szczegóły, aby je edytować lub usunąć.
          </p>

          <form className="photo-form creator-photo-form" onSubmit={handleSubmit}>
            <div className="creator-photo-form__primary">
              <div className="auth-field">
                <label htmlFor="display_name">Tytuł zdjęcia</label>
                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  value={values.display_name}
                  onChange={handleFieldChange}
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
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="file">Plik zdjęcia</label>
              <input
                id="file"
                name="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="photo-form__grid">
              <div className="auth-field">
                <label htmlFor="category_slug">Kategoria</label>
                <select
                  id="category_slug"
                  name="category_slug"
                  value={values.category_slug}
                  onChange={handleFieldChange}
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
              baseName="uploadDate"
              value={createPartialDateValue(
                values.taken_year,
                values.taken_month,
                values.taken_day,
              )}
              onChange={(nextValue) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  taken_year: nextValue.year,
                  taken_month: nextValue.month,
                  taken_day: nextValue.day,
                }))
              }
            />

            <PhotoLocationEditor
              locationText={values.location_text}
              latitudeText={values.latitude}
              longitudeText={values.longitude}
              onLocationTextChange={(value) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  location_text: value,
                }))
              }
              onLatitudeTextChange={(value) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  latitude: value,
                }))
              }
              onLongitudeTextChange={(value) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  longitude: value,
                }))
              }
            />

            <div className="creator-photo-form__footer">
              <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Dodawanie..." : "Dodaj zdjęcie"}
              </button>

              <p className="auth-form__message" aria-live="polite" role="status">
                {submitMessage}
              </p>
            </div>
          </form>
        </div>

        {isBlocked ? (
          <div className="creator-blocked-surface__overlay" role="status" aria-live="polite">
            <p>Jesteś zablokowany, skontaktuj się z administracją.</p>
          </div>
        ) : null}
      </div>

      <section className="photo-panel creator-workspace__list-panel">
        <div className="photo-panel__heading">
          <div>
            <p className="eyebrow">Twoje zdjęcia</p>
            <h2>Lista materiałów twórcy</h2>
          </div>
          <p className="photo-panel__meta">{loadMessage}</p>
        </div>

        {isLoading ? <p>Ładowanie Twoich zdjęć...</p> : null}

        {!isLoading && photos.length === 0 ? (
          <p className="photo-list__empty">Dodaj pierwsze zdjęcie, aby zacząć nim zarządzać w tym miejscu.</p>
        ) : null}

        <div className="photo-list">
          {photos.map((photo) => (
            <article key={photo.id} className="photo-card creator-photo-card">
              {token ? (
                <PhotoImage
                  photoId={photo.id}
                  alt={photo.display_name || photo.description || `Zdjęcie archiwalne z lokalizacji ${photo.location_text}`}
                  className="photo-card__image"
                />
              ) : null}
              <div className="photo-card__body">
                <p className="photo-card__category">{photo.category.name}</p>
                <h3>{photo.display_name || photo.location_text}</h3>
                <p className="photo-card__meta">{photo.location_text}</p>
                {photo.description ? <p>{photo.description}</p> : null}
                <div className="photo-card__footer">
                  <p className="photo-card__meta">{formatPhotoDate(photo)}</p>
                  <Link href={`/photos/${photo.id}`} className="inline-link">
                    Otwórz szczegóły
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
