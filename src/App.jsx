import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://recargas-diamantes.onrender.com";
const WHATSAPP_NUMBER = "5350504941";

const GAME_INFO = {
  freefire: {
    name: "Free Fire",
    icon: "🔥",
    idLabel: "ID del jugador",
    requiresZone: false,
    currency: "💎",
  },
  mobilelegends: {
    name: "Mobile Legends: Bang Bang",
    icon: "⚔️",
    idLabel: "ID del jugador",
    requiresZone: true,
    currency: "💎",
  },
  pubg: {
    name: "PUBG Mobile",
    icon: "🎯",
    idLabel: "ID del jugador",
    requiresZone: false,
    currency: "UC",
  },
};

const PAYMENT_METHODS = [
  {
    id: "transfermovil",
    name: "Transfermóvil",
    icon: "📱",
    suffix: "CUP",
  },
  {
    id: "saldo_movil",
    name: "Saldo móvil",
    icon: "📲",
    suffix: "CUP",
  },
  {
    id: "mlc",
    name: "MLC",
    icon: "💵",
    suffix: "MLC",
  },
];

function formatCup(value) {
  return Math.round(Number(value || 0)).toLocaleString("es-CU");
}

function formatMlc(value) {
  return Number(value || 0).toFixed(2);
}

function getPackageLabel(gameKey, pack) {
  if (gameKey === "pubg") {
    return `${Number(pack.uc || 0).toLocaleString("es-CU")} UC`;
  }

  return `${Number(pack.diamonds || 0).toLocaleString(
    "es-CU"
  )} 💎`;
}

function getPaymentPrice(pack, payment) {
  if (payment === "transfermovil") {
    return {
      value: Number(pack.sale_cup_transfermovil || 0),
      text: `${formatCup(
        pack.sale_cup_transfermovil
      )} CUP`,
    };
  }

  if (payment === "saldo_movil") {
    return {
      value: Number(pack.sale_cup_saldo_movil || 0),
      text: `${formatCup(
        pack.sale_cup_saldo_movil
      )} CUP`,
    };
  }

  return {
    value: Number(pack.sale_mlc || 0),
    text: `${formatMlc(pack.sale_mlc)} MLC`,
  };
}

async function fetchJson(url, options = {}, timeout = 30000) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `El servidor respondió algo que no es JSON. HTTP ${response.status}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `Error HTTP ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "La operación tardó demasiado. Inténtalo nuevamente."
      );
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function extractPlayerName(data) {
  const candidates = [
    data?.data?.player?.player_name,
    data?.data?.player?.name,
    data?.data?.player_name,
    data?.data?.name,
    data?.player?.player_name,
    data?.player?.name,
    data?.player_name,
    data?.name,
  ];

  return candidates.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );
}

function providerResponseFailed(data) {
  if (data?.success === false) return true;
  if (data?.data?.success === false) return true;
  if (data?.data?.status === "failed") return true;
  if (data?.status === "failed") return true;

  return false;
}

function extractOrderId(data) {
  return (
    data?.data?.order_id ||
    data?.data?.orderId ||
    data?.order_id ||
    data?.orderId ||
    data?.data?.id ||
    data?.id ||
    ""
  );
}

