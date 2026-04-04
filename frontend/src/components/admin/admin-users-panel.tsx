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
    "Registered users for moderation will appear here.",
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
            ? "Select one registered user to review or block."
            : "No registered users were returned by the moderation endpoint.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load users.",
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
      setMessage("Choose one user before applying the block action.");
      return;
    }

    if (selectedUser.id === currentUser?.id) {
      setMessage("You cannot block your own account.");
      return;
    }

    if (selectedUser.role !== "creator") {
      setMessage("Only creators can be blocked.");
      return;
    }

    if (selectedUser.is_blocked) {
      setMessage("This creator is already blocked.");
      return;
    }

    const confirmed = window.confirm(
      `Block ${selectedUser.username} from future uploads and metadata edits?`,
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
      setMessage(`Creator ${blockedUser.username} has been blocked.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Blocking the creator failed.",
      );
    } finally {
      setIsBlocking(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="photo-panel">
        <p className="lede">Checking your administrator session...</p>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Sprint 4</p>
        <h1>Administrator users</h1>
        <p className="lede">
          Log in with an administrator account to review registered users and
          block creators when needed.
        </p>
      </section>
    );
  }

  if (currentUser.role !== "administrator") {
    return (
      <section className="photo-panel">
        <p className="eyebrow">Sprint 4</p>
        <h1>Administrator users</h1>
        <p className="lede">
          Administrator access is required for this moderation area.
        </p>
      </section>
    );
  }

  return (
    <section className="admin-workspace">
      <article className="photo-panel">
        <div className="photo-panel__heading">
          <div>
            <p className="eyebrow">Registered users</p>
            <h1>All users</h1>
          </div>
          <p className="photo-panel__meta">
            {users.length > 0
              ? `${users.length} registered user${users.length === 1 ? "" : "s"}`
              : "No users loaded."}
          </p>
        </div>

        <p className="auth-form__message" aria-live="polite">
          {message}
        </p>

        {isLoading ? <p>Loading users...</p> : null}

        {users.length === 0 ? (
          <p className="photo-list__empty">
            User records will appear here when the admin endpoint returns them.
          </p>
        ) : (
          <div className="admin-user-list">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                className={`admin-user-card admin-user-card--button${
                  user.id === selectedUserId ? " admin-user-card--selected" : ""
                }`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <div className="admin-user-card__row">
                  <strong>{user.username}</strong>
                  <span
                    className={`admin-user-badge${
                      user.is_blocked ? " admin-user-badge--blocked" : ""
                    }`}
                  >
                    {user.is_blocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <p>{user.email}</p>
                <p>Role: {user.role}</p>
              </button>
            ))}
          </div>
        )}
      </article>

      <article className="photo-panel">
        {!selectedUser ? (
          <>
            <p className="eyebrow">User detail</p>
            <h2>Select a user</h2>
            <p className="lede">
              Choose one registered user to inspect their role and blocking status.
            </p>
          </>
        ) : (
          <>
            <div className="photo-panel__heading">
              <div>
                <p className="eyebrow">User detail</p>
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
                  ? "Blocking..."
                  : isSelfSelected
                    ? "Cannot block yourself"
                  : selectedUser.is_blocked
                    ? "Creator blocked"
                    : "Block creator"}
              </button>
            </div>

            <dl className="photo-detail__meta">
              <div>
                <dt>User id</dt>
                <dd>{selectedUser.id}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{selectedUser.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{selectedUser.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedUser.is_blocked ? "Blocked" : "Active"}</dd>
              </div>
            </dl>
          </>
        )}
      </article>
    </section>
  );
}
