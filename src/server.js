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

// URL OFICIAL ACTUAL DE SHOP2TOPUP
const BASE_URL =
  "https://shop2topup.com/api/endpoints/v1";

// ======================================================
// PRECIOS
// ======================================================

const PRICING = {
  transfermovil_cup_per_usd: 1000,
  saldo_movil_cup_per_usd: 500,
  mlc_per_usd: 2,

  reference_cost_usd: 0.731179,
  reference_sale_usd: 1.0,
};

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
// PEDIDOS EN MEMORIA
// ======================================================

const ORDERS = new Map();

// ======================================================
// UTILIDADES
// ======================================================

function roundMoney(value, decimals = 2) {
  return Number(Number(value).toFixed(decimals));
}

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

function getProductsWithPrices() {
  const result = {};

  for (
    const [gameKey, game]
    of Object.entries(PRODUCTS)
  ) {
    result[gameKey] = {
      name: game.name,
      slug: game.slug,
      requirements:
        game.requirements,
      packages: {},
    };

    for (
      const [packageKey, product]
      of Object.entries(game.packages)
    ) {
      const prices =
        calculatePrices(product.cost_usd);

      result[gameKey].packages[
        packageKey
      ] = {
        ...product,

        cost_usd:
          Number(product.cost_usd)
            .toFixed(6),

        ...prices,
      };
    }
  }

  return result;
}

// ======================================================
// SHOP2TOPUP CREDENCIALES
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
    data =
      text
        ? JSON.parse(text)
        : {};
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

  // Shop2TopUp utiliza success=false
  // para indicar errores de negocio.
  if (data?.success === false) {
    const error = new Error(
      data?.error?.message ||
      data?.message ||
      "Shop2TopUp rechazó la solicitud."
    );

    error.status = 400;
    error.code =
      data?.error?.code ||
      data?.code ||
      "SHOP2TOPUP_ERROR";

    error.details =
      data;

    throw error;
  }

  return data;
}

// ======================================================
// CUENTA SHOP2TOPUP
// ======================================================
//
// IMPORTANTE:
// GET /account NO crea ninguna orden.
// Solo consulta la cuenta y el saldo.
//

async function getShop2TopupAccount() {
  const data =
    await shop2topupRequest(
      "/account",
      "GET"
    );

  if (data?.success !== true) {
    const error = new Error(
      "Shop2TopUp no confirmó la cuenta."
    );

    error.status = 400;
    error.details = data;

    throw error;
  }

  const account =
    data?.account;

  if (!account) {
    const error = new Error(
      "Shop2TopUp no devolvió información de la cuenta."
    );

    error.status = 502;
    error.details = data;

    throw error;
  }

  const wallet =
    Number(account.wallet);

  if (!Number.isFinite(wallet)) {
    const error = new Error(
      "No se pudo leer correctamente el saldo de Shop2TopUp."
    );

    error.status = 502;
    error.details = data;

    throw error;
  }

  return {
    ...account,
    wallet,
  };
}

// ======================================================
// ERROR
// ======================================================

function sendError(res, error) {
  console.error(
    "SERVER ERROR:",
    error
  );

  res.status(
    error.status || 500
  ).json({
    ok: false,

    error:
      error.message ||
      "Error interno del servidor.",

    code:
      error.code ||
      null,

    details:
      error.details ||
      null,
  });
}

// ======================================================
// AUTORIZACIÓN ADMIN
// ======================================================

function requireAdmin(
  req,
  res,
  next
) {
  if (!ADMIN_SECRET) {
    return res.status(503).json({
      ok: false,

      error:
        "ADMIN_SECRET no está configurado en Render.",
    });
  }

  const suppliedSecret =
    req.headers[
      "x-admin-secret"
    ];

  if (
    !suppliedSecret ||
    suppliedSecret !==
      ADMIN_SECRET
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
// HEALTH
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

      manual_payment:
        true,
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

      manual_payment:
        true,

      base_url:
        BASE_URL,

      pricing:
        PRICING,
    });
  }
);

// ======================================================
// PRODUCTOS
// ======================================================

