import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120),
  email: z.string().trim().email("Debes ingresar un correo válido.").max(254),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(200)
});

const loginSchema = z.object({
  email: z.string().trim().email("Debes ingresar un correo válido.").max(254),
  password: z.string().min(1, "Debes ingresar tu contraseña.").max(200)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Debes ingresar tu contraseña actual."),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres.").max(200)
});

function toUserDto(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    settings: user.settings
  };
}

function signToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN
  });
}

async function issueSession(user) {
  return {
    token: signToken(user._id.toString()),
    user: toUserDto(user)
  };
}

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Datos inválidos.", parsed.error.flatten());

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new HttpError(409, "El correo ya está registrado.");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, passwordHash });

  return res.status(201).json(await issueSession(user));
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Datos inválidos.", parsed.error.flatten());

  const { email, password } = parsed.data;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new HttpError(401, "Credenciales inválidas.");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Credenciales inválidas.");

  return res.json(await issueSession(user));
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(404, "Usuario no encontrado.");
  return res.json({ user: toUserDto(user) });
}

export async function logout(_req, res) {
  return res.json({ ok: true });
}

export async function changePassword(req, res) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Datos inválidos.", parsed.error.flatten());

  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(404, "Usuario no encontrado.");

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) throw new HttpError(401, "La contraseña actual no es correcta.");

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();

  return res.json({ ok: true });
}
