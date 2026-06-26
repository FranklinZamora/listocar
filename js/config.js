/* ============================================================ */
/*  CONFIGURACIÓN COMPARTIDA  (la usan el landing y el admin)   */
/* ============================================================ */

// Número de WhatsApp en formato internacional, sin "+" ni espacios.
const WHATSAPP = "526684991412";

// --- Cloudinary (subida de fotos) ---
const CLOUDINARY_CLOUD_NAME = "di9wl9gko";
const CLOUDINARY_UPLOAD_PRESET = "listocar_autos"; // preset "Unsigned"

/* ------------------------------------------------------------ */
/*  FIREBASE                                                    */
/* ------------------------------------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyB68QOyMnIjNTmFsbonoYznksEwosT6peo",
  authDomain: "listocar-82a73.firebaseapp.com",
  projectId: "listocar-82a73",
  storageBucket: "listocar-82a73.firebasestorage.app",
  messagingSenderId: "498978512043",
  appId: "1:498978512043:web:99d8eeb2835e230ed72bee",
  measurementId: "G-D9L96EK6V7",
};

// Inicializa Firebase solo si ya reemplazaste los placeholders.
let db = null;
let firebaseReady = false;
try {
  const configured =
    firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("TU_");
  if (configured) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
  } else {
    console.warn(
      "[Listo Car] Firebase no configurado → modo demostración. Reemplaza firebaseConfig en js/config.js.",
    );
  }
} catch (e) {
  console.error("[Listo Car] Error al iniciar Firebase:", e);
  firebaseReady = false;
}

/* ------------------------------------------------------------ */
/*  AUTOS DE EJEMPLO — desactivados, todo viene de Firebase     */
/* ------------------------------------------------------------ */
const DEMO_CARS = [];

/* ------------------------------------------------------------ */
/*  HELPERS COMPARTIDOS                                         */
/* ------------------------------------------------------------ */
const FALLBACK_IMG = "assets/portada.png";

const WA_ICON = '<i class="fa-brands fa-whatsapp"></i>';

function waLink(msg) {
  return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
}
function money(n) {
  return "$" + Number(n || 0).toLocaleString("es-MX");
}
function esc(s) {
  return String(s == null ? "" : s).replace(
    /[&<>"]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m],
  );
}
