import express from "express";
import crypto from "crypto";
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const SHOP2TOPUP_API_KEY =
  process.env.SHOP2TOPUP_API_KEY;
const BASE_URL =
  process.env.SHOP2TOPUP_BASE_URL ||
  "https://portal.shop2topup.com/api/endpoints/v1";
// ======================================================
// CONFIGURACIÓN DE PRECIOS
// ======================================================
// Margen sobre el costo de Shop2TopUp.
// 0.25 = 25%
const PROFIT_MARGIN =
  Number(process.env.PROFIT_MARGIN || 0.25);
// Conversión utilizada para mostrar precios al cliente.
const CUP_PER_USD =
  Number(process.env.CUP_PER_USD || 1000);
const MLC_PER_USD =
  Number(process.env.MLC_PER_USD || 2);
// ======================================================
// FUNCIONES DE PRECIOS
// ======================================================
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}
function calculateSalePrice(costUsd) {
  const cost = Number(costUsd);
  if (!Number.isFinite(cost) || cost < 0) {
    return {
      cost_usd: "0.00",
      sale_usd: "0.00",
      profit_usd: "0.00",
      sale_cup: 0,
      sale_mlc: "0.00",
    };
  }
  const saleUsd =
    cost * (1 + PROFIT_MARGIN);
  const profitUsd =
    saleUsd - cost;
  // CUP: redondear hacia arriba a 100 CUP
  const saleCup =
    Math.ceil(
      (saleUsd * CUP_PER_USD) / 100
    ) * 100;
  // MLC: redondear a 0.10
  const saleMlc =
    Math.ceil(
      (saleUsd * MLC_PER_USD) * 10
    ) / 10;
  return {
    cost_usd: cost.toFixed(6),
    sale_usd: saleUsd.toFixed(2),
    profit_usd: profitUsd.toFixed(2),
    sale_cup: saleCup,
    sale_mlc: saleMlc.toFixed(2),
  };
}
// ======================================================
// CONFIGURACIÓN DE PRODUCTOS
// ======================================================
const PRODUCTS = {
  // ====================================================
  // FREE FIRE
  // ====================================================
  freefire: {
    name: "Free Fire",
    slug: "freefire",
    requirements: ["player_id"],
    packages: {
      100: {
        diamonds: 100,
        sub_category_id: 732,
        cost_usd: "0.731179",
      },
      310: {
        diamonds: 310,
        sub_category_id: 733,
        cost_usd: "2.193538",
      },
      520: {
        diamonds: 520,
        sub_category_id: 734,
        cost_usd: "3.704107",
      },
      1060: {
        diamonds: 1060,
        sub_category_id: 735,
        cost_usd: "6.877907",
      },
      2180: {
        diamonds: 2180,
        sub_category_id: 736,
        cost_usd: "13.659394",
      },
      5600: {
        diamonds: 5600,
        sub_category_id: 737,
        cost_usd: "34.759141",
      },
    },
  },
  // ====================================================
  // MOBILE LEGENDS
  // ====================================================
  mobilelegends: {
    name: "Mobile Legends: Bang Bang",
    slug: "mobilelegends",
    requirements: [
      "player_id",
      "zone_id",
    ],
    packages: {
      5: {
        diamonds: 5,
        sub_category_id: 630,
        cost_usd: "0.088384",
      },
      12: {
        diamonds: 12,
        sub_category_id: 631,
        cost_usd: "0.224978",
      },
      19: {
        diamonds: 19,
        sub_category_id: 632,
        cost_usd: "0.353537",
      },
      28: {
        diamonds: 28,
        sub_category_id: 633,
        cost_usd: "0.506202",
      },
      44: {
        diamonds: 44,
        sub_category_id: 634,
        cost_usd: "0.771354",
      },
      59: {
        diamonds: 59,
        sub_category_id: 635,
        cost_usd: "1.020438",
      },
      85: {
        diamonds: 85,
        sub_category_id: 636,
        cost_usd: "1.470393",
      },
      170: {
        diamonds: 170,
        sub_category_id: 637,
        cost_usd: "2.932752",
      },
      240: {
        diamonds: 240,
        sub_category_id: 638,
        cost_usd: "4.146028",
      },
      296: {
        diamonds: 296,
        sub_category_id: 639,
        cost_usd: "5.110220",
      },
      408: {
        diamonds: 408,
        sub_category_id: 640,
        cost_usd: "7.030570",
      },
      568: {
        diamonds: 568,
        sub_category_id: 641,
        cost_usd: "9.585681",
      },
      875: {
        diamonds: 875,
        sub_category_id: 642,
        cost_usd: "14.695901",
      },
      2010: {
        diamonds: 2010,
        sub_category_id: 643,
        cost_usd: "31.954948",
      },
      4830: {
        diamonds: 4830,
        sub_category_id: 644,
        cost_usd: "76.677412",
      },
    },
  },
  // ====================================================
  // PUBG MOBILE
  // ====================================================
  pubg: {
    name: "PUBG Mobile",
    slug: "pubg",
    requirements: ["player_id"],
    packages: {
      10: {
        uc: 10,
        sub_category_id: 12,
        cost_usd: "0.312803",
      },
      60: {
        uc: 60,
        sub_category_id: 13,
        cost_usd: "0.885768",
      },
      325: {
        uc: 325,
        sub_category_id: 14,
        cost_usd: "4.442100",
      },
      660: {
        uc: 660,
        sub_category_id: 15,
        cost_usd: "8.884200",
      },
      1800: {
        uc: 1800,
        sub_category_id: 16,
        cost_usd: "22.210500",
      },
      3850: {
        uc: 3850,
        sub_category_id: 17,
        cost_usd: "44.421000",
      },
      8100: {
        uc: 8100,
        sub_category_id: 18,
        cost_usd: "88.842000",
      },
      16200: {
        uc: 16200,
        sub_category_id: 19,
        cost_usd: "178.744800",
      },
      24300: {
        uc: 24300,
        sub_category_id: 20,
        cost_usd: "268.117200",
      },
      32400: {
        uc: 32400,
        sub_category_id: 21,
        cost_usd: "357.489600",
      },
      40500: {
        uc: 40500,
        sub_category_id: 22,
        cost_usd: "446.862000",
      },
    },
  },
};
// ======================================================
// AGREGAR PRECIOS AUTOMÁTICAMENTE
// ======================================================
for (const game of Object.values(PRODUCTS)) {
  for (const product of Object.values(game.packages)) {
    const prices =
      calculateSalePrice(product.cost_usd);
    Object.assign(product, prices);
  }
}
// ======================================================
// COMPROBAR API KEY
// ======================================================
function checkCredentials() {
  if (!SHOP2TOPUP_API_KEY) {
    const error = new Error(
      "SHOP2TOPUP_API_KEY no está configurada en Render."
    );
    error.status = 503;
    throw error;
  }
}
// ======================================================
// PETICIONES A SHOP2TOPUP
// ======================================================
async function shop2topupRequest(
  path,
  method = "GET",
  body = undefined
) {
  checkCredentials();
  const options = {
    method,
    headers: {
      Accept: "application/json",
      Authorization:
        `Bearer ${SHOP2TOPUP_API_KEY}`,
      "Content-Type":
        "application/json",
    },
  };
  if (body !== undefined) {
    options.body =
      JSON.stringify(body);
  }
  const response =
    await fetch(
      `${BASE_URL}${path}`,
      options
    );
  const text =
    await response.text();
  let data;
  try {
    data =
      JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }
  if (!response.ok) {
    const error = new Error(
      `SHOP2TOPUP API returned HTTP ${response.status}`
    );
    error.status =
      response.status;
    error.details =
      data;
    throw error;
  }
  return data;
}
// ======================================================
// MANEJO DE ERRORES
// ======================================================
function sendError(res, error) {
  console.error(
    "SHOP2TOPUP ERROR:",
    error
  );
  res.status(
    error.status || 500
  ).json({
    ok: false,
    error:
      error.message,
    details:
      error.details || null,
  });
}
// ======================================================
// HEALTH CHECK
// ======================================================
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service:
      "recargas-diamantes",
    provider:
      "SHOP2TOPUP",
    api_configured:
      Boolean(SHOP2TOPUP_API_KEY),
    base_url:
      BASE_URL,
    margin:
      `${PROFIT_MARGIN * 100}%`,
    cup_per_usd:
      CUP_PER_USD,
    mlc_per_usd:
      MLC_PER_USD,
  });
});
// ======================================================
// ESTADO DEL SERVIDOR
// ======================================================
app.get("/api/status", async (_req, res) => {
  res.json({
    ok: true,
    service:
      "recargas-diamantes",
    provider:
      "SHOP2TOPUP",
    api_configured:
      Boolean(SHOP2TOPUP_API_KEY),
    base_url:
      BASE_URL,
    pricing: {
      margin:
        `${PROFIT_MARGIN * 100}%`,
      cup_per_usd:
        CUP_PER_USD,
      mlc_per_usd:
        MLC_PER_USD,
    },
  });
});
// ======================================================
// CUENTA SHOP2TOPUP
// ======================================================
app.get(
  "/api/account",
  async (_req, res) => {
    try {
      const data =
        await shop2topupRequest(
          "/account"
        );
      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
// ======================================================
// CATÁLOGO SHOP2TOPUP
// ======================================================
app.get(
  "/api/catalog/big-categories",
  async (_req, res) => {
    try {
      const data =
        await shop2topupRequest(
          "/catalog/big-categories"
        );
      res.json(data);
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
app.get(
  "/api/catalog/categories",
  async (req, res) => {
    try {
      const query =
        new URLSearchParams();
      if (
        req.query.big_category_id
      ) {
        query.set(
          "big_category_id",
          req.query.big_category_id
        );
      }
      const suffix =
        query.toString()
          ? `?${query.toString()}`
          : "";
      const data =
        await shop2topupRequest(
          `/catalog/categories${suffix}`
        );
      res.json(data);
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
app.get(
  "/api/catalog/subcategories",
  async (req, res) => {
    try {
      const query =
        new URLSearchParams();
      if (
        req.query.category_id
      ) {
        query.set(
          "category_id",
          req.query.category_id
        );
      }
      const suffix =
        query.toString()
          ? `?${query.toString()}`
          : "";
      const data =
        await shop2topupRequest(
          `/catalog/subcategories${suffix}`
        );
      res.json(data);
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
app.get(
  "/api/catalog/subcategory/:itemId/price",
  async (req, res) => {
    try {
      const data =
        await shop2topupRequest(
          `/catalog/subcategory/${encodeURIComponent(
            req.params.itemId
          )}/price`
        );
      res.json(data);
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
app.get(
  "/api/catalog/category/:categoryId/requirements",
  async (req, res) => {
    try {
      const data =
        await shop2topupRequest(
          `/catalog/category/${encodeURIComponent(
            req.params.categoryId
          )}/requirements`
        );
      res.json(data);
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
// ======================================================
// PRODUCTOS DE NUESTRA TIENDA
// ======================================================
app.get(
  "/api/products",
  (_req, res) => {
    res.json({
      ok: true,
      currency: "USD",
      pricing: {
        margin:
          `${PROFIT_MARGIN * 100}%`,
        cup_per_usd:
          CUP_PER_USD,
        mlc_per_usd:
          MLC_PER_USD,
      },
      products:
        PRODUCTS,
    });
  }
);
// ======================================================
// PRODUCTO ESPECÍFICO
// ======================================================
app.get(
  "/api/products/:game/:package",
  (req, res) => {
    const game =
      req.params.game.toLowerCase();
    const packageKey =
      req.params.package;
    const product =
      PRODUCTS[game];
    if (!product) {
      return res.status(404).json({
        ok: false,
        error:
          "Juego no encontrado.",
      });
    }
    const selected =
      product.packages[
        packageKey
      ];
    if (!selected) {
      return res.status(404).json({
        ok: false,
        error:
          "Paquete no encontrado.",
      });
    }
    res.json({
      ok: true,
      game,
      game_name:
        product.name,
      package:
        selected,
    });
  }
);
// ======================================================
// VALIDAR JUGADOR
// ======================================================
app.post(
  "/api/check-id",
  async (req, res) => {
    try {
      const {
        game,
        player_id,
        zone_id,
        sub_category_id,
      } = req.body;
      if (!player_id) {
        return res.status(400).json({
          ok: false,
          error:
            "player_id es obligatorio.",
        });
      }
      let subCategoryId =
        Number(sub_category_id);
      if (
        !subCategoryId &&
        game
      ) {
        const product =
          PRODUCTS[
            String(game).toLowerCase()
          ];
        if (product) {
          const firstPackage =
            Object.values(
              product.packages
            )[0];
          subCategoryId =
            firstPackage.sub_category_id;
        }
      }
      if (!subCategoryId) {
        return res.status(400).json({
          ok: false,
          error:
            "sub_category_id es obligatorio.",
        });
      }
      const body = {
        sub_category_id:
          subCategoryId,
        player_id:
          String(player_id),
      };
      if (
        zone_id !== undefined &&
        zone_id !== ""
      ) {
        body.zone_id =
          String(zone_id);
      }
      const data =
        await shop2topupRequest(
          "/player/validate",
          "POST",
          body
        );
      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
// ======================================================
// CREAR ORDEN
// ======================================================
app.post(
  "/api/order",
  async (req, res) => {
    try {
      const {
        game,
        package: packageKey,
        sub_category_id,
        quantity = 1,
        player_id,
        zone_id,
        expected_unit_price,
        reference_id,
      } = req.body;
      if (!player_id) {
        return res.status(400).json({
          ok: false,
          error:
            "player_id es obligatorio.",
        });
      }
      let subCategoryId =
        Number(sub_category_id);
      let expectedPrice =
        expected_unit_price;
      if (
        !subCategoryId &&
        game &&
        packageKey
      ) {
        const product =
          PRODUCTS[
            String(game).toLowerCase()
          ];
        if (!product) {
          return res.status(400).json({
            ok: false,
            error:
              "Juego no válido.",
          });
        }
        const selected =
          product.packages[
            String(packageKey)
          ];
        if (!selected) {
          return res.status(400).json({
            ok: false,
            error:
              "Paquete no válido.",
          });
        }
        subCategoryId =
          selected.sub_category_id;
        if (
          expectedPrice ===
            undefined ||
          expectedPrice ===
            null ||
          expectedPrice === ""
        ) {
          expectedPrice =
            selected.cost_usd;
        }
      }
      if (!subCategoryId) {
        return res.status(400).json({
          ok: false,
          error:
            "sub_category_id es obligatorio.",
        });
      }
      const numericQuantity =
        Number(quantity);
      if (
        !Number.isInteger(
          numericQuantity
        ) ||
        numericQuantity <= 0
      ) {
        return res.status(400).json({
          ok: false,
          error:
            "quantity debe ser un número entero mayor que 0.",
        });
      }
      const requirements = {
        player_id:
          String(player_id),
      };
      if (
        zone_id !== undefined &&
        zone_id !== ""
      ) {
        requirements.zone_id =
          String(zone_id);
      }
      const orderId =
        reference_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          .test(
            String(reference_id)
          )
          ? String(reference_id)
          : crypto.randomUUID();
      const body = {
        order_id:
          orderId,
        sub_category_id:
          subCategoryId,
        quantity:
          numericQuantity,
        requirements,
      };
      // IMPORTANTÍSIMO:
      // Aquí usamos el COSTO de Shop2TopUp
      // para proteger la compra.
      if (
        expectedPrice !==
          undefined &&
        expectedPrice !==
          null &&
        expectedPrice !== ""
      ) {
        body.expected_unit_price =
          String(expectedPrice);
      }
      console.log(
        "Creating SHOP2TOPUP order:",
        body
      );
      const data =
        await shop2topupRequest(
          "/orders/create",
          "POST",
          body
        );
      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
// ======================================================
// CONSULTAR ORDEN
// ======================================================
app.get(
  "/api/order/:orderId",
  async (req, res) => {
    try {
      const data =
        await shop2topupRequest(
          `/orders/${encodeURIComponent(
            req.params.orderId
          )}`
        );
      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
// ======================================================
// LISTAR ÓRDENES
// ======================================================
app.get(
  "/api/orders",
  async (_req, res) => {
    try {
      const data =
        await shop2topupRequest(
          "/orders"
        );
      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
// ======================================================
// CONSULTAR VARIAS ÓRDENES
// ======================================================
app.post(
  "/api/orders/batch",
  async (req, res) => {
    try {
      const {
        order_ids,
      } = req.body;
      if (
        !Array.isArray(
          order_ids
        ) ||
        order_ids.length === 0
      ) {
        return res.status(400).json({
          ok: false,
          error:
            "order_ids debe ser un arreglo con al menos un ID.",
        });
      }
      const data =
        await shop2topupRequest(
          "/orders/batch",
          "POST",
          {
            order_ids,
          }
        );
      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);
// ======================================================
// WEBHOOK
// ======================================================
app.post(
  "/api/webhook/shop2topup",
  (req, res) => {
    console.log(
      "SHOP2TOPUP WEBHOOK:",
      JSON.stringify(
        req.body,
        null,
        2
      )
    );
    res.status(200).json({
      ok: true,
      received: true,
    });
  }
);
// ======================================================
// 404
// ======================================================
app.use(
  (_req, res) => {
    res.status(404).json({
      ok: false,
      error:
        "Ruta no encontrada.",
    });
  }
);
// ======================================================
// INICIAR SERVIDOR
// ======================================================
app.listen(
  PORT,
  () => {
    console.log(
      `Recargas Diamantes API listening on port ${PORT}`
    );
    console.log(
      `SHOP2TOPUP API: ${BASE_URL}`
    );
    console.log(
      `SHOP2TOPUP_API_KEY: ${
        SHOP2TOPUP_API_KEY
          ? "CONFIGURADA"
          : "NO CONFIGURADA"
      }`
    );
    console.log(
      `Margen: ${PROFIT_MARGIN * 100}%`
    );
    console.log(
      `CUP/USD: ${CUP_PER_USD}`
    );
    console.log(
      `MLC/USD: ${MLC_PER_USD}`
    );
  }
);