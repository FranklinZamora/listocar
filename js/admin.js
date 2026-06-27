/* ============================================================ */
/*  PANEL ADMIN — login, tabla, 3 fotos, CRUD con Supabase      */
/* ============================================================ */

const loginView = document.getElementById("loginView");
const dashView  = document.getElementById("dashView");
let currentCars = [];

/* ---------- Supabase Auth — estado de sesión ---------- */
loginView.style.display = "none";
dashView.style.display  = "none";

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    loginView.style.display = "none";
    dashView.style.display  = "block";
    loadCars();
  } else {
    loginView.style.display = "block";
    dashView.style.display  = "none";
  }
});

/* ---------- Login ---------- */
const AUTH_ERRORS = {
  "Invalid login credentials":  "Correo o contraseña incorrectos.",
  "Email not confirmed":        "Confirma tu correo electrónico.",
  "Too many requests":          "Demasiados intentos. Intenta más tarde.",
  "User not found":             "Usuario no encontrado.",
};

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const errEl = document.getElementById("loginErr");
  const email = document.getElementById("email").value.trim();
  const pass  = document.getElementById("pass").value;
  errEl.textContent = "";
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  } catch(err) {
    errEl.textContent = AUTH_ERRORS[err.message] || "Error al iniciar sesión.";
  }
});

/* ---------- Logout ---------- */
document.getElementById("logoutBtn").addEventListener("click", () => {
  supabaseClient.auth.signOut();
});

/* ---------- Carga de autos ---------- */
async function loadCars() {
  const { data, error } = await supabaseClient
    .from("autos")
    .select("*")
    .order("creado", { ascending: false });
  if (error) {
    console.error("[Listo Car] Supabase error:", error);
    currentCars = [];
  } else {
    currentCars = data || [];
  }
  renderAdminTable();
}

/* ---------- Tabla ---------- */
const adminRows = document.getElementById("adminRows");
function renderAdminTable() {
  document.getElementById("countNum").textContent = currentCars.length;
  if (!currentCars.length) {
    adminRows.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">Sin autos todavía.</td></tr>';
    return;
  }
  adminRows.innerHTML = currentCars.map(c => {
    const fotos = c.fotos && c.fotos.length ? c.fotos : (c.foto ? [c.foto] : []);
    const thumb = fotos[0] || FALLBACK_IMG;
    return `
    <tr>
      <td><img class="thumb" src="${esc(thumb)}" alt="" data-fallback></td>
      <td><span class="nm">${esc(c.nombre)}</span></td>
      <td>${Number(c.anio)||''}</td>
      <td><span class="pr">${money(c.precio)}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn edit" title="Editar" onclick="editCar('${esc(c.id)}')"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="icon-btn del" title="Eliminar" onclick="deleteCar('${esc(c.id)}')"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg></button>
        </div>
      </td>
    </tr>`;
  }).join("");
  adminRows.querySelectorAll("img[data-fallback]").forEach(img => {
    img.addEventListener("error", function(){ this.src = FALLBACK_IMG; }, { once: true });
  });
}

/* ============================================================ */
/*  DROPDOWNS PERSONALIZADOS (transmisión, combustible, puertas) */
/* ============================================================ */
const customSelects = {};
function initCustomSelect(id, options, placeholder) {
  const wrap    = document.querySelector(`.custom-select[data-for="${id}"]`);
  if (!wrap) return;
  const trigger = wrap.querySelector(".cs-trigger");
  const valueEl = wrap.querySelector(".cs-value");
  const menu    = wrap.querySelector(".cs-menu");
  const hidden  = document.getElementById(id);

  function open()  { menu.classList.add("open");    trigger.classList.add("active");    trigger.setAttribute("aria-expanded","true"); }
  function close() { menu.classList.remove("open"); trigger.classList.remove("active"); trigger.setAttribute("aria-expanded","false"); }
  function toggle(){ menu.classList.contains("open") ? close() : open(); }

  function setValue(val) {
    hidden.value = (val == null ? "" : String(val));
    const opt = options.find(o => String(o.value) === hidden.value);
    const hasVal = opt && opt.value !== "";
    valueEl.textContent = hasVal ? opt.label : placeholder;
    valueEl.classList.toggle("placeholder", !hasVal);
    menu.querySelectorAll(".cs-option").forEach(o => o.classList.toggle("selected", o.dataset.value === hidden.value));
    close();
  }

  options.forEach(o => {
    if (o.value === "") return; // no listamos el placeholder como opción
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cs-option";
    b.dataset.value = o.value;
    b.setAttribute("role", "option");
    b.innerHTML = `<span>${o.label}</span><svg class="cs-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>`;
    b.addEventListener("click", () => setValue(o.value));
    menu.appendChild(b);
  });

  trigger.addEventListener("click", toggle);
  document.addEventListener("click", e => { if (!wrap.contains(e.target)) close(); });

  customSelects[id] = { setValue };
  setValue("");
}

