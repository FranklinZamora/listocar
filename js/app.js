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

/* ---------- Catálogo ---------- */
const carGrid = document.getElementById("carGrid");
const filterBar = document.getElementById("filterBar");
let allCars = [];
let activeFilter = "Todos";

function carSpecs(c) {
  const items = [
    c.transmision
      ? `<span class="cspec"><i class="fa-solid fa-gears"></i>${esc(c.transmision)}</span>`
      : "",
    c.pasajeros
      ? `<span class="cspec"><i class="fa-solid fa-user-group"></i>${esc(String(c.pasajeros))}</span>`
      : "",
    c.puertas
      ? `<span class="cspec"><i class="fa-solid fa-door-open"></i>${esc(String(c.puertas))}</span>`
      : "",
    c.combustible
      ? `<span class="cspec"><i class="fa-solid fa-gas-pump"></i>${esc(c.combustible)}</span>`
      : "",
    c.ac
      ? `<span class="cspec ac"><i class="fa-solid fa-snowflake"></i>A/C</span>`
      : "",
  ].filter(Boolean);
  return items.join("");
}

function renderCatalog(cars) {
  if (!cars.length) {
    carGrid.innerHTML =
      '<div class="empty">No hay autos en esta categoría por ahora. ¡Escríbenos por WhatsApp!</div>';
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
      const catBadge = c.categoria
        ? `<span class="car-cat"><i class="${categoryIcon(c.categoria)}"></i>${esc(c.categoria)}</span>`
        : "";
      const colorTag = c.color
        ? `<span class="car-color"><span class="color-dot-sm" style="background:${safeHex(c.color)}"></span>${esc(colorName(c.color))}</span>`
        : "";

      return `
    <article class="car">
      <a href="detalle.html?id=${c.id}" class="car-img">
        <img src="${esc(mainFoto)}" alt="${esc(c.nombre)}" loading="lazy" data-fallback>
        ${catBadge}
        <span class="car-year">${c.anio || ""}</span>
      </a>
      <div class="car-body">
        <a href="detalle.html?id=${c.id}" style="color:inherit"><h3>${esc(c.nombre)}</h3></a>
        <div class="car-specs">${carSpecs(c)}</div>
        ${colorTag ? `<div class="car-color-row">${colorTag}</div>` : ""}
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

  carGrid.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", function () { this.src = FALLBACK_IMG; }, { once: true });
  });
}

/* ---------- Filtros por categoría ---------- */
function applyFilter() {
  const cars =
    activeFilter === "Todos"
      ? allCars
      : allCars.filter((c) => c.categoria === activeFilter);
  renderCatalog(cars);
}

function renderFilters() {
  if (!filterBar) return;
  // Solo categorías presentes en los autos cargados, en el orden de CAR_CATEGORIES
  const present = CAR_CATEGORIES.filter((cat) =>
    allCars.some((c) => c.categoria === cat.name),
  );
  if (!present.length) {
    filterBar.innerHTML = "";
    return;
  }
  const btns = [
    `<button class="filter-btn${activeFilter === "Todos" ? " active" : ""}" data-cat="Todos"><i class="fa-solid fa-layer-group"></i>Todos</button>`,
    ...present.map(
      (cat) =>
        `<button class="filter-btn${activeFilter === cat.name ? " active" : ""}" data-cat="${esc(cat.name)}"><i class="${cat.icon}"></i>${esc(cat.name)}</button>`,
    ),
  ];
  filterBar.innerHTML = btns.join("");
  filterBar.querySelectorAll(".filter-btn").forEach((b) => {
    b.addEventListener("click", () => {
      activeFilter = b.dataset.cat;
      filterBar
        .querySelectorAll(".filter-btn")
        .forEach((x) => x.classList.toggle("active", x === b));
      applyFilter();
    });
  });
}

/* ---------- Carga desde Supabase ---------- */
async function loadCars() {
  const { data, error } = await supabaseClient
    .from("autos")
    .select("*")
    .order("creado", { ascending: false });
  if (error) {
    console.error("[Listo Car] Supabase error:", error);
    allCars = [];
    renderCatalog([]);
    return;
  }
  allCars = data || [];
  renderFilters();
  applyFilter();
}
loadCars();
