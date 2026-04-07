"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";

export function AuthStatusCard() {
  const { currentUser, logout, refreshCurrentUser, status } = useAuth();

  if (status === "loading") {
    return (
      <article className="status-card">
        <h2>Uwierzytelnienie</h2>
        <p className="status-value status-value--neutral">Sprawdzanie</p>
        <p>Interfejs sprawdza, czy istnieje ważna zalogowana sesja.</p>
      </article>
    );
  }

  if (status === "unauthenticated" || currentUser === null) {
    return (
      <article className="status-card">
        <h2>Uwierzytelnienie</h2>
        <p className="status-value status-value--neutral">Wylogowano</p>
        <p>Skorzystaj z formularzy logowania lub rejestracji, aby wejść do swojego konta.</p>
        <p className="status-card__actions">
          <Link href="/login">Zaloguj się</Link>
          <Link href="/register">Zarejestruj się</Link>
        </p>
      </article>
    );
  }

  return (
    <article className="status-card">
      <h2>Uwierzytelnienie</h2>
      <p className="status-value status-value--success">Zalogowano</p>
      <p>
        Zalogowano jako <strong>{currentUser.username}</strong> ({currentUser.email}
        ).
      </p>
      <p>Do odtworzenia tego stanu aplikacja korzysta z chronionego endpointu `GET /api/v1/auth/me`.</p>
      <p className="status-card__actions">
        <button className="status-card__button" type="button" onClick={logout}>
          Wyloguj
        </button>
        <button
          className="status-card__button status-card__button--secondary"
          type="button"
          onClick={() => {
            void refreshCurrentUser();
          }}
        >
          Odśwież sesję
        </button>
      </p>
    </article>
  );
}