app.get(
  "/api/products",
  (_req, res) => {
    try {
      res.json({
        ok: true,

        currency: "USD",

        pricing:
          PRICING,

        products:
          getProductsWithPrices(),
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
// COMPROBAR CUENTA SHOP2TOPUP
// ======================================================
//
// ESTA RUTA ES SEGURA.
// NO CREA RECARGAS.
//

app.get(
  "/api/account",
  requireAdmin,
  async (_req, res) => {
    try {
      const account =
        await getShop2TopupAccount();

      res.json({
        ok: true,

        account: {
          id:
            account.id,

          username:
            account.username,

          client_type:
            account.client_type,

          wallet:
            account.wallet,

          enabled:
            account.enabled,

          verified:
            account.verified,
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
            String(game)
              .toLowerCase()
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
// CREAR PEDIDO PENDIENTE
// ======================================================
//
// NO CREA LA RECARGA.
// NO GASTA SALDO SHOP2TOPUP.
//
// Solo registra el pedido para esperar
// el pago manual.
//

app.post(
  "/api/order",
  async (req, res) => {
    try {
      const {
        game,
        package:
          packageKey,

        sub_category_id,

        player_id,

        zone_id,

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

      if (!game) {
        return res.status(400).json({
          ok: false,

          error:
            "game es obligatorio.",
        });
      }

      const gameKey =
        String(game)
          .toLowerCase();

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

      if (
        product.requirements.includes(
          "zone_id"
        ) &&
        !zone_id
      ) {
        return res.status(400).json({
          ok: false,

          error:
            "Zone ID es obligatorio.",
        });
      }

      const prices =
        calculatePrices(
          selected.cost_usd
        );

      const payment =
        payment_method ||
        "transfermovil";

      let saleAmount;

      if (
        payment ===
        "transfermovil"
      ) {
        saleAmount =
          prices.sale_cup_transfermovil;
      } else if (
        payment ===
        "saldo_movil"
      ) {
        saleAmount =
          prices.sale_cup_saldo_movil;
      } else if (
        payment === "mlc"
      ) {
        saleAmount =
          prices.sale_mlc;
      } else {
        return res.status(400).json({
          ok: false,

          error:
            "Método de pago no válido.",
        });
      }

      const orderId =
        crypto.randomUUID();

      const order = {
        order_id:
          orderId,

        status:
          "PENDING_PAYMENT",

        created_at:
          new Date().toISOString(),

        game:
          gameKey,

        game_name:
          product.name,

        package:
          String(packageKey),

        sub_category_id:
          selected.sub_category_id,

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
          payment,

        sale_amount:
          saleAmount,

        sale_prices:
          prices,

        provider_cost_usd:
          Number(
            selected.cost_usd
          ),

        provider_order_id:
          null,

        payment_received:
          false,

        authorized:
          false,

        rejected:
          false,

        recharge_status:
          "NOT_STARTED",
      };

      ORDERS.set(
        orderId,
        order
      );

      console.log(
        "PEDIDO PENDIENTE:",
        order
      );

      res.status(201).json({
        ok: true,

        order: {
          order_id:
            order.order_id,

          status:
            order.status,

          game:
            order.game_name,

          package:
            order.package,

          player_id:
            order.player_id,

          zone_id:
            order.zone_id,

          payment_method:
            order.payment_method,

          sale_amount:
            order.sale_amount,
        },

        message:
          "Pedido creado. Esperando confirmación de pago.",
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
// CONSULTAR PEDIDO PÚBLICO
// ======================================================

app.get(
  "/api/order/:orderId",
  (req, res) => {
    const order =
      ORDERS.get(
        req.params.orderId
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

      order: {
        order_id:
          order.order_id,

        status:
          order.status,

        created_at:
          order.created_at,

        game:
          order.game_name,

        package:
          order.package,

        player_id:
          order.player_id,

        zone_id:
          order.zone_id,

        payment_method:
          order.payment_method,

        sale_amount:
          order.sale_amount,

        payment_received:
          order.payment_received,

        recharge_status:
          order.recharge_status,

        provider_order_id:
          order.provider_order_id,
      },
    });
  }
);

// ======================================================
// ADMIN — LISTAR PEDIDOS
// ======================================================

app.get(
  "/api/admin/orders",
  requireAdmin,
  (_req, res) => {
    const orders =
      Array.from(
        ORDERS.values()
      ).sort(
        (a, b) =>
          new Date(
            b.created_at
          ) -
          new Date(
            a.created_at
          )
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
// ADMIN — VER PEDIDO
// ======================================================

app.get(
  "/api/admin/orders/:orderId",
  requireAdmin,
  (req, res) => {
    const order =
      ORDERS.get(
        req.params.orderId
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
// ADMIN — MARCAR PAGO RECIBIDO
// ======================================================

app.post(
  "/api/admin/orders/:orderId/payment-received",
  requireAdmin,
  (req, res) => {
    const order =
      ORDERS.get(
        req.params.orderId
      );

    if (!order) {
      return res.status(404).json({
        ok: false,

        error:
          "Pedido no encontrado.",
      });
    }

    if (
      order.status !==
      "PENDING_PAYMENT"
    ) {
      return res.status(400).json({
        ok: false,

        error:
          `El pedido no está esperando pago. Estado actual: ${order.status}`,
      });
    }

    order.payment_received =
      true;

    order.status =
      "PAYMENT_RECEIVED";

    order.payment_received_at =
      new Date().toISOString();

    ORDERS.set(
      order.order_id,
      order
    );

    console.log(
      "PAGO CONFIRMADO:",
      order.order_id
    );

    res.json({
      ok: true,

      order,
    });
  }
);

// ======================================================
// ADMIN — AUTORIZAR RECARGA
// ======================================================
//
// MUY IMPORTANTE:
//
// Esta ruta es la única que llama a
// POST /orders/create.
//
// Antes de hacerlo:
// 1. Comprueba el pedido.
// 2. Comprueba que el pago fue recibido.
// 3. Comprueba el producto.
// 4. Consulta el saldo REAL.
// 5. Comprueba que el saldo cubre el costo.
// 6. Guarda el UUID.
// 7. Crea la orden.
// ======================================================

app.post(
  "/api/admin/orders/:orderId/authorize",
  requireAdmin,
  async (req, res) => {
    try {
      const order =
        ORDERS.get(
          req.params.orderId
        );

      if (!order) {
        return res.status(404).json({
          ok: false,

          error:
            "Pedido no encontrado.",
        });
      }

      // Nunca permitir doble autorización
      if (
        order.recharge_status ===
          "SUBMITTED" ||
        order.recharge_status ===
          "PROCESSING" ||
        order.recharge_status ===
          "COMPLETED"
      ) {
        return res.status(400).json({
          ok: false,

          error:
            "Esta recarga ya fue enviada o procesada.",
        });
      }

      if (
        order.status !==
        "PAYMENT_RECEIVED"
      ) {
        return res.status(400).json({
          ok: false,

          error:
            "Primero debes marcar el pago como recibido.",
        });
      }

      const product =
        PRODUCTS[
          order.game
        ];

      if (!product) {
        return res.status(400).json({
          ok: false,

          error:
            "Producto no encontrado.",
        });
      }

      const selected =
        product.packages[
          order.package
        ];

      if (!selected) {
        return res.status(400).json({
          ok: false,

          error:
            "Paquete no encontrado.",
        });
      }

      const providerCost =
        Number(
          selected.cost_usd
        );

      if (
        !Number.isFinite(
          providerCost
        ) ||
        providerCost <= 0
      ) {
        return res.status(400).json({
          ok: false,

          error:
            "Costo del proveedor inválido.",
        });
      }

      // --------------------------------------------------
      // PASO DE SEGURIDAD:
      // CONSULTAR SALDO REAL ANTES DE GASTAR
      // --------------------------------------------------

      console.log(
        "COMPROBANDO SALDO SHOP2TOPUP..."
      );

      const account =
        await getShop2TopupAccount();

      if (
        account.enabled !== true
      ) {
        return res.status(403).json({
          ok: false,

          error:
            "La cuenta de Shop2TopUp no está habilitada.",

          account_enabled:
            account.enabled,
        });
      }

      const balance =
        Number(
          account.wallet
        );

      if (
        balance <
        providerCost
      ) {
        return res.status(400).json({
          ok: false,

          error:
            "Saldo insuficiente en Shop2TopUp.",

          balance:
            balance.toFixed(6),

          required:
            providerCost.toFixed(6),

          missing:
            (
              providerCost -
              balance
            ).toFixed(6),

          currency:
            "USD",

          order_id:
            order.order_id,
        });
      }

      console.log(
        "SALDO SUFICIENTE:",
        {
          balance,
          providerCost,
        }
      );

      // --------------------------------------------------
      // GENERAR Y GUARDAR UUID ANTES DE LLAMAR
      // --------------------------------------------------

      if (
        !order.provider_order_id
      ) {
        order.provider_order_id =
          crypto.randomUUID();

        ORDERS.set(
          order.order_id,
          order
        );
      }

      const providerOrderId =
        order.provider_order_id;

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

      const providerBody = {
        order_id:
          providerOrderId,

        sub_category_id:
          Number(
            selected.sub_category_id
          ),

        quantity: 1,

        requirements,

        expected_unit_price:
          String(
            selected.cost_usd
          ),
      };

      console.log(
        "AUTORIZANDO RECARGA:",
        {
          order_id:
            providerOrderId,

          sub_category_id:
            selected.sub_category_id,

          quantity: 1,

          requirements,

          expected_unit_price:
            selected.cost_usd,
        }
      );

      // --------------------------------------------------
      // MARCAR COMO PROCESSING
      // --------------------------------------------------

      order.authorized =
        true;

      order.status =
        "RECHARGE_PROCESSING";

      order.recharge_status =
        "PROCESSING";

      order.authorized_at =
        new Date().toISOString();

      order.balance_before =
        balance;

      order.provider_cost_usd =
        providerCost;

      ORDERS.set(
        order.order_id,
        order
      );

      // --------------------------------------------------
      // ÚNICA LLAMADA QUE GASTA SALDO
      // --------------------------------------------------

      const providerResponse =
        await shop2topupRequest(
          "/orders/create",
          "POST",
          providerBody
        );

      // --------------------------------------------------
      // RESPUESTA SHOP2TOPUP
      // --------------------------------------------------

      order.provider_response =
        providerResponse;

      order.recharge_status =
        "SUBMITTED";

      order.status =
        "RECHARGE_SUBMITTED";

      order.submitted_at =
        new Date().toISOString();

      ORDERS.set(
        order.order_id,
        order
      );

      console.log(
        "RECARGA ENVIADA A SHOP2TOPUP:",
        order.order_id
      );

      res.json({
        ok: true,

        message:
          "La recarga fue enviada correctamente a Shop2TopUp.",

        order: {
          order_id:
            order.order_id,

          provider_order_id:
            order.provider_order_id,

          status:
            order.status,

          recharge_status:
            order.recharge_status,

          balance_before:
            order.balance_before,

          provider_cost_usd:
            order.provider_cost_usd,
        },
      });
    } catch (error) {
      console.error(
        "ERROR AUTORIZANDO RECARGA:",
        error
      );

      const order =
        ORDERS.get(
          req.params.orderId
        );

      if (order) {
        order.recharge_status =
          "FAILED";

        order.status =
          "RECHARGE_FAILED";

        order.recharge_error =
          error.message;

        order.recharge_error_code =
          error.code ||
          null;

        order.recharge_error_details =
          error.details ||
          null;

        ORDERS.set(
          order.order_id,
          order
        );
      }

      sendError(
        res,
        error
      );
    }
  }
);

// ======================================================
// ADMIN — RECHAZAR PEDIDO
// ======================================================

app.post(
  "/api/admin/orders/:orderId/reject",
  requireAdmin,
  (req, res) => {
    const order =
      ORDERS.get(
        req.params.orderId
      );

    if (!order) {
      return res.status(404).json({
        ok: false,

        error:
          "Pedido no encontrado.",
      });
    }

    if (
      order.status !==
        "PENDING_PAYMENT" &&
      order.status !==
        "PAYMENT_RECEIVED"
    ) {
      return res.status(400).json({
        ok: false,

        error:
          "Este pedido ya no puede ser rechazado.",
      });
    }

    order.rejected =
      true;

    order.status =
      "REJECTED";

    order.rejected_at =
      new Date().toISOString();

    order.rejection_reason =
      req.body?.reason ||
      "Pago no confirmado.";

    ORDERS.set(
      order.order_id,
      order
    );

    res.json({
      ok: true,

      order,
    });
  }
);

// ======================================================
// SHOP2TOPUP — CONSULTAR ORDEN
// ======================================================

app.get(
  "/api/provider/order/:orderId",
  requireAdmin,
  async (req, res) => {
    try {
      const data =
        await shop2topupRequest(
          `/orders/${encodeURIComponent(
            req.params.orderId
          )}`,
          "GET"
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
// INICIAR
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
      "Sistema de pago manual: ACTIVADO"
    );

    console.log(
      "Protección de saldo Shop2TopUp: ACTIVADA"
    );
  }
);