initCustomSelect("fCategoria", [
  { value:"", label:"-- Selecciona --" },
  ...CAR_CATEGORIES.map(c => ({ value:c.name, label:c.name })),
], "-- Selecciona --");

initCustomSelect("fTransmision", [
  { value:"", label:"-- Selecciona --" },
  { value:"Automático", label:"Automático" },
  { value:"Manual", label:"Manual" },
], "-- Selecciona --");

initCustomSelect("fCombustible", [
  { value:"", label:"-- Selecciona --" },
  { value:"Gasolina", label:"Gasolina" },
  { value:"Diésel", label:"Diésel" },
  { value:"Híbrido", label:"Híbrido" },
  { value:"Eléctrico", label:"Eléctrico" },
], "-- Selecciona --");

initCustomSelect("fPuertas", [
  { value:"", label:"-- Selecciona --" },
  { value:"2", label:"2 puertas" },
  { value:"4", label:"4 puertas" },
  { value:"5", label:"5 puertas" },
], "-- Selecciona --");

function setCustomSelect(id, val) { if (customSelects[id]) customSelects[id].setValue(val); }

/* ============================================================ */
/*  COLOR PICKER                                                 */
/* ============================================================ */
function isLightColor(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 180;
}

function dotSpan(hex) {
  const light = isLightColor(hex) ? " light" : "";
  return `<span class="cdot${light}" style="background:${safeHex(hex)}"></span>`;
}

function initColorPicker() {
  const wrap        = document.getElementById("colorSelect");
  const trigger     = document.getElementById("colorTrigger");
  const triggerCt   = document.getElementById("colorTriggerContent");
  const menu        = document.getElementById("colorMenu");
  const customPanel = document.getElementById("colorCustomPanel");
  const picker      = document.getElementById("fColorPicker");
  const customSw    = document.getElementById("colorCustomSwatch");
  const customHex   = document.getElementById("colorCustomHex");
  const customApply = document.getElementById("colorCustomApply");
  const fColor      = document.getElementById("fColor");

  function openMenu() {
    menu.classList.add("open");
    trigger.classList.add("active");
    trigger.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    menu.classList.remove("open");
    trigger.classList.remove("active");
    trigger.setAttribute("aria-expanded", "false");
    customPanel.classList.remove("open");
  }
  function toggleMenu() {
    menu.classList.contains("open") ? closeMenu() : openMenu();
  }

  function setTrigger(hex, name) {
    if (!hex) {
      triggerCt.innerHTML = '<span class="color-trigger-placeholder">Selecciona un color</span>';
    } else {
      triggerCt.innerHTML = `${dotSpan(hex)}<span class="color-trigger-name">${esc(name)}</span>`;
    }
  }

  function applyColor(hex, name, custom) {
    fColor.value = hex || "";
    setTrigger(hex, name);
    menu.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
    if (!custom) {
      const opt = menu.querySelector(`.color-option[data-hex="${hex}"]`);
      if (opt) opt.classList.add("selected");
    } else {
      menu.querySelector(".color-option-other").classList.add("selected");
    }
    closeMenu();
  }

  function clearColor() {
    fColor.value = "";
    setTrigger(null);
    menu.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
    closeMenu();
  }

  // Opciones predefinidas
  CAR_COLORS.forEach(c => {
    const opt = document.createElement("button");
    opt.type = "button";
    opt.className = "color-option";
    opt.dataset.hex = c.hex;
    opt.setAttribute("role", "option");
    opt.innerHTML = `${dotSpan(c.hex)}<span class="color-option-name">${c.name}</span><svg class="color-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>`;
    opt.addEventListener("click", () => applyColor(c.hex, c.name, false));
    menu.appendChild(opt);
  });

  // Opción "Otro color"
  const other = document.createElement("button");
  other.type = "button";
  other.className = "color-option color-option-other";
  other.setAttribute("role", "option");
  other.innerHTML = `<span class="cdot cdot-rainbow"></span><span class="color-option-name">Otro color…</span><svg class="color-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>`;
  other.addEventListener("click", e => {
    e.stopPropagation();
    customPanel.classList.add("open");
    customSw.style.background = picker.value;
    customHex.textContent = picker.value.toUpperCase();
  });
  menu.appendChild(other);

  trigger.addEventListener("click", toggleMenu);

  picker.addEventListener("input", () => {
    customSw.style.background = picker.value;
    customHex.textContent = picker.value.toUpperCase();
  });

  customApply.addEventListener("click", () => applyColor(picker.value, picker.value.toUpperCase(), true));

  // Cerrar al hacer clic fuera
  document.addEventListener("click", e => {
    if (!wrap.contains(e.target)) closeMenu();
  });

  window._setColorPicker = applyColor;
  window._clearColorPicker = clearColor;
}
initColorPicker();

