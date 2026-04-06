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
      <article className="photo-panel archive-detail-panel archive-detail-panel--empty">
        <p className="eyebrow">Szczegóły zdjęcia</p>
        <h2>Wybierz zdjęcie</h2>
        <p className="lede">
          Wybierz zdjęcie z listy albo kliknij pinezkę na mapie, aby otworzyć jego szczegóły obok mapy.
        </p>
      </article>
    );
  }

  return (
    <article className="photo-panel archive-detail-panel">
      <p className="eyebrow">Szczegóły zdjęcia</p>
      <h2>{photo.display_name || photo.location_text}</h2>
      {photo.description ? <p className="lede">{photo.description}</p> : null}

      <PhotoImage
        photoId={photo.id}
        alt={photo.display_name || photo.description || `Zdjęcie archiwalne z lokalizacji ${photo.location_text}`}
        className="photo-detail__image"
      />

      <dl className="photo-detail__meta">
        <div>
          <dt>Tytuł zdjęcia</dt>
          <dd>{photo.display_name || photo.location_text}</dd>
        </div>
        <div>
          <dt>Kategoria</dt>
          <dd>{photo.category.name}</dd>
        </div>
        <div>
          <dt>Data wykonania</dt>
          <dd>{formatPhotoDate(photo)}</dd>
        </div>
        <div>
          <dt>Lokalizacja</dt>
          <dd>{photo.location_text}</dd>
        </div>
        {photo.latitude !== null && photo.longitude !== null ? (
          <div>
            <dt>Współrzędne</dt>
            <dd>
              {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="archive-detail-panel__footer">
        <span className="archive-detail-panel__hint">
          Ten panel pozostaje zsynchronizowany z listą i mapą.
        </span>
        <Link href={`/all_photos/${photo.id}`} className="inline-link">
          Otwórz osobną stronę szczegółów
        </Link>
      </div>
    </article>
  );
}
