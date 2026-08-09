import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  // If you deploy to a managed MongoDB (e.g. Atlas), provide MONGO_URI directly.
  MONGO_URI: z.string().min(1).optional(),
  // Docker/local fallback:
  MONGO_HOST: z.string().min(1).optional(),
  MONGO_PORT: z.coerce.number().int().positive().default(27017),
  MONGO_DB: z.string().min(1).optional(),
  MONGO_USER: z.string().min(1).optional(),
  MONGO_PASS: z.string().min(1).optional(),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),

  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),

  APP_BRAND_NAME: z.string().min(1).default("TICOL"),

  AI_PROVIDER: z.enum(["local", "openai"]).default("local"),
  AI_API_KEY: z.string().min(1).optional(),
  AI_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  AI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  AI_MAX_TOKENS: z.coerce.number().int().positive().default(700),

  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().min(1).optional(),
  GROQ_MAX_TOKENS: z.coerce.number().int().positive().default(700),
  GROQ_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),
  GROQ_TIMEOUT_MS: z.coerce.number().int().positive().default(12000)
}).superRefine((val, ctx) => {
  if (val.MONGO_URI) return;
  const required = ["MONGO_HOST", "MONGO_DB", "MONGO_USER", "MONGO_PASS"];
  for (const k of required) {
    if (!val[k]) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${k} es requerido si no se define MONGO_URI.` });
  }
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  MONGO_URI:
    raw.MONGO_URI ??
    `mongodb://${encodeURIComponent(raw.MONGO_USER)}:${encodeURIComponent(raw.MONGO_PASS)}@${
      raw.MONGO_HOST
    }:${raw.MONGO_PORT}/${raw.MONGO_DB}?authSource=admin`
};
