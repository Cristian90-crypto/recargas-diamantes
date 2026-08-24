import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://recargas-diamantes.onrender.com";
const STORAGE_KEY = "recargas_admin_secret";

const STATUS_LABELS = {
  PENDING_PAYMENT: "🟡 Pendiente de pago",
  PAYMENT_RECEIVED: "🟢 Pago recibido",
  RECHARGE_PROCESSING: "🔵 Procesando recarga",
  RECHARGE_SUBMITTED: "🔵 Recarga enviada",
  RECHARGE_FAILED: "🔴 Recarga fallida",
  REJECTED: "⚫ Rechazado",
};

function formatMoney(order) {
  if (order?.payment_method === "mlc") {
    return `${Number(order.sale_amount || 0).toFixed(2)} MLC`;
  }

  return `${Math.round(
    Number(order.sale_amount || 0)
  ).toLocaleString("es-CU")} CUP`;
}

function formatDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString("es-CU", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function gameLabel(order) {
  return order?.game_name || order?.game || "Juego";
}

function packageLabel(order) {
  if (order?.game === "pubg") {
    return `${Number(order.package || 0).toLocaleString(
      "es-CU"
    )} UC`;
  }

  return `${Number(order.package || 0).toLocaleString(
    "es-CU"
  )} 💎`;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Respuesta inválida del servidor. HTTP ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error || `Error HTTP ${response.status}`
    );
  }

  return data;
}

