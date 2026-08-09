import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/db.js";
import { seedConstitutionIfEmpty } from "./seed/seedConstitution.js";

async function main() {
  await connectToDatabase(env.MONGO_URI);
  await seedConstitutionIfEmpty();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on :${env.PORT}`);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[backend] fatal error:", error);
  process.exit(1);
});

