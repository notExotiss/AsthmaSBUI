import { createPublicKey, verify } from "node:crypto";
import { createServer } from "node:http";

const projectId = process.env.FIREBASE_PROJECT_ID || "asthmaguard-b68c1";
const upstream = process.env.ARDUINO_AIRFLOW_URL || "http://192.168.4.36/airflow";
const port = Number(process.env.AIRFLOW_RELAY_PORT || 8787);
const allowedOrigins = new Set([
  "https://asthmaguard-b68c1.web.app",
  "https://asthmaguard-b68c1.firebaseapp.com",
  "http://localhost:4321",
  "http://localhost:5173",
]);

let signingCertificates = {};
let certificatesExpireAt = 0;

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(value));
}

function addCors(request, response) {
  const origin = request.headers.origin;
  if (origin && !allowedOrigins.has(origin)) return false;
  if (origin) response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization");
  response.setHeader("Access-Control-Max-Age", "600");
  return true;
}

async function getSigningCertificates() {
  if (Date.now() < certificatesExpireAt && Object.keys(signingCertificates).length) return signingCertificates;
  const response = await fetch("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com", {
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load Firebase token verification keys.");
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 300);
  signingCertificates = await response.json();
  certificatesExpireAt = Date.now() + Math.max(60, maxAge) * 1000;
  return signingCertificates;
}

async function verifyFirebaseIdToken(token) {
  const pieces = token.split(".");
  if (pieces.length !== 3) return false;
  let header;
  let claims;
  try {
    header = JSON.parse(Buffer.from(pieces[0], "base64url").toString("utf8"));
    claims = JSON.parse(Buffer.from(pieces[1], "base64url").toString("utf8"));
  } catch { return false; }
  if (header.alg !== "RS256" || typeof header.kid !== "string") return false;
  const now = Math.floor(Date.now() / 1000);
  if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}`) return false;
  if (typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 128) return false;
  if (!Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 60) return false;
  if (!Number.isFinite(claims.auth_time) || claims.auth_time > now + 60) return false;
  const certificates = await getSigningCertificates();
  const certificate = certificates[header.kid];
  if (!certificate) return false;
  const signedContent = Buffer.from(`${pieces[0]}.${pieces[1]}`);
  const signature = Buffer.from(pieces[2], "base64url");
  return verify("RSA-SHA256", signedContent, createPublicKey(certificate), signature);
}

const server = createServer(async (request, response) => {
  if (!addCors(request, response)) return sendJson(response, 403, { error: "Origin not allowed." });
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    return response.end();
  }
  const path = new URL(request.url || "/", "http://relay.local").pathname;
  if (request.method !== "GET" || path !== "/airflow") return sendJson(response, 404, { error: "Not found." });
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return sendJson(response, 401, { error: "Sign in to read the sensor." });
  try {
    if (!(await verifyFirebaseIdToken(token))) return sendJson(response, 401, { error: "Sign in again to read the sensor." });
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);
    return sendJson(response, 503, { error: "Sensor relay could not verify the account." });
  }
  try {
    const sensorResponse = await fetch(upstream, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!sensorResponse.ok) return sendJson(response, 502, { error: `Sensor returned HTTP ${sensorResponse.status}.` });
    const reading = await sensorResponse.json();
    if (![reading.pressure_pa, reading.air_velocity_ms, reading.estimated_flow_lpm]
      .every((value) => typeof value === "number" && Number.isFinite(value))) {
      return sendJson(response, 502, { error: "Sensor returned an unexpected reading." });
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(JSON.stringify(reading));
  } catch (error) {
    console.warn("Arduino airflow request failed:", error.message);
    sendJson(response, 503, { error: "Arduino is not reachable from the relay." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AsthmaGuard airflow relay listening at http://127.0.0.1:${port}`);
  console.log(`Arduino endpoint: ${upstream}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