export default function Admin() {
  const [secret, setSecret] = useState(
    () =>
      sessionStorage.getItem(STORAGE_KEY) || ""
  );

  const [loggedIn, setLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lastRefresh, setLastRefresh] = useState("");

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "PENDING_PAYMENT"
      ).length,
    [orders]
  );

  const paymentReceivedCount = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "PAYMENT_RECEIVED"
      ).length,
    [orders]
  );

  const activeCount = useMemo(
    () =>
      orders.filter((order) =>
        [
          "RECHARGE_PROCESSING",
          "RECHARGE_SUBMITTED",
        ].includes(order.status)
      ).length,
    [orders]
  );

  useEffect(() => {
    if (!loggedIn) return;

    loadOrders();

    const timer = setInterval(
      loadOrders,
      15000
    );

    return () =>
      clearInterval(timer);
  }, [loggedIn]);

  async function loadOrders() {
    if (!secret) return;

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        `${API_BASE}/api/admin/orders`,
        {
          headers: {
            "X-Admin-Secret": secret,
          },
        }
      );

      if (!data?.ok) {
        throw new Error(
          data?.error ||
            "No se pudieron cargar los pedidos."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );

      setLastRefresh(
        new Date().toLocaleTimeString("es-CU")
      );

      setLoggedIn(true);
    } catch (err) {
      setLoggedIn(false);
      setOrders([]);

      setError(
        err.message ||
          "No se pudieron cargar los pedidos."
      );

      sessionStorage.removeItem(
        STORAGE_KEY
      );
    } finally {
      setLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!secret.trim()) {
      setError(
        "Escribe tu clave de administrador."
      );
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      secret.trim()
    );

    setSecret(secret.trim());
    setLoggedIn(true);
  }

  function logout() {
    sessionStorage.removeItem(
      STORAGE_KEY
    );

    setSecret("");
    setLoggedIn(false);
    setOrders([]);
    setMessage("");
    setError("");
  }

  function goStore() {
    window.location.hash = "";
  }

  async function performAction(
    orderId,
    action,
    successText
  ) {
    if (!orderId) return;

    try {
      setWorkingId(
        `${action}:${orderId}`
      );

      setError("");
      setMessage("");

      const data = await apiRequest(
        `${API_BASE}/api/admin/orders/${encodeURIComponent(
          orderId
        )}/${action}`,
        {
          method: "POST",

          headers: {
            "X-Admin-Secret": secret,
          },

          body:
            action === "reject"
              ? JSON.stringify({
                  reason:
                    "Pago no confirmado por el administrador.",
                })
              : JSON.stringify({}),
        }
      );

      if (!data?.ok) {
        throw new Error(
          data?.error ||
            "La operación no pudo completarse."
        );
      }

      setMessage(successText);

      await loadOrders();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo completar la operación."
      );
    } finally {
      setWorkingId("");
    }
  }

  async function authorize(orderId) {
    const confirmed =
      window.confirm(
        "¿Confirmas que ya recibiste el pago y quieres gastar el saldo de Shop2TopUp para realizar esta recarga?"
      );

    if (!confirmed) return;

    await performAction(
      orderId,
      "authorize",
      "🚀 Recarga autorizada y enviada a Shop2TopUp."
    );
  }

  async function reject(orderId) {
    const confirmed =
      window.confirm(
        "¿Quieres rechazar este pedido?"
      );

    if (!confirmed) return;

    await performAction(
      orderId,
      "reject",
      "Pedido rechazado."
    );
  }

  if (!loggedIn) {
    return (
      <div className="admin-page">
        <style>{styles}</style>

        <div className="login-card">
          <div className="logo">
            💎
          </div>

          <h1>
            Panel de administración
          </h1>

          <p>
            Recargas Diamantes
          </p>

          {error && (
            <div className="alert error">
              ❌ {error}
            </div>
          )}

          <form onSubmit={login}>
            <label>
              Clave de administrador
            </label>

            <input
              type="password"
              value={secret}
              onChange={(event) =>
                setSecret(
                  event.target.value
                )
              }
              placeholder="Introduce tu clave"
              autoComplete="current-password"
            />

            <button
              className="primary"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "🔄 Entrando..."
                : "🔐 Entrar al panel"}
            </button>
          </form>

          <button
            className="link-button"
            onClick={goStore}
            type="button"
          >
            ← Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <header className="admin-header">
        <div>
          <div className="eyebrow">
            💎 RECARGAS DIAMANTES
          </div>

          <h1>
            Panel de pedidos
          </h1>

          <p>
            Confirma pagos y autoriza
            las recargas.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="secondary"
            onClick={loadOrders}
            disabled={loading}
          >
            {loading
              ? "🔄 Actualizando..."
              : "🔄 Actualizar"}
          </button>

          <button
            className="danger-outline"
            onClick={logout}
          >
            Salir
          </button>
        </div>
      </header>

      <main className="admin-container">

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

        <div className="stats">

          <div className="stat">
            <span>
              🟡 Pendientes de pago
            </span>

            <strong>
              {pendingCount}
            </strong>
          </div>

          <div className="stat">
            <span>
              🟢 Pagos recibidos
            </span>

            <strong>
              {paymentReceivedCount}
            </strong>
          </div>

          <div className="stat">
            <span>
              🔵 En proceso
            </span>

            <strong>
              {activeCount}
            </strong>
          </div>

        </div>

        <div className="toolbar">
          <strong>
            {orders.length} pedido
            {orders.length === 1
              ? ""
              : "s"}
          </strong>

          <span>
            {lastRefresh
              ? `Última actualización: ${lastRefresh}`
              : ""}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="empty">
            <div>
              📭
            </div>

            <h2>
              No hay pedidos
            </h2>

            <p>
              Cuando un cliente cree
              un pedido aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="orders">

            {orders.map((order) => {

              const isWorking =
                workingId.endsWith(
                  `:${order.order_id}`
                );

              const currentAction =
                workingId.split(":")[0];

              return (
                <article
                  className="order-card"
                  key={order.order_id}
                >

                  <div className="order-top">

                    <div>
                      <span className="order-label">
                        PEDIDO
                      </span>

                      <code>
                        {order.order_id}
                      </code>
                    </div>

                    <span className="status">
                      {STATUS_LABELS[
                        order.status
                      ] ||
                        order.status}
                    </span>

                  </div>

                  <div className="order-grid">

                    <div>
                      <span>
                        🎮 Juego
                      </span>

                      <strong>
                        {gameLabel(order)}
                      </strong>
                    </div>

                    <div>
                      <span>
                        💎 Paquete
                      </span>

                      <strong>
                        {packageLabel(
                          order
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        👤 ID jugador
                      </span>

                      <strong>
                        {order.player_id}
                      </strong>
                    </div>

                    {order.zone_id && (
                      <div>
                        <span>
                          🆔 Zone ID
                        </span>

                        <strong>
                          {order.zone_id}
                        </strong>
                      </div>
                    )}

                    {order.player_name && (
                      <div>
                        <span>
                          👑 Nombre
                        </span>

                        <strong>
                          {order.player_name}
                        </strong>
                      </div>
                    )}

                    <div>
                      <span>
                        💳 Pago
                      </span>

                      <strong>
                        {order.payment_method}
                      </strong>
                    </div>

                    <div>
                      <span>
                        💰 Total
                      </span>

                      <strong className="money">
                        {formatMoney(
                          order
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        🕐 Creado
                      </span>

                      <strong>
                        {formatDate(
                          order.created_at
                        )}
                      </strong>
                    </div>

                  </div>

                  {order.recharge_error && (
                    <div className="error-box">
                      <strong>
                        Error de recarga:
                      </strong>{" "}
                      {order.recharge_error}
                    </div>
                  )}

                  {order.provider_order_id && (
                    <div className="provider-id">
                      Orden Shop2TopUp:{" "}
                      <code>
                        {order.provider_order_id}
                      </code>
                    </div>
                  )}

                  <div className="actions">

                    {order.status ===
                      "PENDING_PAYMENT" && (
                      <>
                        <button
                          className="success-button"
                          disabled={
                            isWorking
                          }
                          onClick={() =>
                            performAction(
                              order.order_id,
                              "payment-received",
                              "✅ Pago marcado como recibido."
                            )
                          }
                        >
                          {isWorking &&
                          currentAction ===
                            "payment-received"
                            ? "⏳ Procesando..."
                            : "✅ PAGO RECIBIDO"}
                        </button>

                        <button
                          className="reject-button"
                          disabled={
                            isWorking
                          }
                          onClick={() =>
                            reject(
                              order.order_id
                            )
                          }
                        >
                          {isWorking &&
                          currentAction ===
                            "reject"
                            ? "⏳..."
                            : "❌ RECHAZAR"}
                        </button>
                      </>
                    )}

                    {order.status ===
                      "PAYMENT_RECEIVED" && (
                      <>
                        <button
                          className="authorize-button"
                          disabled={
                            isWorking
                          }
                          onClick={() =>
                            authorize(
                              order.order_id
                            )
                          }
                        >
                          {isWorking &&
                          currentAction ===
                            "authorize"
                            ? "⏳ Enviando..."
                            : "🚀 AUTORIZAR RECARGA"}
                        </button>

                        <button
                          className="reject-button"
                          disabled={
                            isWorking
                          }
                          onClick={() =>
                            reject(
                              order.order_id
                            )
                          }
                        >
                          {isWorking &&
                          currentAction ===
                            "reject"
                            ? "⏳..."
                            : "❌ RECHAZAR"}
                        </button>
                      </>
                    )}

                    {order.status ===
                      "RECHARGE_PROCESSING" && (
                      <div className="waiting">
                        🔵 La recarga está siendo
                        procesada.
                      </div>
                    )}

                    {order.status ===
                      "RECHARGE_SUBMITTED" && (
                      <div className="waiting">
                        🔵 Recarga enviada a
                        Shop2TopUp.
                      </div>
                    )}

                    {order.status ===
                      "RECHARGE_FAILED" && (
                      <div className="waiting error-waiting">
                        🔴 La recarga falló.
                        Revisa el error antes
                        de intentar nuevamente.
                      </div>
                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

        <button
          className="store-button"
          onClick={goStore}
          type="button"
        >
          ← Volver a la tienda
        </button>

      </main>
    </div>
  );
}

const styles = `
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
  cursor: not-allowed;
  opacity: .6;
}

.admin-page {
  min-height: 100vh;
  padding-bottom: 50px;
}

.admin-header {
  background:
    linear-gradient(
      135deg,
      #111827,
      #1e3a8a
    );
  color: white;
  padding: 28px
    max(20px, calc((100% - 1100px) / 2));
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 1.5px;
  opacity: .8;
  font-weight: 800;
}

.admin-header h1 {
  margin: 7px 0;
  font-size: 30px;
}

.admin-header p {
  margin: 0;
  opacity: .85;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.admin-container {
  width:
    min(100% - 24px, 1100px);
  margin: 24px auto;
}

.login-card {
  width:
    min(calc(100% - 30px), 430px);
  margin: 60px auto;
  background: white;
  padding: 30px;
  border-radius: 24px;
  box-shadow:
    0 15px 50px
    rgba(15,23,42,.1);
  text-align: center;
}

.login-card .logo {
  width: 70px;
  height: 70px;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  border-radius: 20px;
  background: #eff6ff;
  font-size: 38px;
}

.login-card h1 {
  margin: 0 0 8px;
}

.login-card p {
  margin: 0 0 25px;
  color: #64748b;
}

.login-card form {
  text-align: left;
}

label {
  display: block;
  font-weight: 800;
  margin-bottom: 7px;
}

input {
  width: 100%;
  border:
    2px solid #e2e8f0;
  border-radius: 13px;
  padding: 15px;
  outline: none;
  margin-bottom: 14px;
}

input:focus {
  border-color: #2563eb;
}

.primary,
.secondary,
.danger-outline,
.link-button,
.store-button {
  border: 0;
  border-radius: 12px;
  padding: 13px 16px;
  font-weight: 800;
}

.primary {
  width: 100%;
  background: #2563eb;
  color: white;
}

.secondary {
  background: white;
  color: #1d4ed8;
}

.danger-outline {
  background:
    rgba(255,255,255,.12);
  color: white;
  border:
    1px solid
    rgba(255,255,255,.3);
}

.link-button {
  margin-top: 18px;
  background: transparent;
  color: #2563eb;
}

.alert {
  padding: 14px 16px;
  border-radius: 13px;
  margin-bottom: 18px;
  font-weight: 700;
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

.stats {
  display: grid;
  grid-template-columns:
    repeat(3,1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.stat {
  background: white;
  padding: 18px;
  border-radius: 17px;
  box-shadow:
    0 5px 25px
    rgba(15,23,42,.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.stat span {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.stat strong {
  font-size: 28px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 2px 15px;
  color: #64748b;
}

.orders {
  display: grid;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 8px 35px
    rgba(15,23,42,.07);
}

.order-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom:
    1px solid #e5e7eb;
}

.order-label {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

code {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;
  font-size: 12px;
  word-break: break-all;
}

.status {
  padding: 8px 11px;
  border-radius: 999px;
  background: #f1f5f9;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.order-grid {
  display: grid;
  grid-template-columns:
    repeat(2,1fr);
  gap: 12px;
  padding: 18px 0;
}

.order-grid div {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
}

.order-grid span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 5px;
}

.order-grid strong {
  display: block;
  word-break: break-word;
}

.money {
  color: #2563eb;
  font-size: 18px;
}

.provider-id {
  margin-bottom: 14px;
  color: #64748b;
  font-size: 13px;
}

.error-box {
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.actions button {
  border: 0;
  border-radius: 13px;
  padding: 14px 16px;
  font-weight: 900;
  flex: 1;
  min-width: 180px;
}

.success-button {
  background: #16a34a;
  color: white;
}

.authorize-button {
  background: #2563eb;
  color: white;
}

.reject-button {
  background: #fee2e2;
  color: #b91c1c;
}

.waiting {
  width: 100%;
  padding: 13px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 12px;
  font-weight: 700;
}

.error-waiting {
  background: #fef2f2;
  color: #b91c1c;
}

.empty {
  background: white;
  border-radius: 20px;
  padding: 45px 20px;
  text-align: center;
  color: #64748b;
}

.empty div {
  font-size: 45px;
}

.empty h2 {
  color: #172033;
  margin: 10px 0;
}

.store-button {
  display: block;
  margin: 24px auto 0;
  background: white;
  color: #2563eb;
  box-shadow:
    0 5px 20px
    rgba(15,23,42,.05);
}

@media (max-width: 700px) {

  .admin-header {
    flex-direction: column;
    align-items: stretch;
    padding: 24px 18px;
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions button {
    flex: 1;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .order-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    gap: 5px;
  }
}
`;