import React, { useMemo, useState } from "react";

const WHATSAPP_NUMBER = "5350504941";

const games = {
  freeFire: {
    name: "Free Fire",
    icon: "🔥",
    idLabel: "ID del jugador",
    validationCode: "free_fire",
    packages: [
      {
        amount: "110 💎",
        transfer: 1000,
        saldo: 500,
        mlc: 2,
        serviceCode: "TOPUP_FREE_FIRE_LATAM_110_DIAMONDS_542",
      },
      {
        amount: "341 💎",
        transfer: 3000,
        saldo: 1500,
        mlc: 6,
        serviceCode: "TOPUP_FREE_FIRE_LATAM_341_DIAMONDS_543",
      },
      {
        amount: "572 💎",
        transfer: 5000,
        saldo: 2500,
        mlc: 10,
        serviceCode: "TOPUP_FREE_FIRE_LATAM_572_DIAMONDS_544",
      },
      {
        amount: "1,166 💎",
        transfer: 10000,
        saldo: 5000,
        mlc: 20,
        serviceCode: "TOPUP_FREE_FIRE_LATAM_1166_DIAMONDS_545",
      },
      {
        amount: "2,398 💎",
        transfer: 19500,
        saldo: 10000,
        mlc: 40,
        serviceCode: "TOPUP_FREE_FIRE_LATAM_2398_DIAMONDS_546",
      },
      {
        amount: "6,160 💎",
        transfer: 50000,
        saldo: 25000,
        mlc: 100,
        serviceCode: "TOPUP_FREE_FIRE_LATAM_6160_DIAMONDS_547",
      },
    ],
  },

  mobileLegends: {
    name: "Mobile Legends",
    icon: "⚔️",
    idLabel: "ID del jugador",
    zoneLabel: "Zone ID",
    validationCode: "mlbb_global",
    packages: [
      {
        amount: "55 💎",
        transfer: 1000,
        saldo: 500,
        mlc: 2,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_55_DIAMONDS_38",
      },
      {
        amount: "86 💎",
        transfer: 1500,
        saldo: 750,
        mlc: 3,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_86_DIAMONDS_39",
      },
      {
        amount: "165 💎",
        transfer: 3000,
        saldo: 1500,
        mlc: 6,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_165_DIAMONDS_40",
      },
      {
        amount: "172 💎",
        transfer: 3000,
        saldo: 1500,
        mlc: 6,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_172_DIAMONDS_41",
      },
      {
        amount: "257 💎",
        transfer: 4500,
        saldo: 2250,
        mlc: 9,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_257_DIAMONDS_42",
      },
      {
        amount: "275 💎",
        transfer: 4500,
        saldo: 2250,
        mlc: 9,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_275_DIAMONDS_43",
      },
      {
        amount: "343 💎",
        transfer: 6000,
        saldo: 3000,
        mlc: 12,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_343_DIAMONDS_44",
      },
      {
        amount: "344 💎",
        transfer: 6000,
        saldo: 3000,
        mlc: 12,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_344_DIAMONDS_45",
      },
      {
        amount: "429 💎",
        transfer: 7000,
        saldo: 3500,
        mlc: 14,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_429_DIAMONDS_46",
      },
      {
        amount: "430 💎",
        transfer: 7500,
        saldo: 3750,
        mlc: 15,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_430_DIAMONDS_47",
      },
      {
        amount: "514 💎",
        transfer: 8500,
        saldo: 4250,
        mlc: 17,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_514_DIAMONDS_48",
      },
      {
        amount: "516 💎",
        transfer: 9000,
        saldo: 4500,
        mlc: 18,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_516_DIAMONDS_49",
      },
      {
        amount: "565 💎",
        transfer: 9500,
        saldo: 4750,
        mlc: 19,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_565_DIAMONDS_50",
      },
      {
        amount: "600 💎",
        transfer: 10000,
        saldo: 5000,
        mlc: 20,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_600_DIAMONDS_51",
      },
      {
        amount: "602 💎",
        transfer: 10500,
        saldo: 5250,
        mlc: 21,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_602_DIAMONDS_52",
      },
      {
        amount: "706 💎",
        transfer: 11500,
        saldo: 5750,
        mlc: 23,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_706_DIAMONDS_53",
      },
      {
        amount: "792 💎",
        transfer: 13000,
        saldo: 6500,
        mlc: 26,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_792_DIAMONDS_54",
      },
      {
        amount: "878 💎",
        transfer: 14500,
        saldo: 7250,
        mlc: 29,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_878_DIAMONDS_55",
      },
      {
        amount: "963 💎",
        transfer: 16000,
        saldo: 8000,
        mlc: 32,
        serviceCode: "TOPUP_MOBILE_LEGENDS_3_963_DIAMONDS_56",
      },
    ],
  },

  pubg: {
    name: "PUBG Mobile",
    icon: "🔫",
    idLabel: "ID del jugador",
    packages: [
      {
        amount: "60 UC",
        transfer: 1000,
        saldo: 500,
        mlc: 2,
        serviceCode: "TOPUP_PUBG_MOBILE_7_60_UC_404",
      },
      {
        amount: "325 UC",
        transfer: 5000,
        saldo: 2500,
        mlc: 10,
        serviceCode: "TOPUP_PUBG_MOBILE_7_325_UC_405",
      },
      {
        amount: "660 UC",
        transfer: 10000,
        saldo: 5000,
        mlc: 20,
        serviceCode: "TOPUP_PUBG_MOBILE_7_660_UC_406",
      },
      {
        amount: "1,800 UC",
        transfer: 25000,
        saldo: 12500,
        mlc: 50,
        serviceCode: "TOPUP_PUBG_MOBILE_7_1800_UC_407",
      },
      {
        amount: "3,850 UC",
        transfer: 50000,
        saldo: 25000,
        mlc: 100,
        serviceCode: "TOPUP_PUBG_MOBILE_7_3850_UC_408",
      },
      {
        amount: "8,100 UC",
        transfer: 100000,
        saldo: 50000,
        mlc: 200,
        serviceCode: "TOPUP_PUBG_MOBILE_7_8100_UC_409",
      },
    ],
  },
};
const paymentMethods = [
  { id: "transfer", name: "Transfermóvil" },
  { id: "saldo", name: "Saldo móvil" },
  { id: "mlc", name: "MLC" },
];

