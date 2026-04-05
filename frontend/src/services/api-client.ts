import { getApiBaseUrl } from "@/lib/config";

export type BackendHealthResponse = {
  status: string;
  service: string;
};

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  role: string;
  is_blocked: boolean;
};

export type AdminUser = {
  id: number;
  email: string;
  username: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type PhotoCategory = {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
};

export type Photo = {
  id: number;
  owner_id: number;
  category_id: number;
  description: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  taken_year: number;
  taken_month: number | null;
  taken_day: number | null;
  file_reference?: string | null;
  category: PhotoCategory;
  created_at: string;
  updated_at: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type CurrentUserResponse = {
  user: AuthUser;
};

export type AdminUserResponse = {
  user: AdminUser;
};

export type AdminUserListResponse = {
  users: AdminUser[];
};

export type PhotoUploadRequest = {
  file: File;
  category_slug: string;
  description: string;
  location_text: string;
  latitude?: number;
  longitude?: number;
  taken_year: number;
  taken_month?: number;
  taken_day?: number;
};

export type PhotoUpdateRequest = {
  category_slug: string;
  description: string;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  taken_year: number;
  taken_month?: number;
  taken_day?: number;
};

export type GeocodingResult = {
  latitude: number;
  longitude: number;
  label: string;
};

export type PhotoResponse = {
  photo: Photo;
};

export type PhotoListResponse = {
  photos: Photo[];
};

export type SharedPhotoFilters = {
  query?: string;
  category?: string;
  location?: string;
  taken_year?: number;
  taken_month?: number;
  date_from?: string;
  date_to?: string;
};

export type BackendStatusResult = {
  label: string;
  message: string;
  tone: "neutral" | "success" | "failure";
};

export type BlockCreatorResponse = {
  user: AdminUser;
};

function buildApiUrl(path: string): string {
  const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${apiBaseUrl}${path}`;
}

export function getSharedPhotoImageUrl(photoId: number): string {
  return buildApiUrl(`/api/v1/photos/${photoId}/image`);
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      detail?: string | Array<{ msg?: string }>;
    };

    if (typeof payload.detail === "string" && payload.detail) {
      return payload.detail;
    }

    if (Array.isArray(payload.detail) && payload.detail.length > 0) {
      const firstMessage = payload.detail[0]?.msg;
      if (firstMessage) {
        return firstMessage;
      }
    }

    return `Request failed with HTTP ${response.status}.`;
  } catch {
    return `Request failed with HTTP ${response.status}.`;
  }
}

function buildAuthorizedHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getBackendStatus(
  apiBaseUrl: string,
): Promise<BackendStatusResult> {
  const healthUrl = `${apiBaseUrl.replace(/\/$/, "")}/api/v1/health`;

  try {
    const response = await fetch(healthUrl);

    if (!response.ok) {
      return {
        label: "Unavailable",
        message: `Backend health check failed with HTTP ${response.status}.`,
        tone: "failure",
      };
    }

    const payload = (await response.json()) as BackendHealthResponse;

    if (payload.status === "ok" && payload.service === "backend") {
      return {
        label: "Connected",
        message: "Frontend successfully reached the backend health endpoint.",
        tone: "success",
      };
    }

    return {
      label: "Unexpected response",
      message: "Backend responded, but the health payload did not match expectations.",
      tone: "failure",
    };
  } catch {
    return {
      label: "Unavailable",
      message: "Frontend could not reach the backend health endpoint.",
      tone: "failure",
    };
  }
}

export async function registerUser(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await fetch(buildApiUrl("/api/v1/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as RegisterResponse;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(buildApiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as LoginResponse;
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(buildApiUrl("/api/v1/auth/me"), {
    headers: buildAuthorizedHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as CurrentUserResponse;
  return payload.user;
}

export async function uploadPhoto(
  token: string,
  payload: PhotoUploadRequest,
): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("category_slug", payload.category_slug);
  formData.append("description", payload.description);
  formData.append("location_text", payload.location_text);
  formData.append("taken_year", String(payload.taken_year));

  if (payload.latitude !== undefined) {
    formData.append("latitude", String(payload.latitude));
  }

  if (payload.longitude !== undefined) {
    formData.append("longitude", String(payload.longitude));
  }

  if (payload.taken_month !== undefined) {
    formData.append("taken_month", String(payload.taken_month));
  }

  if (payload.taken_day !== undefined) {
    formData.append("taken_day", String(payload.taken_day));
  }

  const response = await fetch(buildApiUrl("/api/v1/photos"), {
    method: "POST",
    headers: buildAuthorizedHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const responsePayload = (await response.json()) as PhotoResponse;
  return responsePayload.photo;
}

export async function listOwnedPhotos(
  token: string,
  userId: number,
): Promise<Photo[]> {
  const response = await fetch(buildApiUrl(`/api/v1/${userId}/photos`), {
    headers: buildAuthorizedHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as PhotoListResponse;
  return payload.photos;
}

export async function listSharedPhotos(filters: SharedPhotoFilters = {}): Promise<Photo[]> {
  const searchParams = new URLSearchParams();

  if (filters.query) {
    searchParams.set("query", filters.query);
  }

  if (filters.category) {
    searchParams.set("category", filters.category);
  }

  if (filters.location) {
    searchParams.set("location", filters.location);
  }

  if (filters.taken_year !== undefined) {
    searchParams.set("taken_year", String(filters.taken_year));
  }

  if (filters.taken_month !== undefined) {
    searchParams.set("taken_month", String(filters.taken_month));
  }

  if (filters.date_from) {
    searchParams.set("date_from", filters.date_from);
  }

  if (filters.date_to) {
    searchParams.set("date_to", filters.date_to);
  }

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const response = await fetch(buildApiUrl(`/api/v1/photos${suffix}`));

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as PhotoListResponse;
  return payload.photos;
}

export async function getCreatorPhoto(
  token: string,
  photoId: number,
): Promise<Photo> {
  const response = await fetch(buildApiUrl(`/api/v1/photos/${photoId}`), {
    headers: buildAuthorizedHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as PhotoResponse;
  return payload.photo;
}

export async function getSharedPhoto(photoId: number): Promise<Photo> {
  const response = await fetch(buildApiUrl(`/api/v1/photos/${photoId}`));

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as PhotoResponse;
  return payload.photo;
}

export async function updateCreatorPhoto(
  token: string,
  photoId: number,
  payload: PhotoUpdateRequest,
): Promise<Photo> {
  const response = await fetch(buildApiUrl(`/api/v1/photos/${photoId}`), {
    method: "PATCH",
    headers: {
      ...buildAuthorizedHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const responsePayload = (await response.json()) as PhotoResponse;
  return responsePayload.photo;
}

export async function deleteCreatorPhoto(
  token: string,
  photoId: number,
): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/v1/photos/${photoId}`), {
    method: "DELETE",
    headers: buildAuthorizedHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function listAdminUsers(token: string): Promise<AdminUser[]> {
  const response = await fetch(buildApiUrl("/api/v1/admin/users"), {
    headers: buildAuthorizedHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as AdminUserListResponse;
  return payload.users;
}

export async function updateAdminPhoto(
  token: string,
  photoId: number,
  payload: PhotoUpdateRequest,
): Promise<Photo> {
  const response = await fetch(buildApiUrl(`/api/v1/admin/photos/${photoId}`), {
    method: "PATCH",
    headers: {
      ...buildAuthorizedHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const responsePayload = (await response.json()) as PhotoResponse;
  return responsePayload.photo;
}

export async function deleteAdminPhoto(
  token: string,
  photoId: number,
): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/v1/admin/photos/${photoId}`), {
    method: "DELETE",
    headers: buildAuthorizedHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function blockCreator(
  token: string,
  userId: number,
): Promise<AdminUser> {
  const response = await fetch(
    buildApiUrl(`/api/v1/admin/users/${userId}/block`),
    {
      method: "PATCH",
      headers: buildAuthorizedHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as BlockCreatorResponse;
  return payload.user;
}

export async function fetchAdminPhotoImage(
  token: string,
  photoId: number,
): Promise<Blob> {
  const response = await fetch(
    buildApiUrl(`/api/v1/admin/photos/${photoId}/image`),
    {
      headers: buildAuthorizedHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.blob();
}

export async function geocodeLocation(
  locationText: string,
): Promise<GeocodingResult | null> {
  const trimmedLocation = locationText.trim();

  if (!trimmedLocation) {
    return null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", trimmedLocation);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Could not geocode this location.");
  }

  const payload = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  const firstMatch = payload[0];

  if (!firstMatch) {
    return null;
  }

  return {
    latitude: Number(firstMatch.lat),
    longitude: Number(firstMatch.lon),
    label: firstMatch.display_name,
  };
}
