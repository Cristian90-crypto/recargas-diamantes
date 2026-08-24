import React, { useEffect, useState } from "react";

const API_BASE = "https://recargas-diamantes.onrender.com";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("es-CU", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getStatusLabel(status) {
  const labels = {
    PENDING_PAYMENT: "🟡 Esperando pago",
    PAYMENT_RECEIVED: "🟢 Pago recibido",
    RECHARGE_PROCESSING: "🔄 Procesando recarga",
    RECHARGE_SUBMITTED: "📤 Recarga enviada",
    RECHARGE_FAILED: "🔴 Recarga fallida",
    REJECTED: "❌ Rechazado",
  };

  return labels[status] || status || "—";
}

function formatAmount(order) {
  if (order.payment_method === "mlc") {
    return `${order.sale_amount} MLC`;
  }

  return `${Number(order.sale_amount || 0).toLocaleString(
    "es-CU"
  )} CUP`;
}

export default function Admin() {
  const [secret, setSecret] = useState(
    localStorage.getItem("admin_secret") || ""
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("admin_secret"))
  );

  async function apiRequest(url, options = {}) {
    const response = await fetch(
      `${API_BASE}${url}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Secret": secret,
          ...(options.headers || {}),
        },
      }
    );

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
          `Error HTTP ${response.status}`
      );
    }

    return data;
  }

  async function loadOrders() {
    if (!secret.trim()) {
      setError("Escribe tu ADMIN_SECRET.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await apiRequest(
        "/api/admin/orders"
      );

      if (!data?.ok) {
        throw new Error(
          data?.error ||
            "No se pudieron cargar los pedidos."
        );
      }

      setOrders(data.orders || []);

      localStorage.setItem(
        "admin_secret",
        secret
      );

      setLoggedIn(true);
    } catch (err) {
      console.error(err);

      setLoggedIn(false);

      setError(
        err.message ||
          "No se pudieron cargar los pedidos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function markPaymentReceived(orderId) {
    if (
      !window.confirm(
        "¿Confirmas que recibiste el pago de este pedido?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await apiRequest(
        `/api/admin/orders/${encodeURIComponent(
          orderId
        )}/payment-received`,
        {
          method: "POST",
        }
      );

      setMessage(
        "✅ Pago marcado como recibido."
      );

      await loadOrders();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "No se pudo confirmar el pago."
      );
    } finally {
      setLoading(false);
    }
  }

  async function authorizeRecharge(orderId) {
    if (
      !window.confirm(
        "⚠️ ATENCIÓN\n\nEsto enviará la recarga a Shop2TopUp.\n\n¿Confirmas que quieres autorizarla?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await apiRequest(
        `/api/admin/orders/${encodeURIComponent(
          orderId
        )}/authorize`,
        {
          method: "POST",
        }
      );

      setMessage(
        "🚀 Recarga enviada correctamente a Shop2TopUp."
      );

      await loadOrders();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "No se pudo autorizar la recarga."
      );
    } finally {
      setLoading(false);
    }
  }

  async function rejectOrder(orderId) {
    const reason =
      window.prompt(
        "Motivo del rechazo:",
        "Pago no confirmado."
      );

    if (reason === null) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await apiRequest(
        `/api/admin/orders/${encodeURIComponent(
          orderId
        )}/reject`,
        {
          method: "POST",
          body: JSON.stringify({
            reason:
              reason.trim() ||
              "Pago no confirmado.",
          }),
        }
      );

      setMessage(
        "❌ Pedido rechazado."
      );

      await loadOrders();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "No se pudo rechazar el pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "admin_secret"
    );

    setSecret("");
    setOrders([]);
    setLoggedIn(false);
    setError("");
    setMessage("");
  }

  useEffect(() => {
    const savedSecret =
      localStorage.getItem(
        "admin_secret"
      );

    if (savedSecret) {
      setSecret(savedSecret);
    }
  }, []);

  return (
    <div className="admin-page">
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
          background: #f1f5f9;
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
          opacity: .6;
          cursor: not-allowed;
        }

        .admin-page {
          min-height: 100vh;
          padding: 20px;
        }

        .admin-container {
          width: min(
            100%,
            1100px
          );
          margin: 0 auto;
        }

        .header {
          background:
            linear-gradient(
              135deg,
              #111827,
              #1e3a8a
            );
          color: white;
          padding: 25px;
          border-radius: 20px;
          margin-bottom: 20px;
          box-shadow:
            0 12px 35px
            rgba(15,23,42,.15);
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .header h1 {
          margin: 0;
          font-size: 25px;
        }

        .header p {
          margin: 7px 0 0;
          opacity: .8;
        }

        .logout {
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          background: #ef4444;
          color: white;
          font-weight: 700;
        }

        .login-card {
          max-width: 500px;
          margin: 50px auto;
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow:
            0 15px 45px
            rgba(15,23,42,.1);
        }

        .login-card h2 {
          margin-top: 0;
        }

        .login-card p {
          color: #64748b;
          line-height: 1.5;
        }

        .secret-input {
          width: 100%;
          padding: 15px;
          border:
            2px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          margin-bottom: 12px;
        }

        .secret-input:focus {
          border-color: #2563eb;
        }

        .login-button,
        .refresh-button {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 14px;
          background: #2563eb;
          color: white;
          font-weight: 800;
        }

        .refresh-button {
          width: auto;
          padding:
            11px 16px;
        }

        .alert {
          padding: 14px;
          border-radius: 12px;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .error {
          background: #fef2f2;
          color: #b91c1c;
          border:
            1px solid #fecaca;
        }

        .success {
          background: #ecfdf5;
          color: #047857;
          border:
            1px solid #a7f3d0;
        }

        .toolbar {
          background: white;
          padding: 16px;
          border-radius: 15px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          box-shadow:
            0 8px 25px
            rgba(15,23,42,.06);
        }

        .count {
          font-weight: 800;
        }

        .orders {
          display: grid;
          gap: 18px;
        }

        .order {
          background: white;
          border-radius: 18px;
          padding: 20px;
          box-shadow:
            0 10px 30px
            rgba(15,23,42,.07);
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
          border-bottom:
            1px solid #e5e7eb;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }

        .order-id {
          font-size: 12px;
          color: #64748b;
          word-break: break-all;
        }

        .status {
          padding: 8px 11px;
          border-radius: 10px;
          background: #f1f5f9;
          font-size: 13px;
          font-weight: 800;
          text-align: right;
        }

        .order-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 12px;
        }

        .info {
          background: #f8fafc;
          border-radius: 11px;
          padding: 12px;
        }

        .info span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .info strong {
          display: block;
          word-break: break-word;
        }

        .amount {
          color: #2563eb;
          font-size: 18px;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
          padding-top: 18px;
          border-top:
            1px solid #e5e7eb;
        }

        .action {
          border: none;
          border-radius: 11px;
          padding: 12px 15px;
          color: white;
          font-weight: 800;
        }

        .payment-button {
          background: #16a34a;
        }

        .authorize-button {
          background: #2563eb;
        }

        .reject-button {
          background: #dc2626;
        }

        .empty {
          background: white;
          border-radius: 18px;
          padding: 45px 20px;
          text-align: center;
          color: #64748b;
        }

        .loading {
          text-align: center;
          padding: 30px;
          color: #64748b;
        }

        @media (max-width: 600px) {
          .admin-page {
            padding: 10px;
          }

          .header {
            padding: 18px;
          }

          .header-row {
            align-items: flex-start;
          }

          .header h1 {
            font-size: 21px;
          }

          .order-grid {
            grid-template-columns: 1fr;
          }

          .order-top {
            flex-direction: column;
          }

          .status {
            text-align: left;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .refresh-button {
            width: 100%;
          }

          .action {
            width: 100%;
          }
        }
      `}</style>

      {!loggedIn ? (
        <div className="admin-container">
          <div className="login-card">
            <h2>🔐 Panel de administración</h2>

            <p>
              Introduce tu ADMIN_SECRET para
              acceder a los pedidos de
              Recargas Diamantes.
            </p>

            {error && (
              <div className="alert error">
                ❌ {error}
              </div>
            )}

            <input
              className="secret-input"
              type="password"
              value={secret}
              onChange={(e) =>
                setSecret(e.target.value)
              }
              placeholder="ADMIN_SECRET"
              autoComplete="off"
            />

            <button
              className="login-button"
              onClick={loadOrders}
              disabled={loading}
            >
              {loading
                ? "🔄 Conectando..."
                : "🔐 Entrar al panel"}
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-container">
          <header className="header">
            <div className="header-row">
              <div>
                <h1>
                  💎 Recargas Diamantes
                </h1>

                <p>
                  Panel de administración
                </p>
              </div>

              <button
                className="logout"
                onClick={logout}
              >
                Salir
              </button>
            </div>
          </header>

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

          <div className="toolbar">
            <span className="count">
              📋 Pedidos: {orders.length}
            </span>

            <button
              className="refresh-button"
              onClick={loadOrders}
              disabled={loading}
            >
              {loading
                ? "🔄 Cargando..."
                : "🔄 Actualizar"}
            </button>
          </div>

          {loading && orders.length === 0 ? (
            <div className="loading">
              🔄 Cargando pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div className="empty">
              <h2>
                📭 No hay pedidos
              </h2>

              <p>
                Cuando un cliente realice
                un pedido aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="orders">
              {orders.map((order) => (
                <div
                  className="order"
                  key={order.order_id}
                >
                  <div className="order-top">
                    <div>
                      <strong>
                        🧾 Pedido
                      </strong>

                      <div className="order-id">
                        {order.order_id}
                      </div>
                    </div>

                    <div className="status">
                      {getStatusLabel(
                        order.status
                      )}
                    </div>
                  </div>

                  <div className="order-grid">
                    <div className="info">
                      <span>
                        🎮 Juego
                      </span>

                      <strong>
                        {order.game_name ||
                          order.game ||
                          "—"}
                      </strong>
                    </div>

                    <div className="info">
                      <span>
                        💎 Paquete
                      </span>

                      <strong>
                        {order.package ||
                          "—"}
                      </strong>
                    </div>

                    <div className="info">
                      <span>
                        👤 ID jugador
                      </span>

                      <strong>
                        {order.player_id ||
                          "—"}
                      </strong>
                    </div>

                    {order.zone_id && (
                      <div className="info">
                        <span>
                          🆔 Zone ID
                        </span>

                        <strong>
                          {order.zone_id}
                        </strong>
                      </div>
                    )}

                    {order.player_name && (
                      <div className="info">
                        <span>
                          👑 Nombre
                        </span>

                        <strong>
                          {order.player_name}
                        </strong>
                      </div>
                    )}

                    <div className="info">
                      <span>
                        💳 Método de pago
                      </span>

                      <strong>
                        {order.payment_method ||
                          "—"}
                      </strong>
                    </div>

                    <div className="info">
                      <span>
                        💰 Total
                      </span>

                      <strong className="amount">
                        {formatAmount(
                          order
                        )}
                      </strong>
                    </div>

                    <div className="info">
                      <span>
                        🕐 Fecha
                      </span>

                      <strong>
                        {formatDate(
                          order.created_at
                        )}
                      </strong>
                    </div>
                  </div>

                  {order.provider_order_id && (
                    <div
                      className="info"
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      <span>
                        Shop2TopUp
                        Order ID
                      </span>

                      <strong>
                        {
                          order.provider_order_id
                        }
                      </strong>
                    </div>
                  )}

                  <div className="actions">
                    {order.status ===
                      "PENDING_PAYMENT" && (
                      <>
                        <button
                          className="action payment-button"
                          onClick={() =>
                            markPaymentReceived(
                              order.order_id
                            )
                          }
                          disabled={loading}
                        >
                          ✅ Pago recibido
                        </button>

                        <button
                          className="action reject-button"
                          onClick={() =>
                            rejectOrder(
                              order.order_id
                            )
                          }
                          disabled={loading}
                        >
                          ❌ Rechazar
                        </button>
                      </>
                    )}

                    {order.status ===
                      "PAYMENT_RECEIVED" && (
                      <button
                        className="action authorize-button"
                        onClick={() =>
                          authorizeRecharge(
                            order.order_id
                          )
                        }
                        disabled={loading}
                      >
                        🚀 Autorizar recarga
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}