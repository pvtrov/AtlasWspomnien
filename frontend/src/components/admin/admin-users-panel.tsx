"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  blockCreator,
  listAdminUsers,
  type AdminUser,
} from "@/services/api-client";

const AUTH_TOKEN_STORAGE_KEY = "aitsi.auth.access_token";

export function AdminUsersPanel() {
  const { currentUser, status } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState(
    "W tym miejscu pojawią się zarejestrowani użytkownicy do przeglądu moderacyjnego.",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }, [status]);

  useEffect(() => {
    async function loadUsers(): Promise<void> {
      if (!token || status !== "authenticated" || currentUser?.role !== "administrator") {
        return;
      }

      setIsLoading(true);

      try {
        const loadedUsers = await listAdminUsers(token);
        setUsers(loadedUsers);
        setSelectedUserId((currentSelectedUserId) => {
          if (
            currentSelectedUserId !== null &&
            loadedUsers.some((user) => user.id === currentSelectedUserId)
          ) {
            return currentSelectedUserId;
          }

          return loadedUsers[0]?.id ?? null;
        });
        setMessage(
          loadedUsers.length > 0
            ? "Wybierz użytkownika, aby sprawdzić jego stan lub go zablokować."
            : "Endpoint moderacyjny nie zwrócił żadnych zarejestrowanych użytkowników.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Nie udało się pobrać użytkowników.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [currentUser?.role, status, token]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const isSelfSelected = selectedUser?.id === currentUser?.id;

  async function handleBlockUser(): Promise<void> {
    if (!token || !selectedUser) {
      setMessage("Wybierz użytkownika przed wykonaniem akcji blokady.");
      return;
    }

    if (selectedUser.id === currentUser?.id) {
      setMessage("Nie możesz zablokować własnego konta.");
      return;
    }

    if (selectedUser.role !== "creator") {
      setMessage("Blokować można tylko twórców.");
      return;
    }

    if (selectedUser.is_blocked) {
      setMessage("Ten twórca jest już zablokowany.");
      return;
    }

    const confirmed = window.confirm(
      `Zablokować użytkownika ${selectedUser.username} przed kolejnymi dodaniami i edycją metadanych?`,
    );
    if (!confirmed) {
      return;
    }

    setIsBlocking(true);

    try {
      const blockedUser = await blockCreator(token, selectedUser.id);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === blockedUser.id ? blockedUser : user)),
      );
      setMessage(`Twórca ${blockedUser.username} został zablokowany.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Nie udało się zablokować twórcy.",
      );
    } finally {
      setIsBlocking(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="photo-panel">
        <p className="lede">Sprawdzanie sesji administratora...</p>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Administracja</p>
        <h1>Użytkownicy administracyjne</h1>
        <p className="lede">
          Zaloguj się kontem administratora, aby przeglądać użytkowników i blokować twórców w razie potrzeby.
        </p>
      </section>
    );
  }

  if (currentUser.role !== "administrator") {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Administracja</p>
        <h1>Użytkownicy administracyjne</h1>
        <p className="lede">Dostęp administratora jest wymagany, aby wejść do tej strefy moderacji.</p>
      </section>
    );
  }

  return (
    <section className="admin-workspace admin-polish-layout">
      <article className="photo-panel admin-polish-layout__list">
        <div className="photo-panel__heading">
          <div>
            <p className="eyebrow">Atlas Wspomnień</p>
            <h1>Moderacja użytkowników</h1>
          </div>
          <p className="photo-panel__meta">
            {users.length > 0
              ? `${users.length} ${users.length === 1 ? "użytkownik" : "użytkowników"}`
              : "Nie wczytano użytkowników."}
          </p>
        </div>

        <p className="auth-form__message" aria-live="polite" role="status">
          {message}
        </p>

        {isLoading ? <p>Ładowanie użytkowników...</p> : null}

        {users.length === 0 ? (
          <p className="photo-list__empty">
            Rekordy użytkowników pojawią się tutaj, gdy zwróci je endpoint administracyjny.
          </p>
        ) : (
          <div className="admin-user-list admin-user-list--polished">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                className={`admin-user-card admin-user-card--button${
                  user.id === selectedUserId ? " admin-user-card--selected" : ""
                }`}
                onClick={() => setSelectedUserId(user.id)}
                aria-pressed={user.id === selectedUserId}
                aria-describedby={`admin-user-card-meta-${user.id}`}
              >
                <div className="admin-user-card__row">
                  <strong>{user.username}</strong>
                  <span
                    className={`admin-user-badge${
                      user.is_blocked ? " admin-user-badge--blocked" : ""
                    }`}
                  >
                    {user.is_blocked ? "Zablokowany" : "Aktywny"}
                  </span>
                </div>
                <p>{user.email}</p>
                <p id={`admin-user-card-meta-${user.id}`}>Rola: {user.role}</p>
              </button>
            ))}
          </div>
        )}
      </article>

      <article className="photo-panel admin-polish-layout__detail">
        {!selectedUser ? (
          <>
            <p className="eyebrow">Szczegóły użytkownika</p>
            <h2>Wybierz użytkownika</h2>
            <p className="lede">
              Wybierz zarejestrowanego użytkownika, aby sprawdzić jego rolę i status blokady.
            </p>
          </>
        ) : (
          <>
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">Szczegóły użytkownika</p>
                <h2>{selectedUser.username}</h2>
              </div>
              <button
                type="button"
                className="button button--secondary"
                onClick={handleBlockUser}
                disabled={
                  isBlocking ||
                  isSelfSelected ||
                  selectedUser.role !== "creator" ||
                  selectedUser.is_blocked
                }
              >
                {isBlocking
                  ? "Blokowanie..."
                  : isSelfSelected
                    ? "Nie możesz zablokować siebie"
                  : selectedUser.is_blocked
                    ? "Twórca zablokowany"
                    : "Zablokuj twórcę"}
              </button>
            </div>

            <p className="photo-panel__meta admin-polish-layout__detail-copy">
              Ta sekcja zachowuje obecny przepływ moderacji, ale porządkuje najważniejsze informacje
              o użytkowniku i akcję blokady w spokojniejszej hierarchii.
            </p>

            <dl className="photo-detail__meta">
              <div>
                <dt>ID użytkownika</dt>
                <dd>{selectedUser.id}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{selectedUser.email}</dd>
              </div>
              <div>
                <dt>Rola</dt>
                <dd>{selectedUser.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedUser.is_blocked ? "Zablokowany" : "Aktywny"}</dd>
              </div>
            </dl>
          </>
        )}
      </article>
    </section>
  );
}
