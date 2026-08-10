import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import bcrypt from "bcryptjs";
import { errorHandler } from "../src/middleware/errorHandler.js";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/ticol-test";
process.env.JWT_SECRET = "test-secret-at-least-16-characters";
process.env.CLIENT_ORIGIN = "http://localhost:5173";

const [{ createApp }, { User }] = await Promise.all([
  import("../src/app.js"),
  import("../src/models/User.js")
]);

let baseUrl;
let originalFindOne;
let server;

before(async () => {
  originalFindOne = User.findOne;
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  User.findOne = originalFindOne;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function assertBackendStillResponds() {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
}

test("login inválido responde 401 y el backend continúa funcionando", async () => {
  User.findOne = async () => ({
    _id: "507f1f77bcf86cd799439011",
    passwordHash: await bcrypt.hash("contraseña-correcta", 4)
  });

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "persona@example.com", password: "contraseña-incorrecta" })
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Credenciales inválidas." });
  await assertBackendStillResponds();
});

test("registro duplicado responde 409 y el backend continúa funcionando", async () => {
  User.findOne = async () => ({ _id: "507f1f77bcf86cd799439011" });

  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Persona de prueba",
      email: "persona@example.com",
      password: "contraseña-segura"
    })
  });

  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { message: "El correo ya está registrado." });
  await assertBackendStillResponds();
});

test("endpoint protegido sin token responde 401 y el backend continúa funcionando", async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "No autenticado." });
  await assertBackendStillResponds();
});

test("un error inesperado se registra y responde 500 sin lanzar otra excepción", async () => {
  const error = new Error("fallo interno de prueba");
  const originalConsoleError = console.error;
  let loggedError;
  let responseStatus;
  let responseBody;

  console.error = (receivedError) => {
    loggedError = receivedError;
  };

  try {
    const response = {
      headersSent: false,
      status(statusCode) {
        responseStatus = statusCode;
        return this;
      },
      json(body) {
        responseBody = body;
        return this;
      }
    };

    errorHandler(error, {}, response, () => assert.fail("No debía delegar el error"));
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(responseStatus, 500);
  assert.deepEqual(responseBody, { message: "Error interno del servidor.", details: undefined });
  assert.equal(loggedError, error);
  await assertBackendStillResponds();
});
