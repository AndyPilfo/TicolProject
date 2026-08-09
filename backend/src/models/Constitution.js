import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true }
  },
  { _id: true }
);

const ChapterSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    name: { type: String, required: true },
    articles: { type: [ArticleSchema], default: [] }
  },
  { _id: false }
);

const TitleSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    name: { type: String, required: true },
    chapters: { type: [ChapterSchema], default: [] }
  },
  { _id: false }
);

const ConstitutionSchema = new mongoose.Schema(
  {
    country: { type: String, default: "Costa Rica" },
    name: { type: String, default: "Constitución Política" },
    versionLabel: { type: String, default: "Datos de muestra" },
    titles: { type: [TitleSchema], default: [] }
  },
  { timestamps: true }
);

export const Constitution = mongoose.model("Constitution", ConstitutionSchema);
