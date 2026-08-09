import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import { addFavorite, deleteFavorite, listFavorites } from "../controllers/favorites.controller.js";

export const favoritesRouter = Router();

favoritesRouter.get("/", authRequired, listFavorites);
favoritesRouter.post("/", authRequired, addFavorite);
favoritesRouter.delete("/:articleId", authRequired, deleteFavorite);

