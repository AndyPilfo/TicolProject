import { Router } from "express";
import { getArticle, listArticles } from "../controllers/articles.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const articlesRouter = Router();

articlesRouter.get("/", asyncHandler(listArticles));
articlesRouter.get("/:articleId", asyncHandler(getArticle));
