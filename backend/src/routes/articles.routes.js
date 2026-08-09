import { Router } from "express";
import { getArticle, listArticles } from "../controllers/articles.controller.js";

export const articlesRouter = Router();

articlesRouter.get("/", listArticles);
articlesRouter.get("/:articleId", getArticle);
