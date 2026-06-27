/* ============================================================ */
/*  CONFIGURACIÓN COMPARTIDA  (la usan el landing y el admin)   */
/* ============================================================ */

const WHATSAPP = "526684991412";

const CLOUDINARY_CLOUD_NAME = "di9wl9gko";
const CLOUDINARY_UPLOAD_PRESET = "listocar_autos";

/* ------------------------------------------------------------ */
/*  SUPABASE                                                     */
/* ------------------------------------------------------------ */
const SUPABASE_URL      = "https://ioqacnkkrosdhyfalipx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RmcpvEgc9O9kIK7YFCiZtg_DOeRfeNr";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
function safeHex(hex) {
  return /^#[0-9A-Fa-f]{3,6}$/.test(hex || "") ? hex : "#cccccc";
}

/* ------------------------------------------------------------ */
/*  COLORES DE AUTOS                                            */
/* ------------------------------------------------------------ */
const CAR_COLORS = [
  { name: "Blanco",      hex: "#F0F0F0" },
  { name: "Negro",       hex: "#1A1A1A" },
  { name: "Gris",        hex: "#808080" },
  { name: "Plata",       hex: "#C0C0C0" },
  { name: "Rojo",        hex: "#CC2200" },
  { name: "Azul",        hex: "#1A4B8C" },
  { name: "Azul marino", hex: "#0A1F3C" },
  { name: "Verde",       hex: "#2D6A2D" },
  { name: "Amarillo",    hex: "#F5C518" },
  { name: "Naranja",     hex: "#E05C00" },
  { name: "Café",        hex: "#5C3D1E" },
  { name: "Beige",       hex: "#C8AE82" },
  { name: "Morado",      hex: "#6B2FA0" },
  { name: "Rosa",        hex: "#E8427A" },
];

function colorName(hex) {
  if (!hex) return "";
  const c = CAR_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  return c ? c.name : hex.toUpperCase();
}

/* ------------------------------------------------------------ */
/*  CATEGORÍAS DE AUTOS                                         */
/* ------------------------------------------------------------ */
const CAR_CATEGORIES = [
  { name: "Sedán",       icon: "fa-solid fa-car-side" },
  { name: "SUV",         icon: "fa-solid fa-car" },
  { name: "Hatchback",   icon: "fa-solid fa-car-rear" },
  { name: "Pickup",      icon: "fa-solid fa-truck-pickup" },
  { name: "Van",         icon: "fa-solid fa-van-shuttle" },
  { name: "Deportivo",   icon: "fa-solid fa-gauge-high" },
];

function categoryIcon(name) {
  const c = CAR_CATEGORIES.find(c => c.name === name);
  return c ? c.icon : "fa-solid fa-car";
}
