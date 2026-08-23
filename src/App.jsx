import React, { useEffect, useMemo, useState } from "react";
const API_BASE = "https://recargas-diamantes.onrender.com";
const WHATSAPP_NUMBER = "5350504941";
const GAME_INFO = {
  freefire: {
    name: "Free Fire",
    icon: "🔥",
    idLabel: "ID del jugador",
    requiresZone: false,
    currencyLabel: "💎 Diamantes",
  },
  mobilelegends: {
    name: "Mobile Legends: Bang Bang",
    icon: "⚔️",
    idLabel: "ID del jugador",
    requiresZone: true,
    currencyLabel: "💎 Diamantes",
  },
  pubg: {
    name: "PUBG Mobile",
    icon: "🎯",
    idLabel: "ID del jugador",
    requiresZone: false,
    currencyLabel: "UC",
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
    return `${Number(pack.uc).toLocaleString("es-CU")} UC`;
  }
  return `${Number(pack.diamonds).toLocaleString("es-CU")} 💎`;
}
function getPaymentPrice(pack, payment) {
  if (payment === "transfermovil") {
    return {
      value: pack.sale_cup_transfermovil,
      text: `${formatCup(pack.sale_cup_transfermovil)} CUP`,
    };
  }
  if (payment === "saldo_movil") {
    return {
      value: pack.sale_cup_saldo_movil,
      text: `${formatCup(pack.sale_cup_saldo_movil)} CUP`,
    };
  }
  return {
    value: pack.sale_mlc,
    text: `${formatMlc(pack.sale_mlc)} MLC`,
  };
}
function App() {
  const [products, setProducts] = useState(null);
  const [gameKey, setGameKey] = useState("freefire");
  const [packageKey, setPackageKey] = useState("");
  const [payment, setPayment] = useState("transfermovil");
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [playerValidated, setPlayerValidated] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const game = products?.[gameKey];
  const packages = game?.packages || {};
  const packageEntries = Object.entries(packages);
  const selectedPackage =
    packages[packageKey] ||
    packageEntries[0]?.[1] ||
    null;
  const selectedPackageKey =
    packageKey || packageEntries[0]?.[0] || "";
  const gameInfo = GAME_INFO[gameKey];
  const selectedPrice = useMemo(() => {
    if (!selectedPackage) {
      return {
        value: 0,
        text: "—",
      };
    }
    return getPaymentPrice(selectedPackage, payment);
  }, [selectedPackage, payment]);
  useEffect(() => {
    loadProducts();
  }, []);
  useEffect(() => {
    if (!game) return;
    const firstPackage = Object.keys(game.packages || {})[0] || "";
    setPackageKey(firstPackage);
    setPlayerId("");
    setZoneId("");
    setPlayerValidated(false);
    setPlayerName("");
    setError("");
    setMessage("");
    setShowOrder(false);
  }, [gameKey, products]);
  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setError("");
      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "No se pudieron cargar los productos."
        );
      }
      setProducts(data.products);
    } catch (err) {
      console.error(err);
      setError(
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
    setError("");
    setMessage("");
    setShowOrder(false);
  }
  function changePlayerId(value) {
    setPlayerId(value);
    setPlayerValidated(false);
    setPlayerName("");
    setError("");
    setMessage("");
    setShowOrder(false);
  }
  function changeZoneId(value) {
    setZoneId(value);
    setPlayerValidated(false);
    setPlayerName("");
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
      setError("No se encontró el producto seleccionado.");
      return;
    }
    if (gameInfo.requiresZone && !zoneId.trim()) {
      setError("Escribe el Zone ID de tu cuenta.");
      return;
    }
    try {
      setLoadingValidation(true);
      const body = {
        game: gameKey,
        player_id: playerId.trim(),
        sub_category_id: selectedPackage.sub_category_id,
      };
      if (gameInfo.requiresZone) {
        body.zone_id = zoneId.trim();
      }
      const response = await fetch(`${API_BASE}/api/check-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error || "No se pudo validar el jugador."
        );
      }
      const player =
        data?.data?.player ||
        data?.player ||
        null;
      setPlayerValidated(true);
      if (player?.player_name) {
        setPlayerName(player.player_name);
      } else if (player?.name) {
        setPlayerName(player.name);
      }
      setMessage(
        player?.player_name || player?.name
          ? `Jugador encontrado: ${
              player.player_name || player.name
            }`
          : "ID validado correctamente."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No se pudo validar el jugador. Revisa el ID."
      );
    } finally {
      setLoadingValidation(false);
    }
  }
  function prepareOrder(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!playerId.trim()) {
      setError("Escribe el ID del jugador.");
      return;
    }
    if (gameInfo.requiresZone && !zoneId.trim()) {
      setError("Escribe el Zone ID.");
      return;
    }
    if (!playerValidated) {
      setError(
        "Primero debes validar el ID del jugador."
      );
      return;
    }
    if (!selectedPackage) {
      setError("Selecciona un paquete.");
      return;
    }
    setShowOrder(true);
  }
  function sendWhatsAppOrder() {
    if (!selectedPackage) return;
    const referenceId =
      `RD-${Date.now()}`;
    const priceText = selectedPrice.text;
    const lines = [
      "🛒 *NUEVO PEDIDO - RECARGAS DIAMANTES*",
      "",
      `📋 Pedido: ${referenceId}`,
      `🎮 Juego: ${gameInfo.name}`,
      `💎 Paquete: ${getPackageLabel(
        gameKey,
        selectedPackage
      )}`,
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
        PAYMENT_METHODS.find(
          (item) => item.id === payment
        )?.name
      }`,
      `💰 Total: ${priceText}`,
      "",
      "✅ ID validado correctamente.",
      "",
      "Hola, quiero realizar esta recarga. Por favor, indícame cómo continuar con el pago."
    );
    const messageText = lines.join("\n");
    const url =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(messageText)}`;
    window.location.href = url;
  }
  if (loadingProducts) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <div className="spinner"></div>
          <h2>Cargando tienda...</h2>
          <p>Conectando con nuestro servidor.</p>
        </div>
        <style>{`
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
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
            text-align: center;
            background: white;
            padding: 35px;
            border-radius: 22px;
            box-shadow: 0 15px 45px rgba(0,0,0,.10);
          }
          .spinner {
            width: 45px;
            height: 45px;
            margin: 0 auto 20px;
            border: 5px solid #e5e7eb;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
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
            <div className="brand-icon">💎</div>
            <h1>Recargas Diamantes</h1>
            <p>
              Recarga tus juegos de forma rápida,
              sencilla y segura.
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
              ✅ {message}
            </div>
          )}
          <section className="section">
            <h2>🎮 Selecciona tu juego</h2>
            <div className="games">
              {Object.entries(GAME_INFO).map(
                ([key, info]) => (
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
                )
              )}
            </div>
          </section>
          <form onSubmit={prepareOrder}>
            <section className="section">
              <h2>💎 Selecciona tu paquete</h2>
              <div className="packages">
                {packageEntries.map(
                  ([key, pack]) => (
                    <button
                      key={key}
                      type="button"
                      className={`package ${
                        selectedPackageKey === key
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        changePackage(key)
                      }
                    >
                      <strong>
                        {getPackageLabel(
                          gameKey,
                          pack
                        )}
                      </strong>
                      <span>
                        Desde{" "}
                        {payment === "mlc"
                          ? `${formatMlc(
                              pack.sale_mlc
                            )} MLC`
                          : `${formatCup(
                              payment ===
                                "transfermovil"
                                ? pack.sale_cup_transfermovil
                                : pack.sale_cup_saldo_movil
                            )} CUP`}
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
            <section className="section">
              <h2>👤 Datos del jugador</h2>
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
                />
              </div>
              {gameInfo.requiresZone && (
                <div className="input-group">
                  <label>Zone ID</label>
                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) =>
                      changeZoneId(
                        e.target.value
                      )
                    }
                    placeholder="Introduce tu Zone ID"
                  />
                </div>
              )}
              <button
                type="button"
                className="validate-button"
                onClick={validatePlayer}
                disabled={loadingValidation}
              >
                {loadingValidation
                  ? "Validando..."
                  : "🔍 Validar jugador"}
              </button>
              {playerValidated && (
                <div className="validated">
                  <strong>
                    ✅ Jugador validado
                  </strong>
                  {playerName && (
                    <span>
                      Nombre: {playerName}
                    </span>
                  )}
                </div>
              )}
            </section>
            <section className="section">
              <h2>💳 Método de pago</h2>
              <div className="payments">
                {PAYMENT_METHODS.map(
                  (method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`payment ${
                        payment === method.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setPayment(
                          method.id
                        );
                        setShowOrder(false);
                      }}
                    >
                      <span className="payment-icon">
                        {method.icon}
                      </span>
                      <span>
                        {method.name}
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
            <section className="summary">
              <div>
                <span>Juego</span>
                <strong>
                  {gameInfo.name}
                </strong>
              </div>
              <div>
                <span>Paquete</span>
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
                <span>Pago</span>
                <strong>
                  {
                    PAYMENT_METHODS.find(
                      (item) =>
                        item.id === payment
                    )?.name
                  }
                </strong>
              </div>
              <div className="total">
                <span>Total</span>
                <strong>
                  {selectedPrice.text}
                </strong>
              </div>
            </section>
            {!showOrder ? (
              <button
                type="submit"
                className="continue-button"
              >
                Continuar con el pedido
              </button>
            ) : (
              <div className="order-confirmation">
                <h2>
                  ✅ Pedido listo
                </h2>
                <p>
                  Verifica los datos antes de
                  continuar por WhatsApp.
                </p>
                <div className="confirmation-data">
                  <p>
                    <strong>Juego:</strong>{" "}
                    {gameInfo.name}
                  </p>
                  <p>
                    <strong>Paquete:</strong>{" "}
                    {getPackageLabel(
                      gameKey,
                      selectedPackage
                    )}
                  </p>
                  <p>
                    <strong>ID:</strong>{" "}
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
                    <strong>Pago:</strong>{" "}
                    {
                      PAYMENT_METHODS.find(
                        (item) =>
                          item.id === payment
                      )?.name
                    }
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
                    sendWhatsAppOrder
                  }
                >
                  📲 Enviar pedido por WhatsApp
                </button>
                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    setShowOrder(false)
                  }
                >
                  ← Modificar pedido
                </button>
              </div>
            )}
          </form>
        </div>
        <div className="info">
          <div>
            <strong>🔐 Seguro</strong>
            <span>
              Validamos tu ID antes de la recarga.
            </span>
          </div>
          <div>
            <strong>⚡ Rápido</strong>
            <span>
              Procesamos tus pedidos rápidamente.
            </span>
          </div>
          <div>
            <strong>💬 Atención</strong>
            <span>
              Soporte directo por WhatsApp.
            </span>
          </div>
        </div>
      </main>
      <footer>
        <p>
          © {new Date().getFullYear()} Recargas
          Diamantes
        </p>
      </footer>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f3f6fb;
          color: #172033;
        }
        button,
        input {
          font: inherit;
        }
        button {
          -webkit-tap-highlight-color: transparent;
        }
        .app {
          min-height: 100vh;
        }
        .hero {
          background:
            linear-gradient(
              135deg,
              #111827,
              #1d4ed8
            );
          color: white;
          padding: 42px 20px 75px;
        }
        .container {
          width: min(100%, 1050px);
          margin: 0 auto;
        }
        .brand {
          text-align: center;
        }
        .brand-icon {
          font-size: 46px;
          margin-bottom: 8px;
        }
        .brand h1 {
          margin: 0;
          font-size: clamp(
            32px,
            7vw,
            55px
          );
          font-weight: 900;
        }
        .brand p {
          margin: 12px auto 0;
          max-width: 650px;
          font-size: 17px;
          line-height: 1.5;
          opacity: .92;
        }
        .main {
          padding: 0 16px 40px;
        }
        .card {
          background: white;
          border-radius: 24px;
          padding: 25px;
          box-shadow:
            0 18px 50px
            rgba(15, 23, 42, .13);
          margin-top: -38px;
          position: relative;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          margin: 0 0 15px;
          font-size: 21px;
        }
        .games {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }
        .game {
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 17px;
          padding: 18px 10px;
          cursor: pointer;
          text-align: center;
          color: #172033;
          transition: .2s;
        }
        .game:hover {
          transform:
            translateY(-2px);
        }
        .game.active {
          border-color: #2563eb;
          background: #eff6ff;
        }
        .game-icon {
          display: block;
          font-size: 32px;
          margin-bottom: 7px;
        }
        .game-name {
          font-weight: 800;
        }
        .packages {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 10px;
        }
        .package {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 15px;
          padding: 15px 10px;
          cursor: pointer;
          color: #172033;
          text-align: center;
        }
        .package.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }
        .package strong,
        .package span {
          display: block;
        }
        .package strong {
          font-size: 17px;
          margin-bottom: 6px;
        }
        .package span {
          color: #64748b;
          font-size: 13px;
        }
        .input-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          font-weight: 700;
          margin-bottom: 7px;
        }
        input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 14px;
          outline: none;
          background: white;
        }
        input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37,99,235,.10);
        }
        .validate-button {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 14px;
          background: #e0ecff;
          color: #1d4ed8;
          font-weight: 800;
          cursor: pointer;
        }
        .validate-button:disabled {
          opacity: .6;
          cursor: wait;
        }
        .validated {
          margin-top: 12px;
          padding: 13px;
          border-radius: 12px;
          background: #ecfdf5;
          color: #047857;
        }
        .validated strong,
        .validated span {
          display: block;
        }
        .validated span {
          margin-top: 4px;
        }
        .payments {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 10px;
        }
        .payment {
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 15px;
          padding: 15px 8px;
          cursor: pointer;
          color: #172033;
          font-weight: 700;
        }
        .payment.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }
        .payment-icon {
          display: block;
          font-size: 25px;
          margin-bottom: 6px;
        }
        .summary {
          background: #f8fafc;
          border-radius: 17px;
          padding: 18px;
          margin-top: 10px;
        }
        .summary > div {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 9px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .summary > div:last-child {
          border-bottom: 0;
        }
        .summary span {
          color: #64748b;
        }
        .summary strong {
          text-align: right;
        }
        .summary .total {
          margin-top: 5px;
          padding-top: 15px;
          font-size: 20px;
        }
        .summary .total strong {
          color: #2563eb;
        }
        .continue-button,
        .whatsapp-button {
          width: 100%;
          border: 0;
          border-radius: 14px;
          padding: 16px;
          color: white;
          font-weight: 900;
          cursor: pointer;
          font-size: 17px;
        }
        .continue-button {
          background: #2563eb;
          margin-top: 20px;
        }
        .continue-button:hover {
          background: #1d4ed8;
        }
        .whatsapp-button {
          background: #16a34a;
          margin-top: 15px;
        }
        .back-button {
          width: 100%;
          border: 0;
          background: transparent;
          color: #64748b;
          padding: 14px;
          cursor: pointer;
          font-weight: 700;
        }
        .order-confirmation {
          margin-top: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 18px;
        }
        .order-confirmation h2 {
          margin-top: 0;
        }
        .confirmation-data {
          background: white;
          border-radius: 14px;
          padding: 15px;
        }
        .confirmation-data p {
          margin: 8px 0;
        }
        .confirmation-total {
          font-size: 20px;
          color: #2563eb;
        }
        .alert {
          border-radius: 13px;
          padding: 13px 15px;
          margin-bottom: 20px;
          font-weight: 700;
        }
        .alert.error {
          background: #fef2f2;
          color: #b91c1c;
        }
        .alert.success {
          background: #ecfdf5;
          color: #047857;
        }
        .info {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 15px;
          margin-top: 25px;
        }
        .info > div {
          background: white;
          border-radius: 16px;
          padding: 18px;
          text-align: center;
          box-shadow:
            0 8px 25px
            rgba(15,23,42,.06);
        }
        .info strong,
        .info span {
          display: block;
        }
        .info strong {
          margin-bottom: 7px;
        }
        .info span {
          color: #64748b;
          font-size: 14px;
          line-height: 1.4;
        }
        footer {
          text-align: center;
          padding: 20px;
          color: #64748b;
        }
        @media (max-width: 700px) {
          .card {
            padding: 18px;
          }
          .games,
          .packages,
          .payments {
            grid-template-columns:
              repeat(2, 1fr);
          }
          .info {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 420px) {
          .games,
          .packages,
          .payments {
            grid-template-columns: 1fr;
          }
          .summary > div {
            flex-direction: column;
            gap: 3px;
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