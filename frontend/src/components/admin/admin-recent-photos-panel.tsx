"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  listRecentAdminPhotos,
  type AdminRecentPhoto,
  type AdminRecentPhotoListResponse,
} from "@/services/api-client";

const AUTH_TOKEN_STORAGE_KEY = "aitsi.auth.access_token";

function formatArchiveDate(photo: AdminRecentPhoto): string {
  const parts = [String(photo.taken_year)];

  if (photo.taken_month !== null) {
    parts.push(String(photo.taken_month).padStart(2, "0"));
  }

  if (photo.taken_day !== null) {
    parts.push(String(photo.taken_day).padStart(2, "0"));
  }

  return parts.join("-");
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Brak";
  }

  return new Date(value).toLocaleString("pl-PL");
}

export function AdminRecentPhotosPanel() {
  const { currentUser, status } = useAuth();
  const [reviewData, setReviewData] = useState<AdminRecentPhotoListResponse | null>(null);
  const [message, setMessage] = useState(
    "Tutaj pojawią się zdjęcia dodane lub zaktualizowane od poprzedniego logowania administratora.",
  );
  const [isLoading, setIsLoading] = useState(false);

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }, [status]);

  useEffect(() => {
    async function loadRecentPhotos(): Promise<void> {
      if (!token || status !== "authenticated" || currentUser?.role !== "administrator") {
        return;
      }

      setIsLoading(true);

      try {
        const loadedReviewData = await listRecentAdminPhotos(token);
        setReviewData(loadedReviewData);

        if (!loadedReviewData.has_previous_successful_login) {
          setMessage(
            "To wygląda na pierwsze skuteczne logowanie administratora, więc bez poprzedniego okna logowania nie ma jeszcze bezpiecznej listy porównawczej.",
          );
          return;
        }

        setMessage(
          loadedReviewData.photos.length > 0
            ? "Kliknij zdjęcie, aby otworzyć istniejący wspólny widok szczegółów i przejść do moderacji w kontekście."
            : "Nie znaleziono zdjęć dodanych ani zaktualizowanych w tym oknie logowania administratora.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać ostatnio dodanych zdjęć do przeglądu.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadRecentPhotos();
  }, [currentUser?.role, status, token]);

  if (status === "loading" || !currentUser || currentUser.role !== "administrator") {
    return null;
  }

  const photos = reviewData?.photos ?? [];

  return (
    <section className="photo-panel admin-recent-photos-panel">
      <div className="photo-panel__heading">
        <div>
          <p className="eyebrow">Atlas Wspomnień</p>
          <h2>Ostatnio dodane lub zaktualizowane zdjęcia</h2>
        </div>
        <p className="photo-panel__meta">
          {photos.length > 0
            ? `${photos.length} ${photos.length === 1 ? "pozycja" : "pozycji"}`
            : "Brak pozycji do przeglądu."}
        </p>
      </div>

      <p className="photo-panel__meta admin-recent-photos-panel__intro">
        Ta lista korzysta z ostatniej aktywności wpisu. Najpierw bierze `updated_at`, a gdyby go
        brakowało, wraca do `created_at`.
      </p>

      <dl className="photo-detail__meta admin-recent-photos-panel__window">
        <div>
          <dt>Poprzednie skuteczne logowanie</dt>
          <dd>{formatDateTime(reviewData?.previous_successful_login_at ?? null)}</dd>
        </div>
        <div>
          <dt>Ostatnie skuteczne logowanie</dt>
          <dd>{formatDateTime(reviewData?.last_successful_login_at ?? null)}</dd>
        </div>
      </dl>

      <p className="auth-form__message" aria-live="polite" role="status">
        {message}
      </p>

      {isLoading ? <p>Ładowanie ostatnich zdjęć...</p> : null}

      {photos.length === 0 ? null : (
        <div className="admin-recent-photo-list">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`/all_photos/${photo.id}`}
              className="admin-recent-photo-card"
            >
              <div className="admin-recent-photo-card__header">
                <strong>{photo.display_name || photo.location_text}</strong>
                <span className="admin-user-badge">{photo.category.name}</span>
              </div>

              <p className="admin-recent-photo-card__description">
                {photo.description || "Brak opisu zdjęcia."}
              </p>

              <dl className="photo-detail__meta admin-recent-photo-card__meta">
                <div>
                  <dt>ID zdjęcia</dt>
                  <dd>{photo.id}</dd>
                </div>
                <div>
                  <dt>Twórca</dt>
                  <dd>{photo.owner_username}</dd>
                </div>
                <div>
                  <dt>Lokalizacja</dt>
                  <dd>{photo.location_text}</dd>
                </div>
                <div>
                  <dt>Data zdjęcia</dt>
                  <dd>{formatArchiveDate(photo)}</dd>
                </div>
                <div>
                  <dt>Ostatnia aktywność</dt>
                  <dd>{formatDateTime(photo.effective_activity_at)}</dd>
                </div>
              </dl>

              <span className="inline-link">Otwórz wspólny widok szczegółów i moderacji</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
