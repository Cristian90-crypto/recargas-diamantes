import React, { useState } from "react";

function App() {
  const [idJugador, setIdJugador] = useState("");
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);

  const paquetes = [
    { diamantes: 100, precio: "2.00 USD" },
    { diamantes: 310, precio: "5.00 USD" },
    { diamantes: 520, precio: "8.00 USD" },
    { diamantes: 1060, precio: "15.00 USD" },
    { diamantes: 2180, precio: "30.00 USD" },
    { diamantes: 5600, precio: "70.00 USD" },
  ];

  const seleccionarPaquete = (paquete) => {
    setPaqueteSeleccionado(paquete);
  };

  const continuar = () => {
    if (!idJugador.trim()) {
      alert("Por favor, escribe tu ID de jugador.");
      return;
    }

    if (!paqueteSeleccionado) {
      alert("Selecciona primero un paquete de diamantes.");
      return;
    }

    alert(
      `Pedido preparado:\n\nID: ${idJugador}\nDiamantes: ${paqueteSeleccionado.diamantes}\nPrecio: ${paqueteSeleccionado.precio}`
    );
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>💎</div>
        <h1 style={styles.title}>Recargas Diamantes</h1>
        <p style={styles.subtitle}>
          Recarga tus diamantes de forma rápida y sencilla
        </p>
      </header>

      <main style={styles.container}>
        <section style={styles.card}>
          <h2 style={styles.heading}>🎮 Free Fire</h2>

          <label style={styles.label}>ID del jugador</label>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Ejemplo: 123456789"
            value={idJugador}
            onChange={(e) => setIdJugador(e.target.value)}
            style={styles.input}
          />

          <p style={styles.help}>
            Introduce el ID de la cuenta donde quieres recibir los diamantes.
          </p>

          <h2 style={styles.heading}>💎 Elige tus diamantes</h2>

          <div style={styles.grid}>
            {paquetes.map((paquete) => {
              const seleccionado =
                paqueteSeleccionado?.diamantes === paquete.diamantes;

              return (
                <button
                  key={paquete.diamantes}
                  onClick={() => seleccionarPaquete(paquete)}
                  style={{
                    ...styles.package,
                    ...(seleccionado ? styles.selected : {}),
                  }}
                >
                  <span style={styles.diamondIcon}>💎</span>
                  <strong>{paquete.diamantes}</strong>
                  <span style={styles.diamondText}>Diamantes</span>
                  <span style={styles.price}>{paquete.precio}</span>
                </button>
              );
            })}
          </div>

          {paqueteSeleccionado && (
            <div style={styles.summary}>
              <strong>Paquete seleccionado</strong>
              <span>
                💎 {paqueteSeleccionado.diamantes} diamantes —{" "}
                {paqueteSeleccionado.precio}
              </span>
            </div>
          )}

          <button onClick={continuar} style={styles.continueButton}>
            Continuar con el pedido →
          </button>
        </section>

        <section style={styles.infoCard}>
          <h2 style={styles.heading}>¿Cómo funciona?</h2>

          <div style={styles.step}>
            <span>1</span>
            <p>Escribe tu ID de jugador.</p>
          </div>

          <div style={styles.step}>
            <span>2</span>
            <p>Selecciona la cantidad de diamantes.</p>
          </div>

          <div style={styles.step}>
            <span>3</span>
            <p>Continúa con tu pedido.</p>
          </div>

          <div style={styles.step}>
            <span>4</span>
            <p>Recibe las instrucciones para completar la compra.</p>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>© 2026 Recargas Diamantes</p>
        <p>Servicio de recargas digitales</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #07111f 0%, #101827 45%, #070b12 100%)",
    color: "#ffffff",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  },

  header: {
    textAlign: "center",
    padding: "45px 20px 35px",
    background:
      "linear-gradient(135deg, #0f1f36 0%, #172b4d 50%, #0c1728 100%)",
    borderBottom: "1px solid #263a59",
  },

  logo: {
    fontSize: "55px",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
  },

  subtitle: {
    color: "#b9c7da",
    fontSize: "16px",
    marginTop: "10px",
  },

  container: {
    maxWidth: "650px",
    margin: "0 auto",
    padding: "25px 15px 40px",
  },

  card: {
    background: "#111c2d",
    border: "1px solid #263a59",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
  },

  heading: {
    fontSize: "21px",
    margin: "5px 0 18px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #40536e",
    background: "#08111f",
    color: "#ffffff",
    fontSize: "17px",
    outline: "none",
  },

  help: {
    color: "#8fa1b8",
    fontSize: "13px",
    lineHeight: "1.5",
    marginTop: "8px",
    marginBottom: "28px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },

  package: {
    minHeight: "145px",
    padding: "16px 10px",
    borderRadius: "15px",
    border: "1px solid #344a68",
    background: "#18263a",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    fontSize: "16px",
  },

  selected: {
    border: "2px solid #4da3ff",
    background: "#18395d",
    transform: "scale(1.02)",
  },

  diamondIcon: {
    fontSize: "32px",
  },

  diamondText: {
    color: "#aebdd0",
    fontSize: "13px",
  },

  price: {
    fontWeight: "800",
    fontSize: "17px",
    marginTop: "5px",
  },

  summary: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "12px",
    background: "#0b1727",
    border: "1px solid #2e4564",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  continueButton: {
    width: "100%",
    marginTop: "20px",
    padding: "16px",
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer",
  },

  infoCard: {
    marginTop: "20px",
    padding: "22px",
    background: "#111c2d",
    border: "1px solid #263a59",
    borderRadius: "20px",
  },

  step: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    color: "#d5deea",
    borderBottom: "1px solid #26364d",
    padding: "11px 0",
  },

  footer: {
    textAlign: "center",
    padding: "30px 15px",
    color: "#718096",
    fontSize: "13px",
  },
};

export default App;
