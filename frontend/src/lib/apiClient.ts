import { Playlist, Song, User } from "@/types";

const ACCESS_TOKEN_KEY = "access_token";

const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  return baseUrl ? baseUrl.replace(/\/+$/, "") : "";
};

const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const setToken = (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const buildHeaders = (init?: HeadersInit) => {
  const headers = new Headers(init);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

const handleUnauthorized = () => {
  clearToken();
  if (window.location.pathname !== "/auth") {
    window.location.href = "/auth";
  }
};

const parseResponse = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not set");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: buildHeaders(options.headers),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    const message =
      (data as { message?: string; error?: string })?.message ||
      (data as { error?: string })?.error ||
      response.statusText ||
      "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
};

const normalizePlaylist = (raw: any): Playlist => {
  return {
    id: raw?.id ?? raw?.playlistId ?? raw?._id ?? raw?.uuid ?? raw?.ID,
    name: raw?.name ?? raw?.title ?? raw?.playlistName ?? raw?.playlist,
    songsCount:
      raw?.songsCount ??
      raw?.songCount ??
      raw?.songs?.length ??
      raw?.count ??
      0,
    ...raw,
  };
};

const normalizeSong = (raw: any): Song => {
  return {
    id: raw?.id ?? raw?.songId ?? raw?._id ?? raw?.uuid ?? raw?.ID,
    band: raw?.band ?? raw?.artist ?? raw?.author ?? "",
    title: raw?.title ?? raw?.name ?? raw?.song ?? "",
    genre: raw?.genre ?? raw?.style ?? "",
    votes: raw?.votes ?? raw?.voteCount ?? raw?.votesCount ?? 0,
    userVoted: raw?.userVoted ?? raw?.hasVoted ?? raw?.voted ?? false,
    ...raw,
  };
};

const normalizeUser = (raw: any): User => {
  return {
    id: raw?.id ?? raw?._id ?? raw?.userId ?? raw?.uuid,
    username: raw?.username ?? raw?.name ?? raw?.login ?? "",
    ...raw,
  };
};

const extractToken = (data: any) => {
  if (!data) return undefined;
  if (typeof data === "string") return data;
  return (
    data.token ||
    data.accessToken ||
    data.access_token ||
    data.jwt ||
    data?.data?.token
  );
};

const unwrapList = (data: any) => {
  if (Array.isArray(data)) return data;
  const list = data?.playlists ?? data?.data ?? data?.items ?? [];
  return Array.isArray(list) ? list : [];
};

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  postForm: <T>(path: string, body: URLSearchParams) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};

export const authApi = {
  register: async (payload: { username: string; password: string }) => {
    const data = await apiClient.post<any>("/auth/register", payload);
    return { token: extractToken(data), data };
  },
  login: async (payload: { username: string; password: string }) => {
    const form = new URLSearchParams();
    form.set("username", payload.username);
    form.set("password", payload.password);
    const data = await apiClient.postForm<any>("/auth/login", form);
    return { token: extractToken(data), data };
  },
  me: async () => {
    const data = await apiClient.get<any>("/auth/me");
    return normalizeUser(data?.user ?? data?.data ?? data);
  },
  logout: async () => {
    await apiClient.post("/auth/logout");
  },
};

export const playlistsApi = {
  list: async (): Promise<Playlist[]> => {
    const data = await apiClient.get<any>("/playlists");
    return unwrapList(data).map(normalizePlaylist);
  },
  create: async (name: string): Promise<Playlist> => {
    const data = await apiClient.post<any>("/playlists", { name });
    return normalizePlaylist(data?.playlist ?? data?.data ?? data);
  },
  details: async (playlistId: string | number) => {
    const data = await apiClient.get<any>(`/playlists?playlistid=${encodeURIComponent(String(playlistId))}`);
    const playlist = normalizePlaylist(data?.playlist ?? data);
    const songs = (data?.songs ?? data?.playlist?.songs ?? data?.data?.songs ?? []).map(normalizeSong);
    return { playlist, songs };
  },
};

export const songsApi = {
  add: async (payload: { band: string; title: string; genre: string; playlistId: string | number }) => {
    const data = await apiClient.post<any>("/songs", payload);
    return normalizeSong(data?.song ?? data?.data ?? data);
  },
  remove: async (songId: string | number) => {
    await apiClient.delete(`/songs/${encodeURIComponent(String(songId))}`);
  },
};

export const votesApi = {
  vote: async (songId: string | number) => {
    await apiClient.post(`/playlists/vote?songid=${encodeURIComponent(String(songId))}`);
  },
  unvote: async (songId: string | number) => {
    await apiClient.delete(`/playlists/unvote?songid=${encodeURIComponent(String(songId))}`);
  },
};

export { ApiError, ACCESS_TOKEN_KEY, clearToken, getToken, setToken };
