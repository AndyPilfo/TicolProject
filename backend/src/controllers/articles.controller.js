import { z } from "zod";
import { HttpError } from "../utils/httpError.js";
import {
  findArticleById,
  getConstitutionDocument,
  searchArticles
} from "../services/constitution.service.js";

const querySchema = z.object({
  q: z.string().optional(),
  title: z.coerce.number().int().positive().optional(),
  chapter: z.coerce.number().int().positive().optional(),
  article: z.coerce.number().int().positive().optional()
});

export async function listArticles(req, res) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) throw new HttpError(400, "Parámetros inválidos.");

  const constitution = await getConstitutionDocument();
  if (!constitution) {
    return res.json({
      filters: { titles: [] },
      navigation: { titles: [] },
      meta: { total: 0 },
      articles: []
    });
  }

  const result = searchArticles(constitution, parsed.data);
  return res.json({
    filters: { titles: result.catalog },
    navigation: { titles: result.catalog },
    meta: {
      total: result.total,
      titleCount: result.catalog.length
    },
    articles: result.articles
  });
}

export async function getArticle(req, res) {
  const { articleId } = req.params;
  const constitution = await getConstitutionDocument();
  if (!constitution) throw new HttpError(404, "No hay artículos cargados.");

  const article = findArticleById(constitution, articleId);
  if (!article) throw new HttpError(404, "Artículo no encontrado.");

  return res.json({ article });
}
