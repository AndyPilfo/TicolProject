import { z } from "zod";
import mongoose from "mongoose";
import { Favorite } from "../models/Favorite.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import {
  findArticleById,
  getConstitutionDocument,
  flattenConstitution
} from "../services/constitution.service.js";

const addSchema = z.object({
  articleId: z.string().trim().min(1).max(24)
});

function assertValidUserId(userId) {
  if (!mongoose.isValidObjectId(userId)) throw new HttpError(404, "Usuario no encontrado.");
  return new mongoose.Types.ObjectId(userId);
}

function getLegacyArticleNumberById(constitution) {
  const articleNumberById = new Map();
  for (const title of constitution?.titles ?? []) {
    for (const chapter of title?.chapters ?? []) {
      for (const article of chapter?.articles ?? []) {
        if (article?._id) articleNumberById.set(article._id.toString(), Number(article.number));
      }
    }
  }
  return articleNumberById;
}

async function initializeFavoritesForExistingUser(userId, constitution) {
  const objectId = assertValidUserId(userId);
  const storedUser = await User.collection.findOne(
    { _id: objectId },
    { projection: { favorites: 1 } }
  );

  if (!storedUser) throw new HttpError(404, "Usuario no encontrado.");
  if (Array.isArray(storedUser.favorites)) return storedUser.favorites;

  const legacyFavorites = await Favorite.find({ userId: objectId }).lean();
  const articleNumberById = getLegacyArticleNumberById(constitution);
  const legacyArticleNumbers = [
    ...new Set(
      legacyFavorites
        .map((favorite) => articleNumberById.get(favorite.articleId.toString()))
        .filter((articleNumber) => Number.isInteger(articleNumber))
    )
  ];

  const initializedUser = await User.findOneAndUpdate(
    { _id: objectId, favorites: { $exists: false } },
    { $set: { favorites: legacyArticleNumbers } },
    { new: true }
  ).lean();

  if (initializedUser) return initializedUser.favorites ?? [];

  const currentUser = await User.findById(objectId).lean();
  if (!currentUser) throw new HttpError(404, "Usuario no encontrado.");
  return currentUser.favorites ?? [];
}

function buildFavoritesPayload(favoriteArticleNumbers, constitution) {
  const articleByNumber = new Map(
    flattenConstitution(constitution).map((article) => [article.articleNumber, article])
  );
  const items = [...favoriteArticleNumbers]
    .reverse()
    .map((articleNumber) => articleByNumber.get(Number(articleNumber)))
    .filter(Boolean);

  return {
    favorites: items,
    favoriteIds: items.map((item) => item.id),
    favoriteCount: items.length
  };
}

async function getFavoritesState(userId, constitution) {
  const favoriteArticleNumbers = await initializeFavoritesForExistingUser(userId, constitution);
  return buildFavoritesPayload(favoriteArticleNumbers, constitution);
}

export async function listFavorites(req, res) {
  const constitution = await getConstitutionDocument();
  const payload = await getFavoritesState(req.user.id, constitution);
  return res.json(payload);
}

export async function addFavorite(req, res) {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Datos inv\u00e1lidos.");

  const constitution = await getConstitutionDocument();
  const article = constitution ? findArticleById(constitution, parsed.data.articleId) : null;
  if (!article) throw new HttpError(404, "Art\u00edculo no encontrado.");

  await initializeFavoritesForExistingUser(req.user.id, constitution);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { favorites: article.articleNumber } },
    { new: true }
  ).lean();
  if (!user) throw new HttpError(404, "Usuario no encontrado.");

  return res.status(201).json({
    ok: true,
    ...buildFavoritesPayload(user.favorites ?? [], constitution)
  });
}

export async function deleteFavorite(req, res) {
  const { articleId } = req.params;
  const constitution = await getConstitutionDocument();
  const article = constitution ? findArticleById(constitution, articleId) : null;
  if (!article) throw new HttpError(404, "Art\u00edculo no encontrado.");

  await initializeFavoritesForExistingUser(req.user.id, constitution);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { favorites: article.articleNumber } },
    { new: true }
  ).lean();
  if (!user) throw new HttpError(404, "Usuario no encontrado.");

  return res.json({
    ok: true,
    ...buildFavoritesPayload(user.favorites ?? [], constitution)
  });
}
