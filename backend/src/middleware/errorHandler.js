import { HttpError } from "../utils/httpError.js";

export function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const providedStatusCode = Number(err?.statusCode);
  const statusCode =
    Number.isInteger(providedStatusCode) && providedStatusCode >= 400 && providedStatusCode <= 599
      ? providedStatusCode
      : 500;

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const isExpectedError = err instanceof HttpError || statusCode < 500;
  return res.status(statusCode).json({
    message: isExpectedError && err?.message ? err.message : "Error interno del servidor.",
    details: isExpectedError ? err?.details ?? undefined : undefined
  });
}
