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
