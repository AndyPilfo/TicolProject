import { Constitution } from "../models/Constitution.js";

const STOP_WORDS = new Set([
  "a",
  "acerca",
  "al",
  "algo",
  "algunas",
  "algunos",
  "ante",
  "antes",
  "aquel",
  "aquella",
  "aquello",
  "aqui",
  "as",
  "asi",
  "aun",
  "bajo",
  "cual",
  "cuales",
  "cualquier",
  "como",
  "con",
  "contra",
  "cual",
  "cual",
  "cuando",
  "de",
  "del",
  "desde",
  "donde",
  "durante",
  "e",
  "el",
  "ella",
  "ellas",
  "ellos",
  "en",
  "entre",
  "era",
  "eramos",
  "es",
  "esa",
  "esas",
  "ese",
  "eso",
  "esos",
  "esta",
  "estaba",
  "estaban",
  "estamos",
  "estan",
  "estar",
  "este",
  "esto",
  "estos",
  "fue",
  "fueron",
  "ha",
  "haber",
  "hace",
  "hacia",
  "han",
  "hasta",
  "hay",
  "la",
  "las",
  "le",
  "les",
  "lo",
  "los",
  "me",
  "mi",
  "mis",
  "mucho",
  "muy",
  "no",
  "nos",
  "nosotros",
  "o",
  "otra",
  "otro",
  "para",
  "pero",
  "por",
  "porque",
  "que",
  "quien",
  "quienes",
  "se",
  "sin",
  "sobre",
  "su",
  "sus",
  "tambien",
  "tan",
  "te",
  "tiene",
  "tienen",
  "todo",
  "todos",
  "tu",
  "un",
  "una",
  "unas",
  "uno",
  "unos",
  "y"
]);

const CONSTITUTION_KEYWORDS = [
  "constitucion",
  "constitucional",
  "articulo",
  "derecho",
  "derechos",
  "libertad",
  "igualdad",
  "estado",
  "asamblea",
  "legislativa",
  "poder",
  "ejecutivo",
  "judicial",
  "eleccion",
  "sufragio",
  "nacionalidad",
  "ciudadania",
  "ambiente",
  "educacion",
  "trabajo",
  "salud",
  "familia",
  "propiedad",
  "domicilio",
  "intimidad",
  "amparo",
  "habeas",
  "corpus",
  "jurisdiccion",
  "republica",
  "costarricense",
  "costa rica",
  "costarrica"
];

export function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getConstitutionDocument() {
  return Constitution.findOne().lean();
}

export function buildArticleDto({ title, chapter, article }) {
  return {
    id: String(article.number),
    titleNumber: title.number,
    titleName: title.name,
    chapterNumber: chapter.number,
    chapterName: chapter.name,
    articleNumber: article.number,
    text: article.text
  };
}

export function buildCatalog(constitution) {
  return (constitution?.titles ?? []).map((title) => ({
    number: title.number,
    name: title.name,
    chapters: (title.chapters ?? []).map((chapter) => ({
      number: chapter.number,
      name: chapter.name,
      articleCount: chapter.articles?.length ?? 0
    })),
    articleCount: (title.chapters ?? []).reduce((count, chapter) => count + (chapter.articles?.length ?? 0), 0)
  }));
}

export function flattenConstitution(constitution) {
  const articles = [];
  for (const title of constitution?.titles ?? []) {
    for (const chapter of title.chapters ?? []) {
      for (const article of chapter.articles ?? []) {
        articles.push(buildArticleDto({ title, chapter, article }));
      }
    }
  }
  return articles;
}

export function findArticleById(constitution, articleId) {
  if (!articleId) return null;

  const normalizedArticleNumber = Number(articleId);

  for (const title of constitution?.titles ?? []) {
    for (const chapter of title.chapters ?? []) {
      for (const article of chapter.articles ?? []) {
        if (
          (Number.isInteger(normalizedArticleNumber) && Number(article.number) === normalizedArticleNumber) ||
          article._id?.toString?.() === articleId
        ) {
          return buildArticleDto({ title, chapter, article });
        }
      }
    }
  }

  return null;
}

export function findArticleByNumber(constitution, articleNumber) {
  const targetNumber = Number(articleNumber);
  if (!Number.isFinite(targetNumber)) return null;

  for (const title of constitution?.titles ?? []) {
    for (const chapter of title.chapters ?? []) {
      for (const article of chapter.articles ?? []) {
        if (Number(article.number) === targetNumber) {
          return buildArticleDto({ title, chapter, article });
        }
      }
    }
  }

  return null;
}

export function extractArticleNumber(value = "") {
  const normalized = normalizeText(value);
  const match = normalized.match(/\bart(?:iculo)?(?:\s+numero)?\.?\s*(\d{1,3})\b/);
  if (!match) return null;
  return Number(match[1]);
}

