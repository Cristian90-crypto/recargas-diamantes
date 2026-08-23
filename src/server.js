import express from "express";
import crypto from "crypto";
const app = express();
// ======================================================
// CORS
// ======================================================
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Secret"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
const PORT = process.env.PORT || 3000;
const SHOP2TOPUP_API_KEY =
  process.env.SHOP2TOPUP_API_KEY;
const ADMIN_SECRET =
  process.env.ADMIN_SECRET;
const BASE_URL =
  "https://portal.shop2topup.com/api/endpoints/v1";
// ======================================================
// CONFIGURACIÓN DE PRECIOS
// ======================================================
const PRICING = {
  transfermovil_cup_per_usd: 1000,
  saldo_movil_cup_per_usd: 500,
  mlc_per_usd: 2,
  reference_cost_usd: 0.731179,
  reference_sale_usd: 1.0,
};
// ======================================================
// PEDIDOS PENDIENTES
// ======================================================
//
// IMPORTANTE:
//
// Estos pedidos NO se mandan a Shop2TopUp todavía.
//
// Primero quedan pendientes de pago.
//
// Después tú los autorizas manualmente.
//
// ======================================================
const pendingOrders = new Map();
// ======================================================
// REDONDEO
// ======================================================
function roundMoney(value, decimals = 2) {
  return Number(Number(value).toFixed(decimals));
}
// ======================================================
// CÁLCULO DE PRECIOS
// ======================================================
function calculatePrices(costUsd) {
  const cost = Number(costUsd);
  if (!Number.isFinite(cost) || cost <= 0) {
    throw new Error("Costo USD inválido.");
  }
  const pricingFactor =
    PRICING.reference_sale_usd /
    PRICING.reference_cost_usd;
  const saleUsd =
    cost * pricingFactor;
  const saleTransferMovil =
    Math.round(
      saleUsd *
        PRICING.transfermovil_cup_per_usd
    );
  const saleSaldoMovil =
    Math.round(
      saleUsd *
        PRICING.saldo_movil_cup_per_usd
    );
  const saleMlc =
    roundMoney(
      saleUsd *
        PRICING.mlc_per_usd,
      2
    );
  const profitUsd =
    saleUsd - cost;
  const profitPercent =
    (profitUsd / cost) * 100;
  return {
    sale_usd:
      roundMoney(saleUsd, 2),
    sale_cup_transfermovil:
      saleTransferMovil,
    sale_cup_saldo_movil:
      saleSaldoMovil,
    sale_mlc:
      saleMlc,
    profit_usd:
      roundMoney(profitUsd, 2),
    profit_percent:
      roundMoney(profitPercent, 2),
  };
}
// ======================================================
// PRODUCTOS
// ======================================================
const PRODUCTS = {
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
// PRODUCTOS + PRECIOS
// ======================================================
function getProductsWithPrices() {
  const result = {};
  for (const [gameKey, game] of Object.entries(PRODUCTS)) {
    result[gameKey] = {
      name: game.name,
      slug: game.slug,
      requirements: game.requirements,
      packages: {},
    };
    for (const [packageKey, product] of Object.entries(
      game.packages
    )) {
      const prices =
        calculatePrices(product.cost_usd);
      result[gameKey].packages[packageKey] = {
        ...product,
        cost_usd:
          Number(product.cost_usd).toFixed(6),
        sale_usd:
          prices.sale_usd,
        sale_cup_transfermovil:
          prices.sale_cup_transfermovil,
        sale_cup_saldo_movil:
          prices.sale_cup_saldo_movil,
        sale_mlc:
          prices.sale_mlc,
        profit_usd:
          prices.profit_usd,
        profit_percent:
          prices.profit_percent,
      };
    }
  }
  return result;
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
// PETICIONES SHOP2TOPUP
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
    data = JSON.parse(text);
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
// ERRORES
// ======================================================
function sendError(res, error) {
  console.error(
    "ERROR:",
    error
  );
  res.status(
    error.status || 500
  ).json({
    ok: false,
    error: error.message,
    details:
      error.details || null,
  });
}
// ======================================================
// AUTORIZACIÓN ADMINISTRATIVA
// ======================================================
function checkAdmin(req, res, next) {
  if (!ADMIN_SECRET) {
    return res.status(503).json({
      ok: false,
      error:
        "ADMIN_SECRET no está configurado en Render.",
    });
  }
  const suppliedSecret =
    req.headers["x-admin-secret"];
  if (
    !suppliedSecret ||
    suppliedSecret !== ADMIN_SECRET
  ) {
    return res.status(401).json({
      ok: false,
      error:
        "No autorizado.",
    });
  }
  next();
}
// ======================================================
// HEALTH CHECK
// ======================================================
app.get(
  "/health",
  (_req, res) => {
    res.json({
      ok: true,
      service:
        "recargas-diamantes",
      provider:
        "SHOP2TOPUP",
    });
  }
);
// ======================================================
// STATUS
// ======================================================
app.get(
  "/api/status",
  (_req, res) => {
    res.json({
      ok: true,
      service:
        "recargas-diamantes",
      provider:
        "SHOP2TOPUP",
      api_configured:
        Boolean(
          SHOP2TOPUP_API_KEY
        ),
      admin_configured:
        Boolean(
          ADMIN_SECRET
        ),
      base_url:
        BASE_URL,
      pricing: {
        reference_cost_usd:
          PRICING.reference_cost_usd,
        reference_sale_usd:
          PRICING.reference_sale_usd,
        transfermovil_cup_per_usd:
          PRICING
            .transfermovil_cup_per_usd,
        saldo_movil_cup_per_usd:
          PRICING
            .saldo_movil_cup_per_usd,
        mlc_per_usd:
          PRICING.mlc_per_usd,
      },
    });
  }
);
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
// CATÁLOGO
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
        reference_cost_usd:
          PRICING.reference_cost_usd,
        reference_sale_usd:
          PRICING.reference_sale_usd,
        transfermovil_cup_per_usd:
          PRICING
            .transfermovil_cup_per_usd,
        saldo_movil_cup_per_usd:
          PRICING
            .saldo_movil_cup_per_usd,
        mlc_per_usd:
          PRICING.mlc_per_usd,
      },
      products:
        getProductsWithPrices(),
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
    const products =
      getProductsWithPrices();
    const product =
      products[game];
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
        Number(
          sub_category_id
        );
      if (
        !subCategoryId &&
        game
      ) {
        const product =
          PRODUCTS[
            String(
              game
            ).toLowerCase()
          ];
        if (product) {
          const firstPackage =
            Object.values(
              product.packages
            )[0];
          subCategoryId =
            firstPackage
              .sub_category_id;
        }
      }
      if (!subCategoryId) {
        return res.status(400).json({
          ok: false,
          error:
            "sub_category_id es obligatorio para validar el jugador.",
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
// CREAR PEDIDO PENDIENTE
// ======================================================
//
// ESTE ENDPOINT YA NO CREA UNA ORDEN EN SHOP2TOPUP.
//
// Solamente guarda el pedido localmente.
//
// NO DESCUENTA SALDO.
//
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
        payment_method,
        player_name,
      } = req.body;
      if (!player_id) {
        return res.status(400).json({
          ok: false,
          error:
            "player_id es obligatorio.",
        });
      }
      const gameKey =
        String(
          game || ""
        ).toLowerCase();
      const product =
        PRODUCTS[gameKey];
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
      const subCategoryId =
        Number(
          sub_category_id ||
          selected.sub_category_id
        );
      if (!subCategoryId) {
        return res.status(400).json({
          ok: false,
          error:
            "sub_category_id es obligatorio.",
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
      const prices =
        calculatePrices(
          selected.cost_usd
        );
      const orderId =
        `RD-${Date.now()}-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;
      const pendingOrder = {
        order_id:
          orderId,
        status:
          "pending_payment",
        created_at:
          new Date().toISOString(),
        game:
          gameKey,
        game_name:
          product.name,
        package:
          String(packageKey),
        package_info:
          selected,
        sub_category_id:
          subCategoryId,
        quantity:
          numericQuantity,
        requirements,
        player_id:
          String(player_id),
        zone_id:
          zone_id
            ? String(zone_id)
            : "",
        player_name:
          player_name
            ? String(player_name)
            : "",
        payment_method:
          payment_method
            ? String(payment_method)
            : "transfermovil",
        cost_usd:
          Number(
            selected.cost_usd
          ),
        sale_usd:
          prices.sale_usd,
        sale_cup_transfermovil:
          prices.sale_cup_transfermovil,
        sale_cup_saldo_movil:
          prices.sale_cup_saldo_movil,
        sale_mlc:
          prices.sale_mlc,
        profit_usd:
          prices.profit_usd,
        profit_percent:
          prices.profit_percent,
        expected_unit_price:
          expected_unit_price ||
          selected.cost_usd,
        provider_order_id:
          null,
        payment_verified:
          false,
      };
      pendingOrders.set(
        orderId,
        pendingOrder
      );
      console.log(
        "PEDIDO PENDIENTE:",
        JSON.stringify(
          pendingOrder,
          null,
          2
        )
      );
      res.json({
        ok: true,
        data: {
          order_id:
            orderId,
          status:
            "pending_payment",
          payment_verified:
            false,
          message:
            "Pedido creado. Esperando confirmación de pago.",
          order:
            pendingOrder,
        },
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
// CONSULTAR PEDIDO
// ======================================================
//
// Primero busca pedidos locales pendientes.
//
// Si no existe, intenta consultar Shop2TopUp.
//
// ======================================================
app.get(
  "/api/order/:orderId",
  async (req, res) => {
    try {
      const orderId =
        String(
          req.params.orderId
        );
      const localOrder =
        pendingOrders.get(
          orderId
        );
      if (localOrder) {
        return res.json({
          ok: true,
          source:
            "local",
          data:
            localOrder,
        });
      }
      const data =
        await shop2topupRequest(
          `/orders/${encodeURIComponent(
            orderId
          )}`
        );
      res.json({
        ok: true,
        source:
          "shop2topup",
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
// LISTAR PEDIDOS PENDIENTES
// ======================================================
//
// SOLO ADMIN.
//
// ======================================================
app.get(
  "/api/admin/orders",
  checkAdmin,
  (_req, res) => {
    const orders =
      Array.from(
        pendingOrders.values()
      );
    res.json({
      ok: true,
      count:
        orders.length,
      orders,
    });
  }
);
// ======================================================
// VER UN PEDIDO ADMIN
// ======================================================
app.get(
  "/api/admin/orders/:orderId",
  checkAdmin,
  (req, res) => {
    const order =
      pendingOrders.get(
        String(
          req.params.orderId
        )
      );
    if (!order) {
      return res.status(404).json({
        ok: false,
        error:
          "Pedido no encontrado.",
      });
    }
    res.json({
      ok: true,
      order,
    });
  }
);
// ======================================================
// MARCAR PAGO COMO VERIFICADO
// ======================================================
//
// IMPORTANTE:
//
// Esto solamente marca el pedido como pagado.
//
// Todavía NO crea la orden en Shop2TopUp.
//
// Después usamos /approve.
//
// ======================================================
app.post(
  "/api/admin/orders/:orderId/verify-payment",
  checkAdmin,
  (req, res) => {
    const orderId =
      String(
        req.params.orderId
      );
    const order =
      pendingOrders.get(
        orderId
      );
    if (!order) {
      return res.status(404).json({
        ok: false,
        error:
          "Pedido no encontrado.",
      });
    }
    if (
      order.status ===
      "completed"
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "Este pedido ya fue completado.",
      });
    }
    order.payment_verified =
      true;
    order.payment_verified_at =
      new Date().toISOString();
    order.status =
      "payment_verified";
    pendingOrders.set(
      orderId,
      order
    );
    console.log(
      `PAGO VERIFICADO: ${orderId}`
    );
    res.json({
      ok: true,
      message:
        "Pago verificado correctamente.",
      order,
    });
  }
);
// ======================================================
// AUTORIZAR RECARGA
// ======================================================
//
// ESTE ES EL ÚNICO PUNTO EN EL QUE:
//
// 1. Se comprueba que tú verificaste el pago.
// 2. Se crea la orden real en Shop2TopUp.
// 3. Shop2TopUp puede descontar tu saldo.
// 4. Se guarda el ID de Shop2TopUp.
//
// ======================================================
app.post(
  "/api/admin/orders/:orderId/approve",
  checkAdmin,
  async (req, res) => {
    try {
      const orderId =
        String(
          req.params.orderId
        );
      const order =
        pendingOrders.get(
          orderId
        );
      if (!order) {
        return res.status(404).json({
          ok: false,
          error:
            "Pedido no encontrado.",
        });
      }
      if (
        order.status ===
        "completed"
      ) {
        return res.status(400).json({
          ok: false,
          error:
            "Este pedido ya fue procesado.",
        });
      }
      if (
        !order.payment_verified
      ) {
        return res.status(400).json({
          ok: false,
          error:
            "Primero debes verificar el pago.",
        });
      }
      if (
        order.provider_order_id
      ) {
        return res.status(400).json({
          ok: false,
          error:
            "Este pedido ya tiene una orden creada en Shop2TopUp.",
          provider_order_id:
            order.provider_order_id,
        });
      }
      const providerOrderId =
        crypto.randomUUID();
      const requirements = {
        player_id:
          String(
            order.player_id
          ),
      };
      if (
        order.zone_id
      ) {
        requirements.zone_id =
          String(
            order.zone_id
          );
      }
      const body = {
        order_id:
          providerOrderId,
        sub_category_id:
          Number(
            order.sub_category_id
          ),
        quantity:
          Number(
            order.quantity
          ),
        requirements,
        expected_unit_price:
          String(
            order.cost_usd
          ),
      };
      console.log(
        "AUTORIZANDO RECARGA EN SHOP2TOPUP:",
        JSON.stringify(
          body,
          null,
          2
        )
      );
      order.status =
        "sending_to_shop2topup";
      pendingOrders.set(
        orderId,
        order
      );
      const data =
        await shop2topupRequest(
          "/orders/create",
          "POST",
          body
        );
      order.provider_order_id =
        providerOrderId;
      order.provider_response =
        data;
      order.status =
        "submitted";
      order.submitted_at =
        new Date().toISOString();
      pendingOrders.set(
        orderId,
        order
      );
      console.log(
        `RECARGA ENVIADA A SHOP2TOPUP: ${orderId}`
      );
      res.json({
        ok: true,
        message:
          "Recarga enviada correctamente a Shop2TopUp.",
        order,
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
// CANCELAR PEDIDO
// ======================================================
app.post(
  "/api/admin/orders/:orderId/cancel",
  checkAdmin,
  (req, res) => {
    const orderId =
      String(
        req.params.orderId
      );
    const order =
      pendingOrders.get(
        orderId
      );
    if (!order) {
      return res.status(404).json({
        ok: false,
        error:
          "Pedido no encontrado.",
      });
    }
    if (
      order.provider_order_id
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "No puedes cancelar desde aquí un pedido que ya fue enviado a Shop2TopUp.",
      });
    }
    order.status =
      "cancelled";
    order.cancelled_at =
      new Date().toISOString();
    pendingOrders.set(
      orderId,
      order
    );
    res.json({
      ok: true,
      message:
        "Pedido cancelado.",
      order,
    });
  }
);
// ======================================================
// LISTAR ÓRDENES SHOP2TOPUP
// ======================================================
//
// Esta ruta se conserva para consultar
// las órdenes reales del proveedor.
//
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
// WEBHOOK SHOP2TOPUP
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
// RUTA 404
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
      `ADMIN_SECRET: ${
        ADMIN_SECRET
          ? "CONFIGURADO"
          : "NO CONFIGURADO"
      }`
    );
    console.log(
      "PRICING:",
      PRICING
    );
  }
);