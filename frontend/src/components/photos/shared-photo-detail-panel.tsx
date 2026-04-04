"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PhotoImage } from "@/components/photos/photo-image";
import { getSharedPhoto, type Photo } from "@/services/api-client";

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
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [message, setMessage] = useState("Loading photo details...");

  const photoId = Number(params.photoId);

  useEffect(() => {
    async function loadPhoto(): Promise<void> {
      if (Number.isNaN(photoId)) {
        setMessage("Invalid photo id.");
        return;
      }

      try {
        const loadedPhoto = await getSharedPhoto(photoId);
        setPhoto(loadedPhoto);
        setMessage("Shared photo detail is available to all visitors.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load this photo.",
        );
      }
    }

    void loadPhoto();
  }, [photoId]);

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
      </article>
    </section>
  );
}
