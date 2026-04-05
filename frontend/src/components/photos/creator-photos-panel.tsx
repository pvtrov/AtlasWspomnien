"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  const [loadMessage, setLoadMessage] = useState("Your uploaded photos will appear here.");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<UploadFormValues>(initialUploadValues);

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
            ? "Your latest uploaded photos are ready to manage."
            : "You have not uploaded any photos yet.",
        );
      } catch (error) {
        setLoadMessage(
          error instanceof Error
            ? error.message
            : "Could not load your photos.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadPhotos();
  }, [currentUser, status, token]);

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

    if (!token) {
      setSubmitMessage("Please log in to upload a photo.");
      return;
    }

    if (!values.file) {
      setSubmitMessage("Please choose a photo file.");
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
      setSubmitMessage("Photo uploaded successfully.");
      setLoadMessage("Your latest uploaded photos are ready to manage.");
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Photo upload failed.",
      );
    } finally {
      setIsSubmitting(false);
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
        <h1>Creator photo flow</h1>
        <p className="lede">
          Log in as a creator to upload photos and manage your own archive materials.
        </p>
        <div className="photo-panel__actions">
          <Link href="/login" className="inline-link">
            Go to login
          </Link>
          <Link href="/register" className="inline-link">
            Create an account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="photo-workspace">
      <div className="photo-panel">
        <p className="eyebrow">Sprint 3</p>
        <h1>Upload and manage your photos.</h1>
        <p className="lede">
          Add one archive photo with the required metadata, then open each photo
          for its first edit or delete flow.
        </p>

        <form className="photo-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="file">Photo file</label>
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
              <label htmlFor="category_slug">Category</label>
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
            legend="Photo date"
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

          <div className="auth-field">
            <label htmlFor="display_name">Photo title</label>
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={values.description}
              onChange={handleFieldChange}
            />
          </div>

          <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload photo"}
          </button>

          <p className="auth-form__message" aria-live="polite">
            {submitMessage}
          </p>
        </form>
      </div>

      <section className="photo-panel">
        <div className="photo-panel__heading">
          <div>
            <p className="eyebrow">Your photos</p>
            <h2>Creator-owned list</h2>
          </div>
          <p className="photo-panel__meta">{loadMessage}</p>
        </div>

        {isLoading ? <p>Loading your photos...</p> : null}

        {!isLoading && photos.length === 0 ? (
          <p className="photo-list__empty">Upload your first photo to start managing it here.</p>
        ) : null}

        <div className="photo-list">
          {photos.map((photo) => (
            <article key={photo.id} className="photo-card">
              {token ? (
                <PhotoImage
                  photoId={photo.id}
                  alt={photo.display_name || photo.description || `Archive photo from ${photo.location_text}`}
                  className="photo-card__image"
                />
              ) : null}
              <div className="photo-card__body">
                <p className="photo-card__category">{photo.category.name}</p>
                <h3>{photo.display_name || photo.location_text}</h3>
                <p className="photo-card__meta">{photo.location_text}</p>
                {photo.description ? <p>{photo.description}</p> : null}
                <p className="photo-card__meta">{formatPhotoDate(photo)}</p>
                <Link href={`/photos/${photo.id}`} className="inline-link">
                  Open detail view
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
