import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "No autenticado." });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, token };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
}
