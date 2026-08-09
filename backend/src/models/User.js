import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    fontSize: { type: String, enum: ["sm", "md", "lg"], default: "md" },
    highContrast: { type: Boolean, default: false },
    language: { type: String, enum: ["es", "en"], default: "es" }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    settings: { type: SettingsSchema, default: () => ({}) },
    favorites: { type: [Number], default: [] }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
