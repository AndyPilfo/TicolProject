import { HttpError } from "../utils/httpError.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details ?? undefined
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: "Error interno del servidor." });
}
