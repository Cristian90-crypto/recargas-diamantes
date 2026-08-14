import React, { useState } from "react";

function App() {
  const [juego, setJuego] = useState("Free Fire");
  const [idJugador, setIdJugador] = useState("");

  const paquetes = [
    { diamantes: 100, precio: "2.00 USD" },
    { diamantes: 310, precio: "5.00 USD" },
    { diamantes: 520, precio: "8.00 USD" },
    { diamantes: 1060, precio: "15.00 USD" },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>💎 Recargas Diamantes</h1>
        <p style={styles.subtitle}>Recargas rápidas y fáciles</p>
      </header>

      <main style={styles.container}>
        <section style={styles.card}>
          <h2>Selecciona tu juego</h2>

          <select
            value={juego}
            onChange={(e) => setJuego(e.target.value)}
            style={styles.input}
          >
            <option>Free Fire</option>
            <option>Free Fire MAX</option>
          </select>

          <label style={styles.label}>ID del jugador</label>

          <input
            type="text"
            placeholder="Escribe tu ID de jugador"
            value={idJugador}
            onChange={(e) => setIdJugador(e.target.value)}
            style={styles.input}
          />

          <h2>Elige tu paquete</h2>

          <div style={styles.packages}>
            {paquetes.map((paquete) => (
              <button
                key={paquete.diamantes}
                style={styles.package}
                onClick={() =>
                  alert(
                    `Juego: ${juego}\nID: ${idJugador || "No indicado"}\nPaquete: ${paquete.diamantes} diamantes\nPrecio: ${paquete.precio}`
                  )
                }
              >
                <span style={styles.diamonds}>💎</span>
                <strong>{paquete.diamantes} diamantes</strong>
                <span>{paquete.precio}</span>
              </button>
            ))}
          </div>
        </section>

        <section style={styles.info}>
          <h2>¿Cómo funciona?</h2>
          <p>1️⃣ Selecciona tu juego.</p>
          <p>2️⃣ Introduce tu ID de jugador.</p>
          <p>3️⃣ Elige la cantidad de diamantes.</p>
          <p>4️⃣ Continúa con el proceso de pago.</p>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>© 2026 Recargas Diamantes</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111827",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    textAlign: "center",
    padding: "40px 20px",
    background: "#1f2937",
  },

  logo: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    color: "#d1d5db",
    fontSize: "16px",
  },

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "25px 15px",
  },

  card: {
    background: "#1f2937",
    padding: "25px",
    borderRadius: "16px",
  },

  label: {
    display: "block",
    marginTop: "20px",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #4b5563",
    background: "#111827",
    color: "white",
    fontSize: "16px",
    marginBottom: "15px",
  },

  packages: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  package: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "18px 10px",
    borderRadius: "12px",
    border: "1px solid #4b5563",
    background: "#374151",
    color: "white",
    fontSize: "15px",
    cursor: "pointer",
  },

  diamonds: {
    fontSize: "30px",
  },

  info: {
    marginTop: "20px",
    padding: "20px",
    background: "#1f2937",
    borderRadius: "16px",
  },

  footer: {
    textAlign: "center",
    padding: "25px",
    color: "#9ca3af",
  },
};

export default App;
