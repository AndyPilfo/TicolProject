import type {
  Article,
  ChatConfig,
  ChatResponse,
  ConversationDto,
  ConversationMessage,
  ConversationSummary,
  TitleNavigation,
  User,
  UserSettings
} from "../types";

type ArticlesResponse = {
  filters: { titles: TitleNavigation[] };
  navigation: { titles: TitleNavigation[] };
  meta: { total: number; titleCount: number };
  articles: Article[];
};

type FavoritesResponse = {
  favorites: Article[];
  favoriteIds: string[];
  favoriteCount: number;
};

type FavoriteMutationResponse = FavoritesResponse & { ok: true };

type AuthResponse = { token: string; user: User };
type SettingsResponse = { settings: UserSettings };
type MeResponse = { user: User };
type LogoutResponse = { ok: true };
type PasswordResponse = { ok: true };
type ChatConfigResponse = { config: ChatConfig };
type ChatResponsePayload = ChatResponse;

type ConversationsResponse = { conversations: ConversationSummary[] };
type ConversationResponse = { conversation: ConversationDto };
type DeleteConversationResponse = { ok: true };

class ApiClient {
  private baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:4000/api";
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  setUnauthorizedHandler(handler: (() => void) | null) {
    this.onUnauthorized = handler;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers as Record<string, string> | undefined)
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    const responseText = await response.text();
    const payload = responseText ? safeJsonParse(responseText) : {};

    if (response.status === 401) {
      clearStoredSession();
      this.token = null;
      this.onUnauthorized?.();
    }

    if (!response.ok) {
      const message = typeof payload?.message === "string" ? payload.message : "Error de red.";
      throw new Error(message);
    }

    return payload as T;
  }

  register(body: { name: string; email: string; password: string }) {
    return this.request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) });
  }

  login(body: { email: string; password: string }) {
    return this.request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) });
  }

  logout() {
    return this.request<LogoutResponse>("/auth/logout", { method: "POST" });
  }

  me() {
    return this.request<MeResponse>("/auth/me");
  }

  changePassword(body: { currentPassword: string; newPassword: string }) {
    return this.request<PasswordResponse>("/auth/password", {
      method: "PUT",
      body: JSON.stringify(body)
    });
  }

  getArticles(params?: { q?: string; title?: number; chapter?: number; article?: number }) {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.title) search.set("title", String(params.title));
    if (params?.chapter) search.set("chapter", String(params.chapter));
    if (params?.article) search.set("article", String(params.article));

    const suffix = search.toString() ? `?${search.toString()}` : "";
    return this.request<ArticlesResponse>(`/articles${suffix}`);
  }

  getArticle(articleId: string) {
    return this.request<{ article: Article }>(`/articles/${articleId}`);
  }

  getFavorites() {
    return this.request<FavoritesResponse>("/favorites");
  }

  addFavorite(articleId: string) {
    return this.request<FavoriteMutationResponse>("/favorites", {
      method: "POST",
      body: JSON.stringify({ articleId })
    });
  }

  deleteFavorite(articleId: string) {
    return this.request<FavoriteMutationResponse>(`/favorites/${articleId}`, { method: "DELETE" });
  }

  getSettings() {
    return this.request<SettingsResponse>("/user/settings");
  }

  updateSettings(partial: Partial<UserSettings>) {
    return this.request<SettingsResponse>("/user/settings", {
      method: "PUT",
      body: JSON.stringify(partial)
    });
  }

  getChatConfig(locale: "es" | "en" = "es") {
    return this.request<ChatConfigResponse>(`/chat/config?locale=${locale}`);
  }

  sendChatMessage(body: {
    message: string;
    conversationId?: string;
    articleId?: string;
    locale?: "es" | "en";
  }) {
    return this.request<ChatResponsePayload>("/chat", {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  listConversations() {
    return this.request<ConversationsResponse>("/conversations");
  }

  createConversation() {
    return this.request<ConversationResponse>("/conversations", { method: "POST", body: JSON.stringify({}) });
  }

  getConversation(conversationId: string) {
    return this.request<ConversationResponse>(`/conversations/${conversationId}`);
  }

  deleteConversation(conversationId: string) {
    return this.request<DeleteConversationResponse>(`/conversations/${conversationId}`, {
      method: "DELETE"
    });
  }

  addConversationMessage(conversationId: string, body: { role: ConversationMessage["role"]; content: string }) {
    return this.request<ConversationResponse>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return { message: value };
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem("lawkey.token");
    localStorage.removeItem("lawkey.user");
  } catch {
    // ignore
  }
}

export const api = new ApiClient();