/* ============================================================ */
/*  GESTIÓN DE 3 FOTOS                                          */
/* ============================================================ */
const photoState = [
  { file:null, existingUrl:"" },
  { file:null, existingUrl:"" },
  { file:null, existingUrl:"" }
];

function initPhotoSlots() {
  [0,1,2].forEach(slot => {
    const zone     = document.querySelector(`.upload-zone[data-slot="${slot}"]`);
    const input    = document.querySelector(`.file-input[data-slot="${slot}"]`);
    const preview  = document.querySelector(`.preview-img[data-slot="${slot}"]`);
    const clearBtn = document.querySelector(`.clear-photo-btn[data-slot="${slot}"]`);
    const label    = document.querySelector(`.upload-label[data-slot="${slot}"]`);

    zone.addEventListener("click", () => input.click());

    input.addEventListener("change", e => {
      const f = e.target.files[0];
      if (!f) return;
      photoState[slot].file = f;
      const reader = new FileReader();
      reader.onload = ev => {
        preview.src = ev.target.result;
        preview.style.display = "block";
        clearBtn.style.display = "block";
        label.textContent = f.name.length > 20 ? f.name.slice(0,18)+"…" : f.name;
      };
      reader.readAsDataURL(f);
    });

    clearBtn.addEventListener("click", () => {
      photoState[slot].file = null;
      photoState[slot].existingUrl = "";
      preview.src = "";
      preview.style.display = "none";
      clearBtn.style.display = "none";
      label.textContent = "Subir foto";
      input.value = "";
    });
  });
}
initPhotoSlots();

/* ---------- Compresión (máx 800px, 0.8 calidad) ---------- */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("Error al comprimir")), "image/jpeg", 0.8);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------- Subida a Cloudinary ---------- */
async function uploadToCloudinary(blob) {
  const fd = new FormData();
  fd.append("file", blob);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method:"POST", body:fd });
  if (!res.ok) throw new Error("Cloudinary respondió " + res.status);
  return (await res.json()).secure_url;
}

/* ============================================================ */
/*  GUARDAR AUTO (alta o edición)                               */
/* ============================================================ */
function msg(type, text) { const el = document.getElementById("formMsg"); el.className="msg "+type; el.textContent=text; }

document.getElementById("carForm").addEventListener("submit", async e => {
  e.preventDefault();
  const saveBtn = document.getElementById("saveBtn");
  const editId  = document.getElementById("editId").value;

  const car = {
    nombre:      document.getElementById("fName").value.trim(),
    anio:        Number(document.getElementById("fYear").value),
    precio:      Number(document.getElementById("fPrice").value),
    descripcion: document.getElementById("fDesc").value.trim(),
    categoria:   document.getElementById("fCategoria").value || null,
    transmision: document.getElementById("fTransmision").value || null,
    pasajeros:   Number(document.getElementById("fPasajeros").value) || null,
    combustible: document.getElementById("fCombustible").value || null,
    puertas:     Number(document.getElementById("fPuertas").value) || null,
    ac:          document.getElementById("fAc").checked,
    color:       document.getElementById("fColor").value || null,
  };
  Object.keys(car).forEach(k => car[k] === null && delete car[k]);

  saveBtn.disabled = true;
  try {
    const fotosFinales = [];
    for (let i = 0; i < 3; i++) {
      if (photoState[i].file) {
        msg("info", `Subiendo foto ${i+1}…`);
        const blob = await compressImage(photoState[i].file);
        const url  = await uploadToCloudinary(blob);
        fotosFinales.push(url);
      } else if (photoState[i].existingUrl) {
        fotosFinales.push(photoState[i].existingUrl);
      }
    }

    if (!fotosFinales.length && !editId) {
      msg("err", "Agrega al menos una foto del auto.");
      saveBtn.disabled = false;
      return;
    }

    if (fotosFinales.length) car.fotos = fotosFinales;

    if (editId) {
      const { error } = await supabaseClient.from("autos").update(car).eq("id", editId);
      if (error) throw error;
      msg("ok", "Auto actualizado ✓");
    } else {
      car.creado = new Date().toISOString();
      const { error } = await supabaseClient.from("autos").insert(car);
      if (error) throw error;
      msg("ok", "Auto agregado ✓");
    }
    await loadCars();
    resetForm();
  } catch(err) {
    console.error(err);
    msg("err", "Error: " + err.message);
  } finally {
    saveBtn.disabled = false;
  }
});

