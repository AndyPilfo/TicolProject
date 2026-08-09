import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", FavoriteSchema);

