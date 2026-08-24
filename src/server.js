import express from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const app = express();

// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

const PORT = process.env.PORT || 3000;

const SHOP2TOPUP_API_KEY =
  process.env.SHOP2TOPUP_API_KEY;

const ADMIN_SECRET =
  process.env.ADMIN_SECRET;

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const BASE_URL =
  "https://shop2topup.com/api/endpoints/v1";

// ======================================================
// CORS
// ======================================================

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "*"
  );

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

// ======================================================
// SUPABASE
// ======================================================

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY
) {
  console.warn(
    "ADVERTENCIA: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas."
  );
}

const supabase =
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    : null;

// ======================================================
// PRECIOS
// ======================================================

const PRICING = {
  transfermovil_cup_per_usd: 1000,
  saldo_movil_cup_per_usd: 500,
  mlc_per_usd: 2,

  reference_cost_usd: 0.731179,
  reference_sale_usd: 1,
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
// UTILIDADES
// ======================================================

function roundMoney(
  value,
  decimals = 2
) {
  return Number(
    Number(value).toFixed(decimals)
  );
}

function calculatePrices(costUsd) {
  const cost = Number(costUsd);

  if (
    !Number.isFinite(cost) ||
    cost <= 0
  ) {
    throw new Error(
      "Costo USD inválido."
    );
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
      roundMoney(
        profitPercent,
        2
      ),
  };
}

function getProductsWithPrices() {
  const result = {};

  for (
    const [
      gameKey,
      game,
    ] of Object.entries(PRODUCTS)
  ) {
    result[gameKey] = {
      name: game.name,
      slug: game.slug,
      requirements:
        game.requirements,
      packages: {},
    };

    for (
      const [
        packageKey,
        product,
      ] of Object.entries(
        game.packages
      )
    ) {
      const prices =
        calculatePrices(
          product.cost_usd
        );

      result[
        gameKey
      ].packages[
        packageKey
      ] = {
        ...product,

        cost_usd:
          Number(
            product.cost_usd
          ).toFixed(6),

        ...prices,
      };
    }
  }

  return result;
}

// ======================================================
// VALIDACIONES
// ======================================================

function cleanString(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

function isValidGame(game) {
  return Boolean(
    PRODUCTS[
      cleanString(game).toLowerCase()
    ]
  );
}

function getProduct(
  game
) {
  return PRODUCTS[
    cleanString(game).toLowerCase()
  ];
}

// ======================================================
// SUPABASE — CONFIGURACIÓN
// ======================================================

function checkSupabase() {
  if (!supabase) {
    const error =
      new Error(
        "Supabase no está configurado correctamente en Render."
      );

    error.status = 503;

    throw error;
  }
}

// ======================================================
// SUPABASE — GUARDAR PEDIDO
// ======================================================

async function saveOrder(order) {
  checkSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .upsert(
      {
        order_id:
          order.order_id,

        status:
          order.status,

        created_at:
          order.created_at,

        order_data:
          order,
      },
      {
        onConflict:
          "order_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error(
      "SUPABASE SAVE ERROR:",
      error
    );

    const supabaseError =
      new Error(
        `No se pudo guardar el pedido en Supabase: ${error.message}`
      );

    supabaseError.status =
      500;

    supabaseError.details =
      error;

    throw supabaseError;
  }

  return data;
}

// ======================================================
// SUPABASE — OBTENER PEDIDO
// ======================================================

async function getOrder(orderId) {
  checkSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(
      "order_id,status,created_at,order_data"
    )
    .eq(
      "order_id",
      orderId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "SUPABASE GET ORDER ERROR:",
      error
    );

    const supabaseError =
      new Error(
        `No se pudo consultar el pedido: ${error.message}`
      );

    supabaseError.status =
      500;

    supabaseError.details =
      error;

    throw supabaseError;
  }

  if (!data) {
    return null;
  }

  const orderData =
    data.order_data &&
    typeof data.order_data ===
      "object"
      ? data.order_data
      : {};

  return {
    ...orderData,

    order_id:
      data.order_id,

    status:
      data.status,

    created_at:
      data.created_at,
  };
}

// ======================================================
// SUPABASE — LISTAR PEDIDOS
// ======================================================

async function getOrders() {
  checkSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(
      "order_id,status,created_at,order_data"
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      }
    );

  if (error) {
    console.error(
      "SUPABASE LIST ORDERS ERROR:",
      error
    );

    const supabaseError =
      new Error(
        `No se pudieron consultar los pedidos: ${error.message}`
      );

    supabaseError.status =
      500;

    supabaseError.details =
      error;

    throw supabaseError;
  }

  return (
    data || []
  ).map(
    (row) => ({
      ...(row.order_data ||
        {}),

      order_id:
        row.order_id,

      status:
        row.status,

      created_at:
        row.created_at,
    })
  );
}