/* ---------- Reset del formulario ---------- */
function resetPhotoSlot(slot) {
  photoState[slot].file = null;
  photoState[slot].existingUrl = "";
  const preview  = document.querySelector(`.preview-img[data-slot="${slot}"]`);
  const clearBtn = document.querySelector(`.clear-photo-btn[data-slot="${slot}"]`);
  const label    = document.querySelector(`.upload-label[data-slot="${slot}"]`);
  const input    = document.querySelector(`.file-input[data-slot="${slot}"]`);
  preview.src = ""; preview.style.display = "none";
  clearBtn.style.display = "none";
  label.textContent = "Subir foto";
  input.value = "";
}

function resetForm() {
  document.getElementById("carForm").reset();
  document.getElementById("editId").value = "";
  [0,1,2].forEach(resetPhotoSlot);
  setCustomSelect("fCategoria", "");
  setCustomSelect("fTransmision", "");
  setCustomSelect("fCombustible", "");
  setCustomSelect("fPuertas", "");
  window._clearColorPicker();
  document.getElementById("formTitle").textContent = "Agregar auto";
  document.getElementById("formNum").textContent = "+";
  document.getElementById("editBanner").style.display = "none";
  setTimeout(() => { const el = document.getElementById("formMsg"); el.textContent=""; el.className="msg"; }, 4000);
}

/* ---------- Editar ---------- */
window.editCar = function(id) {
  const c = currentCars.find(x => x.id === id);
  if (!c) return;

  document.getElementById("editId").value        = c.id;
  document.getElementById("fName").value         = c.nombre || "";
  document.getElementById("fYear").value         = c.anio || "";
  document.getElementById("fPrice").value        = c.precio || "";
  document.getElementById("fDesc").value         = c.descripcion || "";
  document.getElementById("fPasajeros").value    = c.pasajeros || "";
  document.getElementById("fAc").checked         = !!c.ac;
  setCustomSelect("fCategoria", c.categoria || "");
  setCustomSelect("fTransmision", c.transmision || "");
  setCustomSelect("fCombustible", c.combustible || "");
  setCustomSelect("fPuertas", c.puertas || "");

  if (c.color) {
    const predefined = CAR_COLORS.find(col => col.hex.toLowerCase() === c.color.toLowerCase());
    if (predefined) {
      window._setColorPicker(predefined.hex, predefined.name, false);
    } else {
      document.getElementById("fColorPicker").value = c.color;
      document.getElementById("colorCustomHex").textContent = c.color.toUpperCase();
      document.getElementById("colorCustomSwatch").style.background = c.color;
      window._setColorPicker(c.color, c.color.toUpperCase(), true);
    }
  } else {
    window._clearColorPicker();
  }

  const existingFotos = c.fotos && c.fotos.length ? c.fotos : (c.foto ? [c.foto] : []);
  [0,1,2].forEach(slot => {
    resetPhotoSlot(slot);
    const url = existingFotos[slot] || "";
    if (url) {
      photoState[slot].existingUrl = url;
      const preview  = document.querySelector(`.preview-img[data-slot="${slot}"]`);
      const clearBtn = document.querySelector(`.clear-photo-btn[data-slot="${slot}"]`);
      const label    = document.querySelector(`.upload-label[data-slot="${slot}"]`);
      preview.src = url; preview.style.display = "block";
      clearBtn.style.display = "block";
      label.textContent = "Cambiar foto";
    }
  });

  document.getElementById("formTitle").textContent = "Editar auto";
  document.getElementById("formNum").textContent = "✎";
  document.getElementById("editBanner").style.display = "flex";
  document.getElementById("formMsg").textContent = ""; document.getElementById("formMsg").className = "msg";
  const formPanel = document.querySelector("#dashView .panel");
  (formPanel || document.querySelector(".dash")).scrollIntoView({ behavior:"smooth", block:"start" });
};
document.getElementById("cancelEdit").addEventListener("click", resetForm);

/* ---------- Eliminar ---------- */
window.deleteCar = async function(id) {
  if (!confirm("¿Eliminar este auto del catálogo?")) return;
  try {
    const { error } = await supabaseClient.from("autos").delete().eq("id", id);
    if (error) throw error;
    await loadCars();
  } catch(err) {
    alert("Error al eliminar: " + err.message);
  }
};
