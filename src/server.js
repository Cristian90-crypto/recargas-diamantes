import express from "express";
import crypto from "crypto";

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-FT-API-ID, X-FT-Timestamp, X-FT-Nonce, X-FT-Signature");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const PORT = process.env.PORT || 10000;

const API_ID = process.env.FLASHTOPUP_API_ID;
const API_KEY = process.env.FLASHTOPUP_API_KEY;

const BASE_URL = "https://api.flashtopup.com/api/reseller/v2";

/* =========================
   CORS
========================= */

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

/* =========================
   CREDENCIALES
========================= */

function checkCredentials() {
  if (!API_ID || !API_KEY) {
    const error = new Error(
      "FlashTopup credentials are not configured."
    );

    error.status = 503;

    throw error;
  }
}

/* =========================
   FIRMA FLASHTOPUP
========================= */

function createSignature({
  timestamp,
  nonce,
  method,
  path,
  body,
}) {
  const bodyHash = crypto
    .createHash("sha256")
    .update(body || "")
    .digest("hex");

  const canonical = [
    method.toUpperCase(),
    path,
    timestamp,
    nonce,
    bodyHash,
  ].join("\n");

  return crypto
    .createHmac("sha256", API_KEY)
    .update(canonical)
    .digest("hex");
}

/* =========================
   PETICIÓN A FLASHTOPUP
========================= */

async function flashTopupRequest(
  path,
  method = "GET",
  body = null
) {
  checkCredentials();

  const timestamp = Math.floor(
    Date.now() / 1000
  ).toString();

  const nonce = crypto.randomUUID();

  const serializedBody = body
    ? JSON.stringify(body)
    : "";

  const canonicalPath =
    `${BASE_URL.replace(
      "https://api.flashtopup.com",
      ""
    )}${path.split("?")[0]}`;

  const signature = createSignature({
    timestamp,
    nonce,
    method,
    path: canonicalPath,
    body: serializedBody,
  });

  console.log("FlashTopup request:", {
    method,
    path,
    canonicalPath,
  });

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-FT-API-ID": API_ID,
        "X-FT-Timestamp": timestamp,
        "X-FT-Nonce": nonce,
        "X-FT-Signature": signature,
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

  console.log(
    "FlashTopup HTTP status:",
    response.status
  );

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

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "recargas-diamantes",
  });
});

/* =========================
   PROFILE
========================= */

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
      details: error.details || null,
    });
  }
});

/* =========================
   PRODUCTS
========================= */

app.get("/api/products", async (_req, res) => {
  try {
    const data = await flashTopupRequest(
      "/products",
      "GET"
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup products error:",
      error
    );

    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

/* =========================
   SERVICES
========================= */

app.get("/api/services", async (req, res) => {
  try {
    const {
      product_code,
      product_type = "topup",
    } = req.query;

    if (!product_code) {
      return res.status(400).json({
        ok: false,
        error: "product_code is required",
      });
    }

    const path =
      `/services?product_code=${encodeURIComponent(
        product_code
      )}` +
      `&product_type=${encodeURIComponent(
        product_type
      )}`;

    const data = await flashTopupRequest(
      path,
      "GET"
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup services error:",
      error
    );

    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

/* =========================
   CHECK ID
========================= */

app.post("/api/check-id", async (req, res) => {
  try {
    const {
      validation_code,
      user_id,
      server_id,
    } = req.body;

    if (!validation_code) {
      return res.status(400).json({
        ok: false,
        error: "validation_code is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        error: "user_id is required",
      });
    }

    const body = {
      validation_code,
      user_id: String(user_id).trim(),
    };

    if (server_id) {
      body.server_id = String(server_id).trim();
    }

    console.log(
      "Check ID request:",
      body
    );

    const data = await flashTopupRequest(
      "/check-id",
      "POST",
      body
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup check-id error:",
      error
    );

    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

/* =========================
   CREATE ORDER
========================= */

app.post("/api/order", async (req, res) => {
  try {
    console.log(
      "================================="
    );

    console.log(
      "NUEVO PEDIDO RECIBIDO"
    );

    console.log(
      "Datos recibidos:",
      req.body
    );

    console.log(
      "================================="
    );

    const {
      service_code,
      reference_id,
      quantity = 1,
      user_id,
      server_id,
    } = req.body;

    /* VALIDACIONES */

    if (!service_code) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: "service_code is required",
      });
    }

    if (!reference_id) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: "reference_id is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: "user_id is required",
      });
    }

    const finalQuantity = Number(quantity);

    if (
      !Number.isInteger(finalQuantity) ||
      finalQuantity < 1
    ) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: "quantity must be a positive integer",
      });
    }

    /* CUERPO PARA FLASHTOPUP */

    const body = {
      service_code: String(
        service_code
      ).trim(),

      reference_id: String(
        reference_id
      ).trim(),

      quantity: finalQuantity,

      user_id: String(
        user_id
      ).trim(),
    };

    if (server_id) {
      body.server_id = String(
        server_id
      ).trim();
    }

    console.log(
      "Enviando orden a FlashTopup:",
      body
    );

    /* CREAR ORDEN */

    const data = await flashTopupRequest(
      "/order",
      "POST",
      body
    );

    console.log(
      "Respuesta de FlashTopup:",
      data
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup order error:",
      error
    );

    res.status(error.status || 500).json({
      ok: false,
      success: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

/* =========================
   RUTA NO ENCONTRADA
========================= */

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Route not found",
    path: req.path,
  });
});

/* =========================
   INICIAR SERVIDOR
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Recargas Diamantes API listening on port ${PORT}`
  );

  console.log(
    `PORT: ${PORT}`
  );

  console.log(
    `FlashTopup API ID configured: ${Boolean(API_ID)}`
  );

  console.log(
    `FlashTopup API KEY configured: ${Boolean(API_KEY)}`
  );
});