function App() {
  const [products, setProducts] = useState(null);

  const [gameKey, setGameKey] =
    useState("freefire");

  const [packageKey, setPackageKey] =
    useState("");

  const [payment, setPayment] =
    useState("transfermovil");

  const [playerId, setPlayerId] =
    useState("");

  const [zoneId, setZoneId] =
    useState("");

  const [playerValidated, setPlayerValidated] =
    useState(false);

  const [playerName, setPlayerName] =
    useState("");

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingValidation, setLoadingValidation] =
    useState(false);

  const [creatingOrder, setCreatingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [createdOrderId, setCreatedOrderId] =
    useState("");

  const [showOrder, setShowOrder] =
    useState(false);

  const game = products?.[gameKey];

  const packages =
    game?.packages || {};

  const packageEntries =
    Object.entries(packages);

  const selectedPackage =
    packages[packageKey] ||
    packageEntries[0]?.[1] ||
    null;

  const selectedPackageKey =
    packageKey ||
    packageEntries[0]?.[0] ||
    "";

  const gameInfo =
    GAME_INFO[gameKey];

  const selectedPrice = useMemo(() => {
    if (!selectedPackage) {
      return {
        value: 0,
        text: "—",
      };
    }

    return getPaymentPrice(
      selectedPackage,
      payment
    );
  }, [selectedPackage, payment]);

  const selectedPayment =
    PAYMENT_METHODS.find(
      (item) => item.id === payment
    );

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!game) return;

    const firstPackage =
      Object.keys(game.packages || {})[0] || "";

    setPackageKey(firstPackage);
    setPlayerId("");
    setZoneId("");
    setPlayerValidated(false);
    setPlayerName("");
    setError("");
    setMessage("");
    setCreatedOrderId("");
    setShowOrder(false);
  }, [gameKey, products]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setError("");

      const data = await fetchJson(
        `${API_BASE}/api/products`
      );

      if (!data?.ok || !data?.products) {
        throw new Error(
          data?.error ||
            "No se pudieron cargar los productos."
        );
      }

      setProducts(data.products);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "No se pudieron cargar los productos. Comprueba que el servidor esté activo."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  function changeGame(value) {
    setGameKey(value);
  }

  function changePackage(value) {
    setPackageKey(value);
    setPlayerValidated(false);
    setPlayerName("");
    setCreatedOrderId("");
    setError("");
    setMessage("");
    setShowOrder(false);
  }

  function changePayment(value) {
    setPayment(value);
    setCreatedOrderId("");
    setError("");
    setMessage("");
    setShowOrder(false);
  }

  function changePlayerId(value) {
    setPlayerId(value);
    setPlayerValidated(false);
    setPlayerName("");
    setCreatedOrderId("");
    setError("");
    setMessage("");
    setShowOrder(false);
  }

  function changeZoneId(value) {
    setZoneId(value);
    setPlayerValidated(false);
    setPlayerName("");
    setCreatedOrderId("");
    setError("");
    setMessage("");
    setShowOrder(false);
  }

  async function validatePlayer() {
    setError("");
    setMessage("");
    setPlayerValidated(false);
    setPlayerName("");

    if (!playerId.trim()) {
      setError("Escribe el ID del jugador.");
      return;
    }

    if (!selectedPackage?.sub_category_id) {
      setError(
        "No se encontró el producto seleccionado."
      );
      return;
    }

    if (
      gameInfo.requiresZone &&
      !zoneId.trim()
    ) {
      setError(
        "Escribe el Zone ID de tu cuenta."
      );
      return;
    }

    try {
      setLoadingValidation(true);

      const body = {
        game: gameKey,
        player_id: playerId.trim(),
        sub_category_id:
          selectedPackage.sub_category_id,
      };

      if (gameInfo.requiresZone) {
        body.zone_id = zoneId.trim();
      }

      const data = await fetchJson(
        `${API_BASE}/api/check-id`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (providerResponseFailed(data)) {
        throw new Error(
          data?.error ||
            data?.data?.error ||
            "El proveedor no pudo validar este jugador."
        );
      }

      const name =
        extractPlayerName(data);

      setPlayerName(
        name ? String(name) : ""
      );

      setPlayerValidated(true);

      setMessage(
        name
          ? `Jugador encontrado: ${name}`
          : "ID validado correctamente."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "No se pudo validar el jugador. Revisa los datos."
      );
    } finally {
      setLoadingValidation(false);
    }
  }

  function prepareOrder(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedPackage) {
      setError(
        "Selecciona un paquete."
      );
      return;
    }

    if (!playerId.trim()) {
      setError(
        "Escribe el ID del jugador."
      );
      return;
    }

    if (
      gameInfo.requiresZone &&
      !zoneId.trim()
    ) {
      setError(
        "Escribe el Zone ID."
      );
      return;
    }

    if (!playerValidated) {
      setError(
        "Primero debes validar el ID del jugador."
      );
      return;
    }

    setShowOrder(true);
  }

  async function createShop2TopupOrder() {
    if (!selectedPackage) {
      setError(
        "No hay un paquete seleccionado."
      );
      return;
    }

    if (!playerId.trim()) {
      setError(
        "Escribe el ID del jugador."
      );
      return;
    }

    if (
      gameInfo.requiresZone &&
      !zoneId.trim()
    ) {
      setError(
        "Escribe el Zone ID."
      );
      return;
    }

    if (!playerValidated) {
      setError(
        "Primero debes validar el ID del jugador."
      );
      return;
    }

    if (
      !selectedPackage.sub_category_id
    ) {
      setError(
        "El paquete no tiene sub_category_id."
      );
      return;
    }

    try {
      setCreatingOrder(true);
      setError("");
      setMessage("");
      setCreatedOrderId("");

      /*
       * IMPORTANTE:
       *
       * expected_unit_price es el COSTO REAL
       * que Shop2TopUp nos está cobrando.
       *
       * El precio de venta al cliente NO se manda
       * como costo del proveedor.
       */
      const body = {
        game: gameKey,
        package: selectedPackageKey,
        sub_category_id:
          Number(
            selectedPackage.sub_category_id
          ),
        quantity: 1,
        player_id: playerId.trim(),
        expected_unit_price:
          String(
            selectedPackage.cost_usd
          ),
      };

      if (gameInfo.requiresZone) {
        body.zone_id = zoneId.trim();
      }

      const data = await fetchJson(
        `${API_BASE}/api/order`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        },
        60000
      );

      if (
        data?.ok === false ||
        providerResponseFailed(data)
      ) {
        throw new Error(
          data?.error ||
            data?.data?.error ||
            "Shop2TopUp rechazó la orden."
        );
      }

      const orderId =
        extractOrderId(data);

      if (!orderId) {
        console.error(
          "Respuesta de orden sin ID:",
          data
        );

        throw new Error(
          "Shop2TopUp creó una respuesta pero no devolvió el ID de la orden."
        );
      }

      setCreatedOrderId(
        String(orderId)
      );

      setMessage(
        "✅ Orden creada correctamente. Abriendo WhatsApp..."
      );

      const priceText =
        selectedPrice.text;

      const packageLabel =
        getPackageLabel(
          gameKey,
          selectedPackage
        );

      const lines = [
        "🛒 *NUEVO PEDIDO - RECARGAS DIAMANTES*",
        "",
        `📋 Pedido: ${orderId}`,
        `🎮 Juego: ${gameInfo.name}`,
        `💎 Paquete: ${packageLabel}`,
        `👤 ID del jugador: ${playerId.trim()}`,
      ];

      if (gameInfo.requiresZone) {
        lines.push(
          `🆔 Zone ID: ${zoneId.trim()}`
        );
      }

      if (playerName) {
        lines.push(
          `👑 Nombre: ${playerName}`
        );
      }

      lines.push(
        `💳 Método de pago: ${
          selectedPayment?.name ||
          payment
        }`,
        `💰 Total: ${priceText}`,
        "",
        "✅ ID validado correctamente.",
        "✅ Orden creada en el sistema.",
        "",
        "Hola, quiero realizar esta recarga. Por favor, indícame cómo continuar con el pago."
      );

      const whatsappMessage =
        lines.join("\n");

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(
          whatsappMessage
        )}`;

      /*
       * Pequeña pausa para que el usuario
       * alcance a ver que la orden fue creada.
       */
      setTimeout(() => {
        window.location.href =
          whatsappUrl;
      }, 500);
    } catch (err) {
      console.error(
        "CREATE ORDER ERROR:",
        err
      );

      setError(
        err.message ||
          "No se pudo crear la orden en Shop2TopUp."
      );
    } finally {
      setCreatingOrder(false);
    }
  }

  if (loadingProducts) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <div className="spinner"></div>

          <h2>
            Cargando tienda...
          </h2>

          <p>
            Conectando con nuestro servidor.
          </p>
        </div>

        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f6fb;
            padding: 20px;
          }

          .loading-box {
            width: 100%;
            max-width: 420px;
            text-align: center;
            background: white;
            padding: 35px;
            border-radius: 22px;
            box-shadow:
              0 15px 45px rgba(0,0,0,.10);
          }

          .spinner {
            width: 48px;
            height: 48px;
            margin: 0 auto 20px;
            border: 5px solid #e5e7eb;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation:
              spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="container">
          <div className="brand">
            <div className="brand-icon">
              💎
            </div>

            <h1>
              Recargas Diamantes
            </h1>

            <p>
              Recarga tus juegos de forma
              rápida, sencilla y segura.
            </p>
          </div>
        </div>
      </header>

      <main className="container main">
        <div className="card">

          {error && (
            <div className="alert error">
              ❌ {error}
            </div>
          )}

          {message && (
            <div className="alert success">
              {message}
            </div>
          )}

          {createdOrderId && (
            <div className="order-created">
              <strong>
                🧾 Orden creada
              </strong>

              <span>
                {createdOrderId}
              </span>
            </div>
          )}

          <section className="section">
            <h2>
              🎮 Selecciona tu juego
            </h2>

            <div className="games">
              {Object.entries(
                GAME_INFO
              ).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  className={`game ${
                    gameKey === key
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    changeGame(key)
                  }
                >
                  <span className="game-icon">
                    {info.icon}
                  </span>

                  <span className="game-name">
                    {info.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <form
            onSubmit={prepareOrder}
          >
            <section className="section">
              <h2>
                💎 Selecciona tu paquete
              </h2>

              <div className="packages">
                {packageEntries.map(
                  ([key, pack]) => {
                    const price =
                      getPaymentPrice(
                        pack,
                        payment
                      );

                    return (
                      <button
                        key={key}
                        type="button"
                        className={`package ${
                          selectedPackageKey ===
                          key
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          changePackage(
                            key
                          )
                        }
                      >
                        <strong>
                          {getPackageLabel(
                            gameKey,
                            pack
                          )}
                        </strong>

                        <span>
                          {price.text}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </section>

            <section className="section">
              <h2>
                💳 Método de pago
              </h2>

              <div className="payments">
                {PAYMENT_METHODS.map(
                  (method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`payment ${
                        payment ===
                        method.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        changePayment(
                          method.id
                        )
                      }
                    >
                      <span>
                        {method.icon}
                      </span>

                      <strong>
                        {method.name}
                      </strong>

                      <small>
                        {selectedPackage
                          ? getPaymentPrice(
                              selectedPackage,
                              method.id
                            ).text
                          : ""}
                      </small>
                    </button>
                  )
                )}
              </div>
            </section>

            <section className="section">
              <h2>
                👤 Datos del jugador
              </h2>

              <div className="input-group">
                <label>
                  {gameInfo.idLabel}
                </label>

                <input
                  type="text"
                  value={playerId}
                  onChange={(e) =>
                    changePlayerId(
                      e.target.value
                    )
                  }
                  placeholder="Introduce tu ID"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>

              {gameInfo.requiresZone && (
                <div className="input-group">
                  <label>
                    Zone ID
                  </label>

                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) =>
                      changeZoneId(
                        e.target.value
                      )
                    }
                    placeholder="Introduce tu Zone ID"
                    autoComplete="off"
                  />
                </div>
              )}

              <button
                type="button"
                className="validate-button"
                onClick={
                  validatePlayer
                }
                disabled={
                  loadingValidation ||
                  creatingOrder
                }
              >
                {loadingValidation
                  ? "🔄 Validando..."
                  : "🔍 Validar jugador"}
              </button>

              {playerValidated && (
                <div className="validated">
                  <strong>
                    ✅ Jugador validado
                  </strong>

                  {playerName && (
                    <span>
                      Nombre:{" "}
                      {playerName}
                    </span>
                  )}
                </div>
              )}
            </section>

            <section className="section summary-section">
              <h2>
                🧾 Resumen
              </h2>

              <div className="summary">
                <div>
                  <span>
                    Juego
                  </span>

                  <strong>
                    {gameInfo.name}
                  </strong>
                </div>

                <div>
                  <span>
                    Paquete
                  </span>

                  <strong>
                    {selectedPackage
                      ? getPackageLabel(
                          gameKey,
                          selectedPackage
                        )
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Pago
                  </span>

                  <strong>
                    {selectedPayment?.name ||
                      "—"}
                  </strong>
                </div>

                <div className="total">
                  <span>
                    Total
                  </span>

                  <strong>
                    {selectedPrice.text}
                  </strong>
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="continue-button"
              disabled={
                creatingOrder
              }
            >
              Continuar
            </button>
          </form>

          {showOrder && (
            <section className="confirmation">
              <h2>
                🛒 Confirmar pedido
              </h2>

              <div className="confirmation-box">
                <p>
                  <strong>
                    Juego:
                  </strong>{" "}
                  {gameInfo.name}
                </p>

                <p>
                  <strong>
                    Paquete:
                  </strong>{" "}
                  {getPackageLabel(
                    gameKey,
                    selectedPackage
                  )}
                </p>

                <p>
                  <strong>
                    ID:
                  </strong>{" "}
                  {playerId}
                </p>

                {gameInfo.requiresZone && (
                  <p>
                    <strong>
                      Zone ID:
                    </strong>{" "}
                    {zoneId}
                  </p>
                )}

                <p>
                  <strong>
                    Pago:
                  </strong>{" "}
                  {selectedPayment?.name}
                </p>

                <p className="confirmation-total">
                  <strong>
                    Total:
                  </strong>{" "}
                  {selectedPrice.text}
                </p>
              </div>

              <button
                type="button"
                className="whatsapp-button"
                onClick={
                  createShop2TopupOrder
                }
                disabled={
                  creatingOrder
                }
              >
                {creatingOrder
                  ? "⏳ Creando orden..."
                  : "📲 Crear orden y continuar por WhatsApp"}
              </button>

              <p className="small-note">
                Primero crearemos la orden
                en Shop2TopUp. Después se
                abrirá WhatsApp con los
                datos del pedido.
              </p>
            </section>
          )}

          <div className="security">
            🔒 Tus datos se utilizan
            únicamente para procesar la
            recarga.
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>
            © {new Date().getFullYear()}
            {" "}Recargas Diamantes
          </p>

          <p>
            Servicio de recargas digitales
          </p>
        </div>
      </footer>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          background: #f3f6fb;
          color: #172033;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          width: min(
            100% - 30px,
            1050px
          );
          margin: 0 auto;
        }

        .hero {
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          color: white;
          padding: 35px 0;
        }

        .brand {
          text-align: center;
        }

        .brand-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(
            255,
            255,
            255,
            .15
          );
          font-size: 38px;
        }

        .brand h1 {
          margin: 0;
          font-size: 32px;
        }

        .brand p {
          margin: 10px 0 0;
          opacity: .92;
        }

        .main {
          padding: 25px 0 50px;
          flex: 1;
        }

        .card {
          background: white;
          border-radius: 24px;
          padding: 25px;
          box-shadow:
            0 15px 50px
            rgba(15,23,42,.08);
        }

        .section {
          padding: 10px 0 25px;
          border-bottom:
            1px solid #e8edf5;
          margin-bottom: 25px;
        }

        .section h2 {
          margin:
            0 0 18px;
          font-size: 21px;
        }

        .games {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .game {
          border:
            2px solid #e5e7eb;
          background: white;
          border-radius: 16px;
          padding: 18px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: .2s;
        }

        .game:hover {
          transform: translateY(-2px);
        }

        .game.active {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .game-icon {
          font-size: 32px;
        }

        .game-name {
          font-weight: 700;
          font-size: 14px;
        }

        .packages {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .package {
          background: white;
          border:
            2px solid #e5e7eb;
          border-radius: 15px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          transition: .2s;
        }

        .package:hover {
          transform: translateY(-2px);
          border-color: #93c5fd;
        }

        .package.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .package strong {
          font-size: 17px;
        }

        .package span {
          color: #2563eb;
          font-weight: 700;
        }

        .payments {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .payment {
          border:
            2px solid #e5e7eb;
          background: white;
          border-radius: 16px;
          padding: 17px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
        }

        .payment.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .payment span {
          font-size: 25px;
        }

        .payment strong {
          font-size: 14px;
        }

        .payment small {
          color: #2563eb;
          font-weight: 700;
          font-size: 14px;
        }

        .input-group {
          margin-bottom: 15px;
        }

        .input-group label {
          display: block;
          margin-bottom: 7px;
          font-weight: 700;
        }

        .input-group input {
          width: 100%;
          padding: 15px;
          border:
            2px solid #e5e7eb;
          border-radius: 13px;
          outline: none;
          font-size: 16px;
        }

        .input-group input:focus {
          border-color: #2563eb;
        }

        .validate-button {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 13px;
          background: #eef2ff;
          color: #3730a3;
          font-weight: 800;
        }

        .validated {
          margin-top: 14px;
          padding: 13px;
          border-radius: 13px;
          background: #ecfdf5;
          color: #047857;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .summary-section {
          border-bottom: none;
          margin-bottom: 0;
        }

        .summary {
          background: #f8fafc;
          border-radius: 17px;
          padding: 15px;
        }

        .summary > div {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 10px 0;
          border-bottom:
            1px solid #e5e7eb;
        }

        .summary > div:last-child {
          border-bottom: none;
        }

        .summary span {
          color: #64748b;
        }

        .summary strong {
          text-align: right;
        }

        .summary .total strong {
          color: #2563eb;
          font-size: 19px;
        }

        .continue-button {
          width: 100%;
          padding: 17px;
          border: none;
          border-radius: 14px;
          background: #2563eb;
          color: white;
          font-weight: 800;
          font-size: 17px;
        }

        .continue-button:hover {
          background: #1d4ed8;
        }

        .confirmation {
          margin-top: 25px;
          padding: 22px;
          border-radius: 20px;
          background: #f8fafc;
          border:
            2px solid #e2e8f0;
        }

        .confirmation h2 {
          margin-top: 0;
        }

        .confirmation-box {
          background: white;
          border-radius: 15px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .confirmation-box p {
          margin: 8px 0;
        }

        .confirmation-total {
          color: #2563eb;
          font-size: 18px;
        }

        .whatsapp-button {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 17px;
          background: #16a34a;
          color: white;
          font-weight: 800;
          font-size: 16px;
        }

        .whatsapp-button:hover {
          background: #15803d;
        }

        .small-note {
          text-align: center;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 0;
        }

        .alert {
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 18px;
          font-weight: 600;
        }

        .alert.error {
          background: #fef2f2;
          color: #b91c1c;
          border:
            1px solid #fecaca;
        }

        .alert.success {
          background: #ecfdf5;
          color: #047857;
          border:
            1px solid #a7f3d0;
        }

        .order-created {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 14px;
          margin-bottom: 18px;
          border-radius: 14px;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .security {
          margin-top: 25px;
          padding-top: 20px;
          border-top:
            1px solid #e5e7eb;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        footer {
          background: #111827;
          color: #9ca3af;
          padding: 25px 0;
          text-align: center;
          font-size: 13px;
        }

        footer p {
          margin: 5px 0;
        }

        @media (max-width: 750px) {
          .container {
            width:
              min(
                100% - 20px,
                1050px
              );
          }

          .card {
            padding: 18px;
            border-radius: 19px;
          }

          .hero {
            padding: 28px 0;
          }

          .brand h1 {
            font-size: 27px;
          }

          .games,
          .packages,
          .payments {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .games,
          .packages,
          .payments {
            grid-template-columns: 1fr;
          }

          .order-created {
            flex-direction: column;
          }

          .summary > div {
            flex-direction: column;
            gap: 4px;
          }

          .summary strong {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}

export default App;