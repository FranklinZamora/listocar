/* ============================================================ */
/*  LANDING — WhatsApp, navbar y catálogo público               */
/* ============================================================ */

// WA links (navbar, hero, tarjeta de contacto, card)
const baseMsg = "¡Hola Listo Car! Me interesa rentar un auto.";
["navWa", "heroWa", "cardWa", "ctWa", "ctaBannerWa"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.href = waLink(baseMsg);
    el.target = "_blank";
    el.rel = "noopener";
  }
});

// Menú móvil + año
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
if (burger && navLinks) {
  burger.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks
    .querySelectorAll("a")
    .forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("open")),
    );
}
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Chips de especificaciones ---------- */
const gearSVG =
  '<svg viewBox="0 0 24 24"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><path d="M5 7v10M12 7v4M12 12h7v4"/></svg>';
const peopleSVG =
  '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>';
const acSVG =
  '<svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>';

/* ---------- Catálogo ---------- */
const carGrid = document.getElementById("carGrid");

function renderCatalog(cars) {
  if (!cars.length) {
    carGrid.innerHTML =
      '<div class="empty">Pronto agregaremos autos. ¡Escríbenos por WhatsApp!</div>';
    return;
  }
  carGrid.innerHTML = cars
    .map((c) => {
      const fotos =
        c.fotos && c.fotos.length
          ? c.fotos
          : c.foto
            ? [c.foto]
            : [FALLBACK_IMG];
      const mainFoto = fotos[0];
      const chips = [
        c.transmision
          ? `<span class="spec-chip">${gearSVG}${esc(c.transmision)}</span>`
          : "",
        c.pasajeros
          ? `<span class="spec-chip">${peopleSVG}${esc(String(c.pasajeros))} personas</span>`
          : "",
        c.ac ? `<span class="spec-chip ac">${acSVG}A/C</span>` : "",
        c.color
          ? `<span class="spec-chip"><span class="color-dot-sm" style="background:${safeHex(c.color)}"></span>${esc(colorName(c.color))}</span>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `
    <article class="car">
      <a href="detalle.html?id=${c.id}" class="car-img">
        <img src="${esc(mainFoto)}" alt="${esc(c.nombre)}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
        <span class="car-year">${c.anio || ""}</span>
      </a>
      <div class="car-body">
        <a href="detalle.html?id=${c.id}" style="color:inherit"><h3>${esc(c.nombre)}</h3></a>
        ${chips ? `<div class="car-chips">${chips}</div>` : ""}
        <p class="car-desc">${esc(c.descripcion || "")}</p>
        <div class="car-price"><span class="amt">${money(c.precio)}</span><span class="per">/ día</span></div>
        <a class="btn" target="_blank" rel="noopener"
           href="${waLink("¡Hola Listo Car! 👋 Quiero rentar el " + c.nombre + " " + (c.anio || "") + " (" + money(c.precio) + "/día). ¿Está disponible?")}">
          ${WA_ICON} Rentar por WhatsApp
        </a>
        <a href="detalle.html?id=${c.id}" class="detail-link">Ver detalles y fotos →</a>
      </div>
    </article>`;
    })
    .join("");
}

/* ---------- Carga desde Supabase ---------- */
async function loadCars() {
  const { data, error } = await supabaseClient
    .from("autos")
    .select("*")
    .order("creado", { ascending: false });
  if (error) {
    console.error("[Listo Car] Supabase error:", error);
    renderCatalog([]);
    return;
  }
  renderCatalog(data || []);
}
loadCars();
