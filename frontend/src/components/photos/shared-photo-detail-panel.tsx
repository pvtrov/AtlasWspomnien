"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { PhotoLocationEditor } from "@/components/photos/photo-location-editor";
import { PhotoImage } from "@/components/photos/photo-image";
import { PHOTO_CATEGORY_OPTIONS } from "@/lib/photo-categories";
import {
  deleteAdminPhoto,
  getSharedPhoto,
  type Photo,
  updateAdminPhoto,
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

export function SharedPhotoDetailPanel() {
  const params = useParams<{ photoId: string }>();
  const router = useRouter();
  const { currentUser, status } = useAuth();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [message, setMessage] = useState("Loading photo details...");
  const [values, setValues] = useState<EditValues | null>(null);
  const [adminMessage, setAdminMessage] = useState(
    "Administrator moderation tools are available in this shared photo view.",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const photoId = Number(params.photoId);
  const isAdministrator = currentUser?.role === "administrator";
  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }, [status]);

  useEffect(() => {
    async function loadPhoto(): Promise<void> {
      if (Number.isNaN(photoId)) {
        setMessage("Invalid photo id.");
        return;
      }

      try {
        const loadedPhoto = await getSharedPhoto(photoId);
        setPhoto(loadedPhoto);
        setValues(createEditValues(loadedPhoto));
        setMessage("Shared photo detail is available to all visitors.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load this photo.",
        );
      }
    }

    void loadPhoto();
  }, [photoId]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target;
    setValues((currentValues) =>
      currentValues ? { ...currentValues, [name]: value } : currentValues,
    );
    setAdminMessage("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!token || !values || Number.isNaN(photoId)) {
      setAdminMessage("Please log in again before saving moderation changes.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedPhoto = await updateAdminPhoto(token, photoId, {
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
      setAdminMessage("Photo metadata updated through administrator moderation.");
    } catch (error) {
      setAdminMessage(
        error instanceof Error ? error.message : "Photo moderation update failed.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!token || Number.isNaN(photoId)) {
      setAdminMessage("Please log in again before removing this photo.");
      return;
    }

    const confirmed = window.confirm(
      "Remove this photo from the shared archive? This will delete the stored file and metadata.",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAdminPhoto(token, photoId);
      router.push("/");
      router.refresh();
    } catch (error) {
      setAdminMessage(
        error instanceof Error ? error.message : "Photo removal failed.",
      );
      setIsDeleting(false);
    }
  }

  if (!photo || Number.isNaN(photoId)) {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Shared archive photo</p>
        <h1>Photo detail</h1>
        <p className="lede">{message}</p>
        <Link href="/" className="inline-link">
          Back to home
        </Link>
      </section>
    );
  }

  return (
    <section className="photo-detail-layout">
      <article className="photo-panel">
        <p className="eyebrow">Shared archive photo</p>
        <h1>{photo.location_text}</h1>
        {photo.description ? <p className="lede">{photo.description}</p> : null}

        <PhotoImage
          photoId={photo.id}
          alt={photo.description || `Archive photo from ${photo.location_text}`}
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

        <Link href="/" className="inline-link">
          Back to home
        </Link>
      </article>

      <article className="photo-panel">
        <p className="eyebrow">Shared browsing layer</p>
        <h2>Unified access</h2>
        <p className="lede">
          This page is the same shared detail layer for anonymous visitors and authenticated users.
        </p>

        {isAdministrator && values ? (
          <>
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Administrator moderation</p>
                <h2>Moderate in context</h2>
              </div>
              <button
                type="button"
                className="button button--danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "Remove photo"}
              </button>
            </div>

            <p className="auth-form__message" aria-live="polite">
              {adminMessage}
            </p>

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
                  <label htmlFor="taken_year">Taken year</label>
                  <input
                    id="taken_year"
                    name="taken_year"
                    inputMode="numeric"
                    value={values.taken_year}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="taken_month">Taken month</label>
                  <input
                    id="taken_month"
                    name="taken_month"
                    inputMode="numeric"
                    value={values.taken_month}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="taken_day">Taken day</label>
                  <input
                    id="taken_day"
                    name="taken_day"
                    inputMode="numeric"
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
                  rows={5}
                  value={values.description}
                  onChange={handleChange}
                />
              </div>

              <div className="photo-panel__actions">
                <button
                  type="submit"
                  className="auth-form__submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save moderation changes"}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </article>
    </section>
  );
}