// ======================================================
// SHOP2TOPUP — CREDENCIALES
// ======================================================

function checkCredentials() {
  if (!SHOP2TOPUP_API_KEY) {
    const error =
      new Error(
        "SHOP2TOPUP_API_KEY no está configurada en Render."
      );

    error.status = 503;

    throw error;
  }
}

// ======================================================
// SHOP2TOPUP — PETICIÓN
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
      Accept:
        "application/json",

      Authorization:
        `Bearer ${SHOP2TOPUP_API_KEY}`,

      "Content-Type":
        "application/json",
    },
  };

  if (
    body !== undefined
  ) {
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

  if (
    !response.ok
  ) {
    const error =
      new Error(
        `SHOP2TOPUP API returned HTTP ${response.status}`
      );

    error.status =
      response.status;

    error.details =
      data;

    throw error;
  }

  if (
    data &&
    data.success === false
  ) {
    const error =
      new Error(
        data?.error?.message ||
          "SHOP2TOPUP devolvió un error."
      );

    error.status =
      response.status ||
      400;

    error.details =
      data;

    throw error;
  }

  return data;
}

// ======================================================
// EXTRAER SALDO SHOP2TOPUP
// ======================================================

function extractShop2TopupBalance(
  data
) {
  const possibleValues = [
    data?.account?.wallet,
    data?.account?.balance,
    data?.account?.available_balance,
    data?.account?.availableBalance,

    data?.wallet,
    data?.balance,
    data?.available_balance,
    data?.availableBalance,

    data?.data?.account?.wallet,
    data?.data?.account?.balance,
    data?.data?.account?.available_balance,
    data?.data?.account?.availableBalance,

    data?.data?.wallet,
    data?.data?.balance,
    data?.data?.available_balance,
    data?.data?.availableBalance,
  ];

  for (
    const value of
      possibleValues
  ) {
    if (
      value !==
        undefined &&
      value !== null &&
      value !== ""
    ) {
      const numeric =
        Number(value);

      if (
        Number.isFinite(
          numeric
        ) &&
        numeric >= 0
      ) {
        return numeric;
      }
    }
  }

  function searchObject(
    object,
    depth = 0
  ) {
    if (
      !object ||
      typeof object !==
        "object" ||
      depth > 6
    ) {
      return null;
    }

    for (
      const [
        key,
        value,
      ] of Object.entries(
        object
      )
    ) {
      const normalized =
        key
          .toLowerCase()
          .replace(
            /[-_\s]/g,
            ""
          );

      if (
        [
          "balance",
          "availablebalance",
          "walletbalance",
          "wallet",
          "credit",
        ].includes(
          normalized
        )
      ) {
        const numeric =
          Number(value);

        if (
          Number.isFinite(
            numeric
          ) &&
          numeric >= 0
        ) {
          return numeric;
        }
      }

      if (
        value &&
        typeof value ===
          "object"
      ) {
        const nested =
          searchObject(
            value,
            depth + 1
          );

        if (
          nested !== null
        ) {
          return nested;
        }
      }
    }

    return null;
  }

  return searchObject(data);
}

// ======================================================
// SHOP2TOPUP — CUENTA
// ======================================================

async function getShop2TopupAccount() {
  const data =
    await shop2topupRequest(
      "/account",
      "GET"
    );

  const balance =
    extractShop2TopupBalance(
      data
    );

  return {
    data,
    balance,
  };
}

