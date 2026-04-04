"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PhotoImage } from "@/components/photos/photo-image";
import { listSharedPhotos, type Photo } from "@/services/api-client";

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

export function SharedPhotosPanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Loading archive photos...");

  useEffect(() => {
    async function loadPhotos(): Promise<void> {
      try {
        const loadedPhotos = await listSharedPhotos();
        setPhotos(loadedPhotos);
        setMessage(
          loadedPhotos.length > 0
            ? "Browse the shared archive through one photo layer for all visitors."
            : "No archive photos are available yet.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load archive photos.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadPhotos();
  }, []);

  return (
    <section className="photo-panel">
      <div className="photo-panel__heading">
        <div>
          <p className="eyebrow">Sprint 5</p>
          <h1>Shared archive browsing</h1>
        </div>
        <p className="photo-panel__meta">{message}</p>
      </div>

      {!isLoading && photos.length === 0 ? (
        <p className="photo-list__empty">Archive browsing will appear here once photos are available.</p>
      ) : null}

      <div className="photo-list">
        {photos.map((photo) => (
          <article key={photo.id} className="photo-card">
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
              <Link href={`/all_photos/${photo.id}`} className="inline-link">
                Open photo details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
