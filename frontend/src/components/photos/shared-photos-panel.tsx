"use client";

import { useEffect, useState } from "react";

import { PhotoImage } from "@/components/photos/photo-image";
import { SharedSelectedPhotoPanel } from "@/components/photos/shared-selected-photo-panel";
import { SimplePhotoMap } from "@/components/photos/simple-photo-map";
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
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Loading archive photos...");

  useEffect(() => {
    async function loadPhotos(): Promise<void> {
      try {
        const loadedPhotos = await listSharedPhotos();
        setPhotos(loadedPhotos);
        if (loadedPhotos.length > 0) {
          const firstMappedPhoto = loadedPhotos.find(
            (photo) => photo.latitude !== null && photo.longitude !== null,
          );
          setSelectedPhotoId(firstMappedPhoto?.id ?? loadedPhotos[0]?.id ?? null);
        }
        setMessage(
          loadedPhotos.length > 0
            ? "Browse the shared archive through one list, one map, and one inline detail panel."
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

  const selectedPhoto =
    photos.find((photo) => photo.id === selectedPhotoId) ?? null;
  const mappablePhotos = photos.filter(
    (photo) => photo.latitude !== null && photo.longitude !== null,
  );

  return (
    <section className="photo-panel">
      <div className="photo-panel__heading">
        <div>
          <p className="eyebrow">Sprint 6</p>
          <h1>Map-based archive discovery</h1>
        </div>
        <p className="photo-panel__meta">{message}</p>
      </div>

      {!isLoading && photos.length === 0 ? (
        <p className="photo-list__empty">Archive browsing will appear here once photos are available.</p>
      ) : null}

      <div className="archive-discovery-layout">
        <section className="archive-discovery-main">
          <article className="photo-panel">
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Archive list</p>
                <h2>Browse all photos</h2>
              </div>
              <p className="photo-panel__meta">
                Selecting a list item opens its details on the right.
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
                    alt={photo.description || `Archive photo from ${photo.location_text}`}
                    className="photo-card__image"
                  />
                  <div className="photo-card__body">
                    <p className="photo-card__category">{photo.category.name}</p>
                    <h3>{photo.location_text}</h3>
                    {photo.description ? <p>{photo.description}</p> : null}
                    <p className="photo-card__meta">{formatPhotoDate(photo)}</p>
                    <span className="inline-link">Show details on the right</span>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="photo-panel">
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Map view</p>
                <h2>Photos with coordinates</h2>
              </div>
              <p className="photo-panel__meta">
                Only photos with usable coordinates appear on the map.
              </p>
            </div>

            <SimplePhotoMap
              points={mappablePhotos.map((photo) => ({
                id: photo.id,
                latitude: photo.latitude as number,
                longitude: photo.longitude as number,
                label: photo.location_text,
              }))}
              selectedPointId={
                selectedPhoto &&
                selectedPhoto.latitude !== null &&
                selectedPhoto.longitude !== null
                  ? selectedPhoto.id
                  : null
              }
              onSelectPoint={(pointId) => setSelectedPhotoId(Number(pointId))}
              emptyLabel="No photos with coordinates are available yet."
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
