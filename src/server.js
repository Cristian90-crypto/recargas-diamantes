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

  // FlashTopup requires the COMPLETE canonical path:
  // /api/reseller/v2/...
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

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "recargas-diamantes",
  });
});

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
      details: error.details || undefined,
    });
  }
});

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
      details: error.details || undefined,
    });
  }
});app.post("/api/order", async (req, res) => {
  try {
    const {
      service_code,
      reference_id,
      quantity = 1,
      user_id,
      server_id,
    } = req.body;

    if (!service_code) {
      return res.status(400).json({
        ok: false,
        error: "service_code is required",
      });
    }

    if (!reference_id) {
      return res.status(400).json({
        ok: false,
        error: "reference_id is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        error: "user_id is required",
      });
    }

    const body = {
      service_code,
      reference_id,
      quantity,
      user_id,
    };

    if (server_id) {
      body.server_id = server_id;
    }

    const data = await flashTopupRequest(
      "/order",
      "POST",
      body
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup order error:",
      error
    );

    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.details || undefined,
    });
  }
});
app.post("/api/check-id", async (req, res) => {
  try {
    const {
      validation_code,
      user_id,
      server_id,
    } = req.body;

    if (!validation_code || !user_id) {
      return res.status(400).json({
        ok: false,
        error: "validation_code and user_id are required",
      });
    }

    const body = {
      validation_code,
      user_id,
    };

    if (server_id) {
      body.server_id = server_id;
    }

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
      details: error.details || undefined,
    });
  }
});app.post("/api/order", async (req, res) => {
  try {
    const {
      service_code,
      reference_id,
      quantity = 1,
      user_id,
      server_id,
    } = req.body;

    if (!service_code) {
      return res.status(400).json({
        ok: false,
        error: "service_code is required",
      });
    }

    if (!reference_id) {
      return res.status(400).json({
        ok: false,
        error: "reference_id is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        error: "user_id is required",
      });
    }

    const body = {
      service_code,
      reference_id,
      quantity,
      user_id,
    };

    if (server_id) {
      body.server_id = server_id;
    }

    const data = await flashTopupRequest(
      "/order",
      "POST",
      body
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup order error:",
      error
    );

    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.details || undefined,
    });
  }
});
app.post("/api/order", async (req, res) => {
  try {
    const {
      service_code,
      reference_id,
      quantity = 1,
      user_id,
      server_id,
    } = req.body;

    if (!service_code) {
      return res.status(400).json({
        ok: false,
        error: "service_code is required",
      });
    }

    if (!reference_id) {
      return res.status(400).json({
        ok: false,
        error: "reference_id is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        error: "user_id is required",
      });
    }

    const body = {
      service_code,
      reference_id,
      quantity: Number(quantity),
      user_id,
    };

    if (server_id) {
      body.server_id = server_id;
    }

    const data = await flashTopupRequest(
      "/order",
      "POST",
      body
    );

    res.json(data);
  } catch (error) {
    console.error(
      "FlashTopup order error:",
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