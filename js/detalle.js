/* ============================================================ */
/*  PÁGINA DE DETALLE DE VEHÍCULO                              */
/* ============================================================ */

// Navbar
const navWaD = document.getElementById("navWa");
if(navWaD){ navWaD.href = waLink("¡Hola Listo Car! 👋 Me interesa rentar un auto."); navWaD.target="_blank"; navWaD.rel="noopener"; }
const burgerD = document.getElementById("burger");
const navLinksD = document.getElementById("navLinks");
if(burgerD && navLinksD){
  burgerD.addEventListener("click", ()=> navLinksD.classList.toggle("open"));
  navLinksD.querySelectorAll("a").forEach(a=> a.addEventListener("click", ()=> navLinksD.classList.remove("open")));
}
document.getElementById("year").textContent = new Date().getFullYear();

// ID del auto desde la URL: detalle.html?id=FIREBASE_DOC_ID
const params = new URLSearchParams(location.search);
const carId  = params.get("id");
if(!carId) location.href = "inicio.html";

function getFotos(car){
  if(car.fotos && car.fotos.length) return car.fotos;
  if(car.foto) return [car.foto];
  return [FALLBACK_IMG];
}

/* ---- Render del detalle ---- */
function renderDetail(car){
  const fotos = getFotos(car);
  const waMsg = `¡Hola Listo Car! 👋 Quiero rentar el ${car.nombre} ${car.anio||''} (${money(car.precio)}/día). ¿Está disponible?`;

  // Specs con iconos Font Awesome
  const specs = [
    car.transmision ? { icon:'fa-solid fa-gears',       label:'Transmisión',  value:car.transmision                   } : null,
    car.pasajeros   ? { icon:'fa-solid fa-user-group',  label:'Pasajeros',    value:car.pasajeros + ' personas'       } : null,
    car.ac !== undefined ? { icon:'fa-solid fa-snowflake', label:'Aire acond.', value:car.ac?'Sí':'No', cls:car.ac?'yes':'no' } : null,
    car.combustible ? { icon:'fa-solid fa-gas-pump',    label:'Combustible',  value:car.combustible                   } : null,
    car.puertas     ? { icon:'fa-solid fa-door-open',   label:'Puertas',      value:car.puertas + ' puertas'          } : null,
  ].filter(Boolean);

  // Chips rápidos en el panel (transmisión, pasajeros, A/C)
  const chips = [
    car.transmision ? `<span class="info-chip"><i class="fa-solid fa-gears"></i>${esc(car.transmision)}</span>` : '',
    car.pasajeros   ? `<span class="info-chip"><i class="fa-solid fa-user-group"></i>${car.pasajeros} personas</span>` : '',
    car.ac          ? `<span class="info-chip ac-yes"><i class="fa-solid fa-snowflake"></i>A/C</span>` : '',
  ].filter(Boolean).join('');

  // Thumbnails con contador
  const thumbsHTML = fotos.length > 1 ? fotos.map((url,i)=>`
    <button class="gallery-thumb${i===0?' active':''}" onclick="setMain(${i})" data-index="${i}">
      <img src="${esc(url)}" alt="Foto ${i+1}" onerror="this.src='${FALLBACK_IMG}'">
    </button>`).join('') : '';

  const specsHTML = specs.length ? `
    <section class="specs-section">
      <h3 class="section-title"><i class="fa-solid fa-sliders"></i>Especificaciones</h3>
      <div class="specs-grid">
        ${specs.map(s=>`
          <div class="spec-box">
            <i class="${s.icon}"></i>
            <div class="spec-label">${s.label}</div>
            <div class="spec-value${s.cls?' '+s.cls:''}">${s.value}</div>
          </div>`).join('')}
      </div>
    </section>` : '';

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-grid">
      <!-- Galería -->
      <div class="gallery-wrap">
        <div class="gallery-main">
          <img id="mainPhoto" src="${esc(fotos[0])}" alt="${esc(car.nombre)}" onerror="this.src='${FALLBACK_IMG}'">
          ${fotos.length > 1 ? `<div class="photo-counter" id="photoCounter">1 / ${fotos.length}</div>` : ''}
        </div>
        ${fotos.length > 1 ? `<div class="gallery-thumbs">${thumbsHTML}</div>` : ''}
      </div>

      <!-- Panel info -->
      <div class="info-panel">
        <div class="avail-badge"><span class="avail-dot"></span>Disponible ahora</div>
        <h1 class="info-name">${esc(car.nombre)}</h1>
        ${car.anio ? `<span class="info-year">${car.anio}</span>` : ''}
        ${chips ? `<div class="info-quick-chips" style="margin-top:.9rem">${chips}</div>` : ''}

        <div class="info-price-wrap">
          <div class="price-label">Precio por día</div>
          <div class="info-price">
            <span class="amt">${money(car.precio)}</span>
            <span class="per">/ día</span>
          </div>
        </div>

        <div class="btn-group">
          <a class="btn" href="${waLink(waMsg)}" target="_blank" rel="noopener">
            ${WA_ICON} Rentar por WhatsApp
          </a>
          <a class="btn ghost" href="inicio.html#catalogo">
            <i class="fa-solid fa-arrow-left"></i> Ver más autos
          </a>
        </div>

        <div class="trust-note">
          <i class="fa-solid fa-house"></i>
          Entrega a domicilio incluida en Los Mochis, Sinaloa.
        </div>
      </div>
    </div>

    ${specsHTML}

    ${car.descripcion ? `
      <section class="desc-section">
        <h3 class="section-title"><i class="fa-solid fa-align-left"></i>Descripción</h3>
        <p>${esc(car.descripcion)}</p>
      </section>` : ''}`;

  document.title = `${car.nombre}${car.anio?' '+car.anio:''} · Listo Car`;
  window._fotosDetalle = fotos;
}

/* ---- Cambiar foto principal en galería ---- */
window.setMain = function(index){
  const main    = document.getElementById("mainPhoto");
  const counter = document.getElementById("photoCounter");
  if(!main || !window._fotosDetalle) return;
  main.classList.add("fade");
  setTimeout(()=>{
    main.src = window._fotosDetalle[index];
    main.classList.remove("fade");
  }, 200);
  if(counter) counter.textContent = (index+1) + " / " + window._fotosDetalle.length;
  document.querySelectorAll(".gallery-thumb").forEach((t,i)=> t.classList.toggle("active", i===index));
};

/* ---- Cargar auto desde Firestore ---- */
if(carId && firebaseReady){
  db.collection("autos").doc(carId).get()
    .then(doc=>{
      if(!doc.exists){ location.href = "inicio.html"; return; }
      renderDetail({ id:doc.id, ...doc.data() });
    })
    .catch(err=>{
      console.error("[Listo Car] Error al cargar auto:", err);
      document.getElementById("detailContent").innerHTML =
        '<p style="text-align:center;color:var(--muted);padding:4rem 0">No se pudo cargar el vehículo. <a href="inicio.html" style="color:var(--orange)">Volver al inicio</a></p>';
    });
} else if(!firebaseReady){
  document.getElementById("detailContent").innerHTML =
    '<p style="text-align:center;color:var(--muted);padding:4rem 0">Firebase no está configurado. <a href="inicio.html" style="color:var(--orange)">Volver al inicio</a></p>';
}
