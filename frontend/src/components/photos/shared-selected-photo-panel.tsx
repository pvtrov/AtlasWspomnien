"use client";

import Link from "next/link";

import { PhotoImage } from "@/components/photos/photo-image";
import { type Photo } from "@/services/api-client";

type Props = {
  photo: Photo | null;
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

export function SharedSelectedPhotoPanel({ photo }: Props) {
  if (!photo) {
    return (
      <article className="photo-panel">
        <p className="eyebrow">Shared photo detail</p>
        <h2>Select a photo</h2>
        <p className="lede">
          Choose a photo from the list or click a map pin to open its details beside the map.
        </p>
      </article>
    );
  }

  return (
    <article className="photo-panel">
      <p className="eyebrow">Shared photo detail</p>
      <h2>{photo.location_text}</h2>
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
          <dt>Location text</dt>
          <dd>{photo.location_text}</dd>
        </div>
        {photo.latitude !== null && photo.longitude !== null ? (
          <div>
            <dt>Coordinates</dt>
            <dd>
              {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
            </dd>
          </div>
        ) : null}
      </dl>

      <Link href={`/all_photos/${photo.id}`} className="inline-link">
        Open dedicated detail page
      </Link>
    </article>
  );
}