function tokenizeQuestion(value = "") {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function scoreArticle(article, normalizedQuestion, tokens, articleNumber) {
  let score = 0;
  const haystack = normalizeText(
    `${article.titleNumber} ${article.titleName} ${article.chapterNumber} ${article.chapterName} articulo ${article.articleNumber} ${article.text}`
  );

  if (articleNumber && Number(article.articleNumber) === Number(articleNumber)) score += 200;
  if (normalizedQuestion.includes(`articulo ${article.articleNumber}`)) score += 120;
  if (normalizedQuestion.includes(`titulo ${article.titleNumber}`)) score += 20;
  if (normalizedQuestion.includes(`capitulo ${article.chapterNumber}`)) score += 16;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += Math.min(18, token.length * 2);
    }
  }

  if (normalizedQuestion && haystack.includes(normalizedQuestion)) score += 30;
  return score;
}

export function searchArticles(constitution, filters = {}) {
  const catalog = buildCatalog(constitution);
  const articles = flattenConstitution(constitution);
  const normalizedNeedle = filters.q ? normalizeText(filters.q) : "";
  const tokens = tokenizeQuestion(filters.q ?? "");
  const articleNumber = filters.article ? Number(filters.article) : undefined;

  const filtered = articles.filter((article) => {
    if (filters.title && article.titleNumber !== Number(filters.title)) return false;
    if (filters.chapter && article.chapterNumber !== Number(filters.chapter)) return false;
    if (articleNumber && article.articleNumber !== articleNumber) return false;
    if (!normalizedNeedle) return true;
    return scoreArticle(article, normalizedNeedle, tokens, articleNumber) > 0;
  });

  const ranked = filtered
    .map((article) => ({
      ...article,
      score: normalizedNeedle ? scoreArticle(article, normalizedNeedle, tokens, articleNumber) : 1
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.titleNumber !== right.titleNumber) return left.titleNumber - right.titleNumber;
      if (left.chapterNumber !== right.chapterNumber) return left.chapterNumber - right.chapterNumber;
      return left.articleNumber - right.articleNumber;
    })
    .map(({ score, ...article }) => article);

  return {
    catalog,
    total: ranked.length,
    articles: ranked
  };
}

export function getRelevantConstitutionArticles(constitution, question, { limit = 3 } = {}) {
  const exactArticleNumber = extractArticleNumber(question);
  if (exactArticleNumber) {
    const exactArticle = findArticleByNumber(constitution, exactArticleNumber);
    if (!exactArticle) {
      return {
        articles: [],
        exactArticleNumber,
        exactArticleMissing: true,
        hasMeaningfulTokens: true
      };
    }

    return {
      articles: [exactArticle],
      exactArticleNumber,
      exactArticleMissing: false,
      hasMeaningfulTokens: true
    };
  }

  const tokens = tokenizeQuestion(question);
  if (!tokens.length) {
    return {
      articles: [],
      exactArticleNumber: null,
      exactArticleMissing: false,
      hasMeaningfulTokens: false
    };
  }

  const normalizedQuestion = normalizeText(question);
  const ranked = flattenConstitution(constitution)
    .map((article) => ({
      article,
      score: scoreArticle(article, normalizedQuestion, tokens, null)
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.article.titleNumber !== right.article.titleNumber) {
        return left.article.titleNumber - right.article.titleNumber;
      }
      if (left.article.chapterNumber !== right.article.chapterNumber) {
        return left.article.chapterNumber - right.article.chapterNumber;
      }
      return left.article.articleNumber - right.article.articleNumber;
    })
    .slice(0, limit)
    .map(({ article }) => article);

  return {
    articles: ranked,
    exactArticleNumber: null,
    exactArticleMissing: false,
    hasMeaningfulTokens: true
  };
}

export function buildArticleContext(articles, locale = "es") {
  if (!articles.length) {
    return locale === "en"
      ? "No matching articles were found."
      : "No encontré artículos constitucionales relacionados.";
  }

  const intro =
    locale === "en"
      ? "Relevant constitutional articles:"
      : "Contexto constitucional relevante:";

  return [
    intro,
    ...articles.map(
      (article) =>
        `Artículo ${article.articleNumber} | Título ${article.titleNumber}: ${article.titleName} | Capítulo ${article.chapterNumber}: ${article.chapterName}\nTexto oficial: ${article.text}`
    )
  ].join("\n\n");
}

export function getArticleExcerpts(articles, locale = "es") {
  return articles.map((article) => ({
    id: article.id,
    titleNumber: article.titleNumber,
    titleName: article.titleName,
    chapterNumber: article.chapterNumber,
    chapterName: article.chapterName,
    articleNumber: article.articleNumber,
    text: article.text,
    excerpt:
      locale === "en"
        ? `Article ${article.articleNumber} from ${article.titleName}`
        : `Artículo ${article.articleNumber} de ${article.titleName}`
  }));
}

export function looksLikeConstitutionQuestion(question = "") {
  const normalized = normalizeText(question);
  if (!normalized) return false;
  if (extractArticleNumber(normalized)) return true;
  return CONSTITUTION_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
