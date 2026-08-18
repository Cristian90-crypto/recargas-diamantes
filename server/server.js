import express from "express";
import crypto from "crypto";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const API_ID = process.env.FLASHTOPUP_API_ID;
const API_KEY = process.env.FLASHTOPUP_API_KEY;

const BASE_URL = "https://api.flashtopup.com/api/reseller/v2";

function checkCredentials() {
  if (!API_ID || !API_KEY) {
    const error = new Error(
      "FlashTopup credentials are not configured."
    );

    error.status = 503;

    throw error;
  }
}

function createSignature({
  timestamp,
  nonce,
  method,
  path,
  body,
}) {
  const payload =
    `${timestamp}${nonce}${method.toUpperCase()}${path}${body || ""}`;

  return crypto
    .createHmac("sha256", API_KEY)
    .update(payload)
    .digest("hex");
}

async function flashTopupRequest(
  path,
  method = "GET",
  body = null
) {
  checkCredentials();

  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();

  const serializedBody = body
    ? JSON.stringify(body)
    : "";

  const signature = createSignature({
    timestamp,
    nonce,
    method,
    path,
    body: serializedBody,
  });

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-ID": API_ID,
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Signature": signature,
      },
      body: serializedBody || undefined,
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    const error = new Error(
      `FlashTopup API returned HTTP ${response.status}`
    );

    error.status = response.status;
    error.details = data;

    throw error;
  }

  return data;
}

/*
  Health check.
  This does not contact FlashTopup.
*/

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "recargas-diamantes",
  });
});

/*
  First FlashTopup test.

  This only checks the reseller profile.
  It does NOT create a recharge order.
*/

app.get("/api/profile", async (_req, res) => {
  try {
    const data = await flashTopupRequest(
      "/profile",
      "GET"
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup profile error:",
      error
    );

    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.details || undefined,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Recargas Diamantes API listening on port ${PORT}`
  );
});