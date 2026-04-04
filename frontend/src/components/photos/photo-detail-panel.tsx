"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
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
  const [message, setMessage] = useState("Loading photo details...");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setMessage("You can update the metadata or delete this photo.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load this photo.",
        );
      }
    }

    void loadPhoto();
  }, [photoId, status, token]);

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

    if (!token || !values || Number.isNaN(photoId)) {
      setMessage("Please log in again before saving changes.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedPhoto = await updateCreatorPhoto(token, photoId, {
        category_slug: values.category_slug,
        description: values.description.trim(),
        location_text: values.location_text.trim(),
        ...buildUpdateCoordinates(values),
        taken_year: Number(values.taken_year),
        taken_month: values.taken_month ? Number(values.taken_month) : undefined,
        taken_day: values.taken_day ? Number(values.taken_day) : undefined,
      });
      setPhoto(updatedPhoto);
      setValues(createEditValues(updatedPhoto));
      setMessage("Photo metadata updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Photo update failed.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!token || Number.isNaN(photoId)) {
      setMessage("Please log in again before deleting this photo.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this photo? This will remove the creator-owned record and stored file.",
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
        error instanceof Error ? error.message : "Photo deletion failed.",
      );
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="photo-panel">
        <p className="lede">Checking your creator session...</p>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Sprint 3</p>
        <h1>Creator photo detail</h1>
        <p className="lede">
          Log in to open your photo detail view and manage your own uploads.
        </p>
        <Link href="/login" className="inline-link">
          Go to login
        </Link>
      </section>
    );
  }

  if (!photo || !values || Number.isNaN(photoId)) {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Creator photo</p>
        <h1>Photo detail</h1>
        <p className="lede">{message}</p>
        <Link href="/photos" className="inline-link">
          Back to photo list
        </Link>
      </section>
    );
  }

  return (
    <section className="photo-detail-layout">
      <article className="photo-panel">
        <p className="eyebrow">Creator photo</p>
        <h1>{photo.location_text}</h1>
        {photo.description ? <p className="lede">{photo.description}</p> : null}

        <PhotoImage
          photoId={photo.id}
          alt={photo.description}
          className="photo-detail__image"
        />

        <dl className="photo-detail__meta">
          <div>
            <dt>Category</dt>
            <dd>{photo.category.name}</dd>
          </div>
          {photo.latitude !== null && photo.longitude !== null ? (
            <div>
              <dt>Coordinates</dt>
              <dd>
                {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>Taken date</dt>
            <dd>{formatPhotoDate(photo)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{new Date(photo.updated_at).toLocaleString()}</dd>
          </div>
        </dl>

        <Link href="/photos" className="inline-link">
          Back to photo list
        </Link>
      </article>

      <article className="photo-panel">
        <div className="photo-panel__heading">
          <div>
            <p className="eyebrow">Edit metadata</p>
            <h2>First edit flow</h2>
          </div>
          <button
            type="button"
            className="button button--danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete photo"}
          </button>
        </div>

        <form className="photo-form" onSubmit={handleSave}>
          <div className="photo-form__grid">
            <div className="auth-field">
              <label htmlFor="category_slug">Category</label>
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

            <div className="auth-field">
              <label htmlFor="taken_year">Year</label>
              <input
                id="taken_year"
                name="taken_year"
                type="number"
                inputMode="numeric"
                value={values.taken_year}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="taken_month">Month</label>
              <input
                id="taken_month"
                name="taken_month"
                type="number"
                inputMode="numeric"
                min="1"
                max="12"
                value={values.taken_month}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="taken_day">Day</label>
              <input
                id="taken_day"
                name="taken_day"
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                value={values.taken_day}
                onChange={handleChange}
              />
            </div>
          </div>

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

          <div className="auth-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={values.description}
              onChange={handleChange}
            />
          </div>

          <button className="auth-form__submit" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save metadata"}
          </button>
        </form>

        <p className="auth-form__message" aria-live="polite">
          {message}
        </p>
      </article>
    </section>
  );
}
