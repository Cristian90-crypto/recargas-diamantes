import React, { useMemo, useState } from "react";

const games = {
  freeFire: {
    name: "Free Fire",
    icon: "🔥",
    idLabel: "ID del jugador",
    packages: [
      { amount: "100 💎", transfer: 1000, saldo: 500, mlc: 2 },
      { amount: "310 💎", transfer: 3000, saldo: 1500, mlc: 6 },
      { amount: "520 💎", transfer: 4600, saldo: 2300, mlc: 9 },
      { amount: "1,060 💎", transfer: 10100, saldo: 5000, mlc: 20 },
      { amount: "2,180 💎", transfer: 20000, saldo: 10000, mlc: 40 },
    ],
  },

  mobileLegends: {
    name: "Mobile Legends",
    icon: "⚔️",
    idLabel: "ID del jugador",
    zoneLabel: "Zone ID",
    packages: [
      { amount: "88 💎", transfer: 1100, saldo: 550, mlc: 2 },
      { amount: "146 💎", transfer: 1650, saldo: 700, mlc: 3 },
      { amount: "293 💎", transfer: 2750, saldo: 1250, mlc: 5.2 },
      { amount: "586 💎", transfer: 5500, saldo: 2750, mlc: 10 },
    ],
  },

  pubg: {
    name: "PUBG Mobile",
    icon: "🔫",
    idLabel: "ID del jugador",
    packages: [
      { amount: "60 UC", transfer: 1000, saldo: 500, mlc: 2 },
      { amount: "325 UC", transfer: 5120, saldo: 2500, mlc: 10 },
      { amount: "660 UC", transfer: 10230, saldo: 5000, mlc: 20 },
    ],
  },
};

const paymentMethods = [
  { id: "transfer", name: "Transfermóvil", suffix: " CUP" },
  { id: "saldo", name: "Saldo móvil", suffix: " CUP" },
  { id: "mlc", name: "MLC", suffix: " MLC" },
];

function formatPrice(value) {
  return Number.isInteger(value) ? value.toLocaleString("es-CU") : value.toFixed(2);
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

  const orderNumber = useMemo(() => {
    return `RD-${Date.now().toString().slice(-8)}`;
  }, [showOrder]);

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

  function copyOrder() {
    const text = [
      `Pedido: ${orderNumber}`,
      `Juego: ${game.name}`,
      `Paquete: ${selectedPackage.amount}`,
      `ID: ${playerId}`,
      gameId === "mobileLegends" ? `Zone ID: ${zoneId}` : "",
      `Método: ${paymentName}`,
      `Precio: ${formatPrice(price)}${payment === "mlc" ? " MLC" : " CUP"}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard?.writeText(text);
    alert("Datos del pedido copiados.");
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
        input,
        select {
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

        .copy {
          margin-top: 15px;
          border: 0;
          border-radius: 12px;
          padding: 13px 17px;
          background: #172033;
          color: white;
          font-weight: 800;
          cursor: pointer;
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

        .contact-button {
          display: inline-block;
          text-decoration: none;
          background: #111827;
          color: white;
          padding: 13px 20px;
          border-radius: 12px;
          font-weight: 800;
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
                <span>Pago</span>
                <strong>{paymentName}</strong>
              </div>

              <div className="order-row">
                <span>Total</span>
                <strong>
                  {formatPrice(price)}
                  {payment === "mlc" ? " MLC" : " CUP"}
                </strong>
              </div>

              <button className="copy" type="button" onClick={copyOrder}>
                📋 Copiar datos del pedido
              </button>
            </section>
          )}

          <section className="contact">
            <h2>🎮 ¿Quieres recargar otro juego?</h2>
            <p>
              Si el juego que buscas no aparece en nuestra lista,
              contacta con el administrador y te ayudaremos con tu recarga.
            </p>

            <a className="contact-button" href="mailto:admin@recargas-diamantes.com">
              Contactar al administrador
            </a>
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