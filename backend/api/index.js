import { createApp } from "../src/app.js";
import { env } from "../src/config/env.js";
import { connectToDatabase } from "../src/config/db.js";
import { seedConstitutionIfEmpty } from "../src/seed/seedConstitution.js";

let isInitialized = false;

async function ensureInit() {
  if (isInitialized) return;
  await connectToDatabase(env.MONGO_URI);
  await seedConstitutionIfEmpty();
  isInitialized = true;
}

const app = createApp();

export default async function handler(req, res) {
  await ensureInit();
  return app(req, res);
}