function formatPrice(value) {
  return Number.isInteger(value)
    ? value.toLocaleString("es-CU")
    : value.toFixed(2);
}

function App() {
  const [gameId, setGameId] = useState("freeFire");
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [packageIndex, setPackageIndex] = useState(0);
  const [payment, setPayment] = useState("transfer");
  const [showOrder, setShowOrder] = useState(false);

  const game = games[gameId];
  const selectedPackage = game.packages[packageIndex];

  const price = useMemo(() => {
    if (payment === "transfer") return selectedPackage.transfer;
    if (payment === "saldo") return selectedPackage.saldo;
    return selectedPackage.mlc;
  }, [selectedPackage, payment]);

  const paymentName =
    paymentMethods.find((method) => method.id === payment)?.name || "";

  const [orderNumber] = useState(
    () => `RD-${Date.now().toString().slice(-8)}`
  );

  function changeGame(value) {
    setGameId(value);
    setPackageIndex(0);
    setPlayerId("");
    setZoneId("");
    setShowOrder(false);
  }

  function submitOrder(event) {
    event.preventDefault();

    if (!playerId.trim()) {
      alert("Por favor, introduce el ID del jugador.");
      return;
    }

    if (gameId === "mobileLegends" && !zoneId.trim()) {
      alert("Por favor, introduce el Zone ID.");
      return;
    }

    setShowOrder(true);
  }

  async function sendWhatsAppOrder() {
  try {
    const referenceId = `RD-${Date.now()}`;

    const orderData = {
      service_code: selectedPackage.serviceCode,
      reference_id: referenceId,
      quantity: 1,
      user_id: playerId.trim(),
    };

    if (gameId === "mobileLegends") {
      orderData.server_id = zoneId.trim();
    }

    const response = await fetch(
      "https://recargas-diamantes.onrender.com/api/order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    const data = await response.json();

    console.log("Respuesta de FlashTopup:", data);

    if (!response.ok || data.success === false || data.ok === false) {
      alert(
        "No se pudo crear la orden. Revisa los datos e inténtalo nuevamente."
      );
      return;
    }

    const priceText =
      payment === "mlc"
        ? `${formatPrice(price)} MLC`
        : `${formatPrice(price)} CUP`;

    const message = [
      "🛒 NUEVO PEDIDO - RECARGAS DIAMANTES",
      "",
      `📋 Pedido: ${referenceId}`,
      `🎮 Juego: ${game.name}`,
      `💎 Paquete: ${selectedPackage.amount}`,
      `👤 ID del jugador: ${playerId}`,
      gameId === "mobileLegends"
        ? `🆔 Zone ID: ${zoneId}`
        : "",
      `💳 Método de pago: ${paymentName}`,
      `💰 Total: ${priceText}`,
      "",
      "Hola, quiero realizar esta recarga. Por favor, indícame cómo continuar con el pago.",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.location.href = url;
  } catch (error) {
    console.error("Error creando pedido:", error);

    alert(
      "No se pudo conectar con el servidor. Inténtalo nuevamente."
    );
  }
}
  return (
    <div className="app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f4f7fb;
          color: #172033;
        }

        button,
        input {
          font: inherit;
        }

        .app {
          min-height: 100vh;
        }

        .hero {
          background: linear-gradient(135deg, #111827, #2563eb);
          color: white;
          padding: 42px 20px 70px;
        }

        .container {
          width: min(100%, 1050px);
          margin: 0 auto;
        }

        .brand {
          text-align: center;
        }

        .brand h1 {
          margin: 0;
          font-size: clamp(32px, 7vw, 54px);
          font-weight: 900;
        }

        .brand p {
          margin: 12px auto 0;
          max-width: 650px;
          font-size: 17px;
          line-height: 1.5;
          opacity: .9;
        }

        .card {
          background: white;
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 18px 50px rgba(15, 23, 42, .12);
          margin-top: -35px;
          position: relative;
        }

        .section {
          margin-bottom: 28px;
        }

        .section h2 {
          margin: 0 0 14px;
          font-size: 21px;
        }

        .games {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .game {
          border: 2px solid #e5e7eb;
          background: #fff;
          border-radius: 16px;
          padding: 18px 12px;
          cursor: pointer;
          text-align: center;
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
          display: block;
          font-size: 32px;
          margin-bottom: 7px;
        }

        .game-name {
          font-weight: 800;
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
        }

        input:focus {
          border-color: #2563eb;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .packages {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .package {
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 14px;
          padding: 14px 8px;
          cursor: pointer;
          text-align: center;
          font-weight: 800;
        }

        .package.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .payments {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .payment {
          border: 2px solid #e5e7eb;
          border-radius: 15px;
          padding: 17px 10px;
          cursor: pointer;
          background: white;
          text-align: center;
        }

        .payment.active {
          border-color: #16a34a;
          background: #f0fdf4;
        }

        .payment strong {
          display: block;
          margin-bottom: 5px;
        }

        .price {
          font-size: 19px;
          font-weight: 900;
        }

        .submit {
          width: 100%;
          border: 0;
          border-radius: 15px;
          background: #2563eb;
          color: white;
          padding: 17px;
          font-size: 18px;
          font-weight: 900;
          cursor: pointer;
        }

        .submit:hover {
          background: #1d4ed8;
        }

        .order {
          margin-top: 25px;
          border-radius: 18px;
          padding: 20px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .order h2 {
          margin-top: 0;
        }

        .order-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 9px 0;
          border-bottom: 1px solid #dcfce7;
        }

        .order-row:last-child {
          border-bottom: 0;
        }

        .whatsapp {
          width: 100%;
          margin-top: 18px;
          border: 0;
          border-radius: 14px;
          padding: 16px;
          background: #25d366;
          color: white;
          font-weight: 900;
          font-size: 17px;
          cursor: pointer;
        }

        .whatsapp:hover {
          background: #1ebe5d;
        }

        .contact {
          text-align: center;
          margin-top: 28px;
          padding: 25px;
          background: #f8fafc;
          border-radius: 18px;
        }

        .contact h2 {
          margin-top: 0;
        }

        .contact p {
          line-height: 1.5;
          color: #4b5563;
        }

        footer {
          text-align: center;
          padding: 30px 15px;
          color: #6b7280;
          font-size: 14px;
        }

        @media (max-width: 800px) {
          .games {
            grid-template-columns: 1fr;
          }

          .packages {
            grid-template-columns: repeat(2, 1fr);
          }

          .payments {
            grid-template-columns: 1fr;
          }

          .two-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="hero">
        <div className="container brand">
          <h1>💎 Recargas Diamantes</h1>
          <p>
            Recarga tus juegos de forma rápida y sencilla.
            Selecciona tu juego, paquete y método de pago.
          </p>
        </div>
      </header>

      <main className="container">
        <div className="card">
          <form onSubmit={submitOrder}>
            <section className="section">
              <h2>🎮 Selecciona tu juego</h2>

              <div className="games">
                {Object.entries(games).map(([key, item]) => (
                  <button
                    type="button"
                    className={`game ${gameId === key ? "active" : ""}`}
                    key={key}
                    onClick={() => changeGame(key)}
                  >
                    <span className="game-icon">{item.icon}</span>
                    <span className="game-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>👤 Datos del jugador</h2>

              <div className="two-columns">
                <div>
                  <label htmlFor="playerId">{game.idLabel}</label>
                  <input
                    id="playerId"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Introduce el ID"
                  />
                </div>

                {gameId === "mobileLegends" && (
                  <div>
                    <label htmlFor="zoneId">{game.zoneLabel}</label>
                    <input
                      id="zoneId"
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      placeholder="Introduce el Zone ID"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="section">
              <h2>💎 Selecciona tu paquete</h2>

              <div className="packages">
                {game.packages.map((item, index) => (
                  <button
                    type="button"
                    key={item.amount}
                    className={`package ${
                      packageIndex === index ? "active" : ""
                    }`}
                    onClick={() => {
                      setPackageIndex(index);
                      setShowOrder(false);
                    }}
                  >
                    {item.amount}
                  </button>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>💳 Método de pago</h2>

              <div className="payments">
                {paymentMethods.map((method) => {
                  const methodPrice =
                    method.id === "transfer"
                      ? selectedPackage.transfer
                      : method.id === "saldo"
                      ? selectedPackage.saldo
                      : selectedPackage.mlc;

                  return (
                    <button
                      type="button"
                      key={method.id}
                      className={`payment ${
                        payment === method.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setPayment(method.id);
                        setShowOrder(false);
                      }}
                    >
                      <strong>{method.name}</strong>

                      <span className="price">
                        {formatPrice(methodPrice)}
                        {method.id === "mlc" ? " MLC" : " CUP"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <button className="submit" type="submit">
              Continuar con el pedido →
            </button>
          </form>

          {showOrder && (
            <section className="order">
              <h2>✅ Pedido preparado</h2>

              <div className="order-row">
                <span>Número de pedido</span>
                <strong>{orderNumber}</strong>
              </div>

              <div className="order-row">
                <span>Juego</span>
                <strong>{game.name}</strong>
              </div>

              <div className="order-row">
                <span>Paquete</span>
                <strong>{selectedPackage.amount}</strong>
              </div>

              <div className="order-row">
                <span>ID</span>
                <strong>{playerId}</strong>
              </div>

              {gameId === "mobileLegends" && (
                <div className="order-row">
                  <span>Zone ID</span>
                  <strong>{zoneId}</strong>
                </div>
              )}

              <div className="order-row">
                <span>Método de pago</span>
                <strong>{paymentName}</strong>
              </div>

              <div className="order-row">
                <span>Total</span>
                <strong>
                  {formatPrice(price)}
                  {payment === "mlc" ? " MLC" : " CUP"}
                </strong>
              </div>

              <button
                className="whatsapp"
                type="button"
                onClick={sendWhatsAppOrder}
              >
                📲 Enviar pedido por WhatsApp
              </button>
            </section>
          )}

          <section className="contact">
            <h2>🎮 ¿Quieres recargar otro juego?</h2>

            <p>
              Si el juego que buscas no aparece en nuestra lista,
              contacta con el administrador y te ayudaremos con tu recarga.
            </p>

            <p>
              📱 WhatsApp: <strong>+53 5050 4941</strong>
            </p>
          </section>
        </div>
      </main>

      <footer>
        © 2026 Recargas Diamantes · Servicio de recargas digitales
      </footer>
    </div>
  );
}

export default App;