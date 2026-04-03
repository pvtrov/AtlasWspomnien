"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";

export function AuthStatusCard() {
  const { currentUser, logout, refreshCurrentUser, status } = useAuth();

  if (status === "loading") {
    return (
      <article className="status-card">
        <h2>Authentication</h2>
        <p className="status-value status-value--neutral">Checking</p>
        <p>Frontend is checking whether a valid authenticated session exists.</p>
      </article>
    );
  }

  if (status === "unauthenticated" || currentUser === null) {
    return (
      <article className="status-card">
        <h2>Authentication</h2>
        <p className="status-value status-value--neutral">Logged out</p>
        <p>Use the Sprint 2 auth screens to create an account or sign in.</p>
        <p className="status-card__actions">
          <Link href="/login">Log in</Link>
          <Link href="/register">Register</Link>
        </p>
      </article>
    );
  }

  return (
    <article className="status-card">
      <h2>Authentication</h2>
      <p className="status-value status-value--success">Logged in</p>
      <p>
        Signed in as <strong>{currentUser.username}</strong> ({currentUser.email}
        ).
      </p>
      <p>The protected `GET /api/v1/auth/me` route is used to restore this state.</p>
      <p className="status-card__actions">
        <button className="status-card__button" type="button" onClick={logout}>
          Log out
        </button>
        <button
          className="status-card__button status-card__button--secondary"
          type="button"
          onClick={() => {
            void refreshCurrentUser();
          }}
        >
          Refresh session
        </button>
      </p>
    </article>
  );
}
