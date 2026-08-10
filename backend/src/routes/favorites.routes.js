import { Router } from "express";
import { authRequired } from "../middleware/authRequired.js";
import { addFavorite, deleteFavorite, listFavorites } from "../controllers/favorites.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const favoritesRouter = Router();

favoritesRouter.get("/", authRequired, asyncHandler(listFavorites));
favoritesRouter.post("/", authRequired, asyncHandler(addFavorite));
favoritesRouter.delete("/:articleId", authRequired, asyncHandler(deleteFavorite));
