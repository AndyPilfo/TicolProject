import { z } from "zod";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export async function getSettings(req, res) {
  const user = await User.findById(req.user.id).lean();
  if (!user) throw new HttpError(404, "Usuario no encontrado.");
  return res.json({ settings: user.settings });
}

const updateSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  fontSize: z.enum(["sm", "md", "lg"]).optional(),
  highContrast: z.boolean().optional(),
  language: z.enum(["es", "en"]).optional()
});

export async function updateSettings(req, res) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Datos inválidos.", parsed.error.flatten());

  const updates = {};
  if (parsed.data.theme) updates["settings.theme"] = parsed.data.theme;
  if (parsed.data.fontSize) updates["settings.fontSize"] = parsed.data.fontSize;
  if (typeof parsed.data.highContrast === "boolean") {
    updates["settings.highContrast"] = parsed.data.highContrast;
  }
  if (parsed.data.language) updates["settings.language"] = parsed.data.language;

  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).lean();
  if (!user) throw new HttpError(404, "Usuario no encontrado.");

  return res.json({ settings: user.settings });
}