// ======================================================
// ERROR HANDLER
// ======================================================

function sendError(
  res,
  error
) {
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

    details:
      error.details ||
      null,
  });
}

// ======================================================
// ADMIN AUTH
// ======================================================

function requireAdmin(
  req,
  res,
  next
) {
  if (!ADMIN_SECRET) {
    return res
      .status(503)
      .json({
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
    !suppliedSecret
  ) {
    return res
      .status(401)
      .json({
        ok: false,
        error:
          "No autorizado.",
      });
  }

  const suppliedBuffer =
    Buffer.from(
      String(
        suppliedSecret
      )
    );

  const expectedBuffer =
    Buffer.from(
      String(
        ADMIN_SECRET
      )
    );

  if (
    suppliedBuffer.length !==
    expectedBuffer.length
  ) {
    return res
      .status(401)
      .json({
        ok: false,
        error:
          "No autorizado.",
      });
  }

  const valid =
    crypto.timingSafeEqual(
      suppliedBuffer,
      expectedBuffer
    );

  if (!valid) {
    return res
      .status(401)
      .json({
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

      supabase_configured:
        Boolean(
          supabase
        ),
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

      supabase_configured:
        Boolean(
          supabase
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

        currency:
          "USD",

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
// ADMIN — SALDO
// ======================================================

app.get(
  "/api/admin/balance",
  requireAdmin,
  async (_req, res) => {
    try {
      const account =
        await getShop2TopupAccount();

      if (
        account.balance ===
        null
      ) {
        return res
          .status(502)
          .json({
            ok: false,

            error:
              "Shop2TopUp respondió correctamente, pero no se pudo identificar automáticamente el saldo.",

            provider_response:
              account.data,
          });
      }

      res.json({
        ok: true,

        balance:
          account.balance,

        currency:
          "USD",

        account:
          account.data?.account
            ? {
                id:
                  account.data
                    .account
                    .id,

                username:
                  account.data
                    .account
                    .username,

                enabled:
                  account.data
                    .account
                    .enabled,

                verified:
                  account.data
                    .account
                    .verified,
              }
            : null,
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
      } = req.body || {};

      const playerId =
        cleanString(
          player_id
        );

      if (!playerId) {
        return res
          .status(400)
          .json({
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
          getProduct(
            game
          );

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

      if (
        !Number.isFinite(
          subCategoryId
        ) ||
        subCategoryId <= 0
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "sub_category_id es obligatorio.",
          });
      }

      const body = {
        sub_category_id:
          subCategoryId,

        player_id:
          playerId,
      };

      if (
        zone_id !==
          undefined &&
        zone_id !== ""
      ) {
        body.zone_id =
          cleanString(
            zone_id
          );
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
// CREAR PEDIDO
// ======================================================

app.post(
  "/api/order",
  async (req, res) => {
    try {
      const {
        game,
        package:
          packageKey,
        player_id,
        zone_id,
        payment_method,
        player_name,
      } = req.body || {};

      const playerId =
        cleanString(
          player_id
        );

      const gameKey =
        cleanString(
          game
        ).toLowerCase();

      const zoneId =
        cleanString(
          zone_id
        );

      const payment =
        cleanString(
          payment_method ||
            "transfermovil"
        ).toLowerCase();

      if (!playerId) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "player_id es obligatorio.",
          });
      }

      if (!gameKey) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "game es obligatorio.",
          });
      }

      if (
        !isValidGame(
          gameKey
        )
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Juego no válido.",
          });
      }

      const product =
        getProduct(
          gameKey
        );

      const selected =
        product.packages[
          String(
            packageKey
          )
        ];

      if (!selected) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Paquete no válido.",
          });
      }

      if (
        product.requirements.includes(
          "zone_id"
        ) &&
        !zoneId
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Zone ID es obligatorio.",
          });
      }

      if (
        ![
          "transfermovil",
          "saldo_movil",
          "mlc",
        ].includes(
          payment
        )
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Método de pago no válido.",
          });
      }

      const prices =
        calculatePrices(
          selected.cost_usd
        );

      let saleAmount;

      if (
        payment ===
        "transfermovil"
      ) {
        saleAmount =
          prices.sale_cup_transfermovil;
      }

      if (
        payment ===
        "saldo_movil"
      ) {
        saleAmount =
          prices.sale_cup_saldo_movil;
      }

      if (
        payment ===
        "mlc"
      ) {
        saleAmount =
          prices.sale_mlc;
      }

      const orderId =
        crypto.randomUUID();

      const createdAt =
        new Date().toISOString();

      const order = {
        order_id:
          orderId,

        status:
          "PENDING_PAYMENT",

        created_at:
          createdAt,

        game:
          gameKey,

        game_name:
          product.name,

        package:
          String(
            packageKey
          ),

        sub_category_id:
          selected.sub_category_id,

        player_id:
          playerId,

        zone_id:
          zoneId,

        player_name:
          cleanString(
            player_name
          ),

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

        provider_response:
          null,

        payment_received:
          false,

        authorized:
          false,

        rejected:
          false,

        recharge_status:
          "NOT_STARTED",

        balance_before:
          null,

        balance_after:
          null,

        payment_received_at:
          null,

        authorized_at:
          null,

        submitted_at:
          null,

        completed_at:
          null,

        recharge_error:
          null,

        recharge_error_details:
          null,
      };

      await saveOrder(
        order
      );

      console.log(
        "PEDIDO GUARDADO:",
        order.order_id
      );

      res
        .status(201)
        .json({
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
// CONSULTAR PEDIDO
// ======================================================

app.get(
  "/api/order/:orderId",
  async (req, res) => {
    try {
      const order =
        await getOrder(
          req.params.orderId
        );

      if (!order) {
        return res
          .status(404)
          .json({
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
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);

// ======================================================
// ADMIN — LISTAR PEDIDOS
// ======================================================

app.get(
  "/api/admin/orders",
  requireAdmin,
  async (_req, res) => {
    try {
      const orders =
        await getOrders();

      res.json({
        ok: true,

        count:
          orders.length,

        orders,
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
// ADMIN — VER PEDIDO
// ======================================================

app.get(
  "/api/admin/orders/:orderId",
  requireAdmin,
  async (req, res) => {
    try {
      const order =
        await getOrder(
          req.params.orderId
        );

      if (!order) {
        return res
          .status(404)
          .json({
            ok: false,

            error:
              "Pedido no encontrado.",
          });
      }

      res.json({
        ok: true,
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
// ADMIN — MARCAR PAGO RECIBIDO
// ======================================================

app.post(
  "/api/admin/orders/:orderId/payment-received",
  requireAdmin,
  async (req, res) => {
    try {
      const order =
        await getOrder(
          req.params.orderId
        );

      if (!order) {
        return res
          .status(404)
          .json({
            ok: false,

            error:
              "Pedido no encontrado.",
          });
      }

      if (
        order.status !==
        "PENDING_PAYMENT"
      ) {
        return res
          .status(400)
          .json({
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

      await saveOrder(
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
    } catch (error) {
      sendError(
        res,
        error
      );
    }
  }
);

// ======================================================
// ADMIN — AUTORIZAR RECARGA
// ======================================================

app.post(
  "/api/admin/orders/:orderId/authorize",
  requireAdmin,
  async (req, res) => {
    let order = null;

    try {
      order =
        await getOrder(
          req.params.orderId
        );

      if (!order) {
        return res
          .status(404)
          .json({
            ok: false,

            error:
              "Pedido no encontrado.",
          });
      }

      // --------------------------------------------------
      // ESTADOS QUE NO PUEDEN VOLVER A ENVIARSE
      // --------------------------------------------------

      if (
        [
          "RECHARGE_PROCESSING",
          "RECHARGE_SUBMITTED",
        ].includes(
          order.status
        )
      ) {
        return res
          .status(409)
          .json({
            ok: false,

            error:
              "Esta recarga ya está siendo procesada o ya fue enviada a Shop2TopUp.",

            status:
              order.status,

            provider_order_id:
              order.provider_order_id,
          });
      }

      if (
        order.status ===
        "RECHARGE_FAILED"
      ) {
        return res
          .status(409)
          .json({
            ok: false,

            error:
              "Esta recarga falló anteriormente. No se volverá a enviar automáticamente para evitar una posible recarga duplicada.",
          });
      }

      if (
        order.status !==
        "PAYMENT_RECEIVED"
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Primero debes marcar el pago como recibido.",
          });
      }

      if (
        order.recharge_status ===
        "COMPLETED"
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "La recarga ya fue realizada.",
          });
      }

      const product =
        PRODUCTS[
          order.game
        ];

      if (!product) {
        return res
          .status(400)
          .json({
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
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Paquete no encontrado.",
          });
      }

      // --------------------------------------------------
      // COMPROBAR SALDO
      // --------------------------------------------------

      const account =
        await getShop2TopupAccount();

      if (
        account.balance ===
        null
      ) {
        return res
          .status(502)
          .json({
            ok: false,

            error:
              "No se puede autorizar la recarga porque Shop2TopUp no devolvió un saldo reconocible.",

            provider_response:
              account.data,
          });
      }

      const providerCost =
        Number(
          selected.cost_usd
        );

      const currentBalance =
        Number(
          account.balance
        );

      if (
        !Number.isFinite(
          providerCost
        ) ||
        providerCost <= 0
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Costo del producto inválido.",
          });
      }

      if (
        !Number.isFinite(
          currentBalance
        ) ||
        currentBalance < 0
      ) {
        return res
          .status(502)
          .json({
            ok: false,

            error:
              "El saldo devuelto por Shop2TopUp no es válido.",
          });
      }

      if (
        currentBalance <
        providerCost
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Saldo insuficiente en Shop2TopUp. La recarga NO fue enviada.",

            balance:
              currentBalance,

            required:
              providerCost,

            currency:
              "USD",
          });
      }

      // --------------------------------------------------
      // MARCAR COMO PROCESANDO
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
        currentBalance;

      order.provider_cost_usd =
        providerCost;

      /*
       * IMPORTANTE:
       * Utilizamos el mismo ID del pedido
       * como ID de orden del proveedor.
       *
       * Esto permite mantener un identificador
       * estable si Shop2TopUp trata order_id
       * como idempotente.
       */

      const providerOrderId =
        order.order_id;

      order.provider_order_id =
        providerOrderId;

      await saveOrder(
        order
      );

      // --------------------------------------------------
      // CREAR ORDEN SHOP2TOPUP
      // --------------------------------------------------

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

        quantity:
          1,

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
            order.order_id,

          provider_order_id:
            providerOrderId,

          game:
            order.game,

          package:
            order.package,

          provider_cost:
            providerCost,
        }
      );

      const providerResponse =
        await shop2topupRequest(
          "/orders/create",
          "POST",
          providerBody
        );

      // --------------------------------------------------
      // GUARDAR RESPUESTA DEL PROVEEDOR
      // --------------------------------------------------

      order.provider_order_id =
        providerOrderId;

      order.provider_response =
        providerResponse;

      order.recharge_status =
        "SUBMITTED";

      order.status =
        "RECHARGE_SUBMITTED";

      order.submitted_at =
        new Date().toISOString();

      await saveOrder(
        order
      );

      console.log(
        "RECARGA ENVIADA:",
        order.order_id
      );

      res.json({
        ok: true,

        message:
          "La recarga fue enviada a Shop2TopUp.",

        balance_before:
          currentBalance,

        provider_cost:
          providerCost,

        provider_order_id:
          providerOrderId,

        order,
      });
    } catch (error) {
      console.error(
        "ERROR AUTORIZANDO RECARGA:",
        error
      );

      /*
       * MUY IMPORTANTE:
       *
       * Si Shop2TopUp pudo haber aceptado
       * la orden pero nuestro servidor perdió
       * la respuesta, no intentamos reenviarla
       * automáticamente.
       *
       * Esto evita convertir un error de red
       * en una posible doble recarga.
       */

      if (order) {
        try {
          order.recharge_status =
            "FAILED";

          order.status =
            "RECHARGE_FAILED";

          order.recharge_error =
            error.message ||
            "Error desconocido.";

          order.recharge_error_details =
            error.details ||
            null;

          order.failed_at =
            new Date().toISOString();

          await saveOrder(
            order
          );
        } catch (
          saveError
        ) {
          console.error(
            "NO SE PUDO GUARDAR EL ERROR EN SUPABASE:",
            saveError
          );
        }
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
  async (req, res) => {
    try {
      const order =
        await getOrder(
          req.params.orderId
        );

      if (!order) {
        return res
          .status(404)
          .json({
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
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Este pedido ya no puede ser rechazado.",
          });
      }

      const reason =
        cleanString(
          req.body?.reason
        ) ||
        "Pago no confirmado.";

      order.rejected =
        true;

      order.status =
        "REJECTED";

      order.rejected_at =
        new Date().toISOString();

      order.rejection_reason =
        reason;

      await saveOrder(
        order
      );

      console.log(
        "PEDIDO RECHAZADO:",
        order.order_id
      );

      res.json({
        ok: true,
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
// ADMIN — CUENTA / SALDO
// ======================================================

/*
 * Esta ruta queda protegida.
 *
 * Antes estaba pública:
 *
 * GET /api/account
 *
 * Ahora solamente el administrador puede
 * consultarla.
 */

app.get(
  "/api/account",
  requireAdmin,
  async (_req, res) => {
    try {
      const account =
        await getShop2TopupAccount();

      res.json({
        ok: true,

        data:
          account.data,

        balance:
          account.balance,

        currency:
          "USD",
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
// ADMIN — CONSULTAR ORDEN DEL PROVEEDOR
// ======================================================

app.get(
  "/api/provider/order/:orderId",
  requireAdmin,
  async (req, res) => {
    try {
      const providerOrderId =
        cleanString(
          req.params.orderId
        );

      if (
        !providerOrderId
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "orderId es obligatorio.",
          });
      }

      const data =
        await shop2topupRequest(
          `/orders/${encodeURIComponent(
            providerOrderId
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
  async (req, res) => {
    try {
      console.log(
        "========================================"
      );

      console.log(
        "SHOP2TOPUP WEBHOOK RECIBIDO"
      );

      console.log(
        JSON.stringify(
          req.body,
          null,
          2
        )
      );

      console.log(
        "========================================"
      );

      /*
       * NO cambiamos automáticamente
       * el estado del pedido todavía.
       *
       * Primero necesitamos conocer
       * exactamente el formato y método
       * de firma del webhook de Shop2TopUp.
       */

      return res
        .status(200)
        .json({
          ok: true,

          received:
            true,
        });
    } catch (error) {
      console.error(
        "WEBHOOK ERROR:",
        error
      );

      return res
        .status(200)
        .json({
          ok: true,
          received:
            true,
        });
    }
  }
);

// ======================================================
// 404
// ======================================================

app.use(
  (_req, res) => {
    res
      .status(404)
      .json({
        ok: false,

        error:
          "Ruta no encontrada.",
      });
  }
);

// ======================================================
// ERROR GLOBAL
// ======================================================

app.use(
  (
    error,
    _req,
    res,
    _next
  ) => {
    console.error(
      "UNHANDLED SERVER ERROR:",
      error
    );

    res
      .status(500)
      .json({
        ok: false,

        error:
          "Error interno del servidor.",
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
      "========================================"
    );

    console.log(
      "RECARGAS DIAMANTES API"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Puerto: ${PORT}`
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
      `SUPABASE_URL: ${
        SUPABASE_URL
          ? "CONFIGURADA"
          : "NO CONFIGURADA"
      }`
    );

    console.log(
      `SUPABASE_SERVICE_ROLE_KEY: ${
        SUPABASE_SERVICE_ROLE_KEY
          ? "CONFIGURADA"
          : "NO CONFIGURADA"
      }`
    );

    console.log(
      "Sistema de pago manual: ACTIVADO"
    );

    console.log(
      "Persistencia de pedidos: SUPABASE ACTIVADA"
    );

    console.log(
      "========================================"
    );
  }
);