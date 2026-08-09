import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import type { Article } from "../types";
import { useAuth } from "./auth";

type FavoritesContextValue = {
  favorites: Article[];
  favoriteIds: Set<string>;
  loading: boolean;
  error: string | null;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (article: Article) => Promise<void>;
  removeFavorite: (articleId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeTokenRef = useRef(token);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    activeTokenRef.current = token;
    requestVersionRef.current += 1;
  }, [token]);

  const applyServerState = useCallback(
    (response: { favorites: Article[]; favoriteIds: string[] }) => {
      setFavorites(response.favorites);
      setFavoriteIds(new Set(response.favoriteIds));
      setError(null);
    },
    []
  );

  const refreshFavorites = useCallback(async () => {
    if (!token) return;

    const requestedToken = token;
    const requestVersion = ++requestVersionRef.current;
    setLoading(true);
    try {
      const response = await api.getFavorites();
      if (activeTokenRef.current === requestedToken && requestVersionRef.current === requestVersion) {
        applyServerState(response);
      }
    } catch (nextError) {
      if (activeTokenRef.current === requestedToken && requestVersionRef.current === requestVersion) {
        setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar los favoritos.");
      }
      throw nextError;
    } finally {
      if (activeTokenRef.current === requestedToken && requestVersionRef.current === requestVersion) {
        setLoading(false);
      }
    }
  }, [applyServerState, token]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      setError(null);
      return;
    }

    void refreshFavorites().catch(() => undefined);
  }, [ready, refreshFavorites, token]);

  const toggleFavorite = useCallback(
    async (article: Article) => {
      if (!token) return;

      const requestedToken = token;
      const requestVersion = ++requestVersionRef.current;
      const wasFavorite = favoriteIds.has(article.id);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (wasFavorite) next.delete(article.id);
        else next.add(article.id);
        return next;
      });

      try {
        const response = wasFavorite
          ? await api.deleteFavorite(article.id)
          : await api.addFavorite(article.id);
        if (activeTokenRef.current === requestedToken && requestVersionRef.current === requestVersion) {
          applyServerState(response);
        }
      } catch (nextError) {
        if (activeTokenRef.current === requestedToken && requestVersionRef.current === requestVersion) {
          setFavoriteIds((current) => {
            const next = new Set(current);
            if (wasFavorite) next.add(article.id);
            else next.delete(article.id);
            return next;
          });
          setError(nextError instanceof Error ? nextError.message : "No se pudo actualizar el favorito.");
        }
        throw nextError;
      }
    },
    [applyServerState, favoriteIds, token]
  );

  const removeFavorite = useCallback(
    async (articleId: string) => {
      if (!token) return;

      const requestedToken = token;
      const requestVersion = ++requestVersionRef.current;
      try {
        const response = await api.deleteFavorite(articleId);
        if (activeTokenRef.current === requestedToken && requestVersionRef.current === requestVersion) {
          applyServerState(response);
        }
      } catch (nextError) {
        if (activeTokenRef.current === requestedToken && requestVersionRef.current === requestVersion) {
          setError(nextError instanceof Error ? nextError.message : "No se pudo eliminar el favorito.");
        }
        throw nextError;
      }
    },
    [applyServerState, token]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteIds,
      loading,
      error,
      refreshFavorites,
      toggleFavorite,
      removeFavorite
    }),
    [error, favoriteIds, favorites, loading, refreshFavorites, removeFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
