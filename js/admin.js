/* ============================================================ */
/*  PANEL ADMIN — login, tabla, 3 fotos, CRUD con Firestore     */
/* ============================================================ */

const loginView = document.getElementById("loginView");
const dashView  = document.getElementById("dashView");
let currentCars = [];

/* ---------- Firebase Auth — estado de sesión ---------- */
loginView.style.display = "none";
dashView.style.display  = "none";

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    loginView.style.display = "none";
    dashView.style.display  = "block";
    document.getElementById("fbWarn").style.display = firebaseReady ? "none" : "block";
    loadCars();
  } else {
    loginView.style.display = "block";
    dashView.style.display  = "none";
  }
});

/* ---------- Login ---------- */
const AUTH_ERRORS = {
  "auth/wrong-password":     "Contraseña incorrecta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/user-not-found":     "Usuario no encontrado.",
  "auth/invalid-email":      "Correo inválido.",
  "auth/too-many-requests":  "Demasiados intentos. Intenta más tarde.",
};

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const errEl = document.getElementById("loginErr");
  const email = document.getElementById("email").value.trim();
  const pass  = document.getElementById("pass").value;
  errEl.textContent = "";
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pass);
  } catch(err) {
    errEl.textContent = AUTH_ERRORS[err.code] || "Error al iniciar sesión.";
  }
});

/* ---------- Logout ---------- */
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut();
});

/* ---------- Carga de autos en tiempo real ---------- */
function loadCars(){
  if(firebaseReady){
    db.collection("autos").orderBy("creado","desc").onSnapshot(snap=>{
      currentCars = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      renderAdminTable();
    }, err=>{
      console.error("[Listo Car] Firestore error:", err);
      currentCars = [];
      renderAdminTable();
    });
  } else {
    currentCars = [];
    renderAdminTable();
  }
}

/* ---------- Tabla ---------- */
const adminRows = document.getElementById("adminRows");
function renderAdminTable(){
  document.getElementById("countNum").textContent = currentCars.length;
  if(!currentCars.length){
    adminRows.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">Sin autos todavía.</td></tr>';
    return;
  }
  adminRows.innerHTML = currentCars.map(c=>{
    const fotos = c.fotos && c.fotos.length ? c.fotos : (c.foto ? [c.foto] : []);
    const thumb = fotos[0] || FALLBACK_IMG;
    return `
    <tr>
      <td><img class="thumb" src="${esc(thumb)}" alt="" onerror="this.src='${FALLBACK_IMG}'"></td>
      <td><span class="nm">${esc(c.nombre)}</span></td>
      <td>${c.anio||''}</td>
      <td><span class="pr">${money(c.precio)}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn edit" title="Editar" onclick="editCar('${c.id}')"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="icon-btn del" title="Eliminar" onclick="deleteCar('${c.id}')"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg></button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

/* ============================================================ */
/*  GESTIÓN DE 3 FOTOS                                          */
/* ============================================================ */
const photoState = [
  { file:null, existingUrl:"" },
  { file:null, existingUrl:"" },
  { file:null, existingUrl:"" }
];

function initPhotoSlots(){
  [0,1,2].forEach(slot=>{
    const zone     = document.querySelector(`.upload-zone[data-slot="${slot}"]`);
    const input    = document.querySelector(`.file-input[data-slot="${slot}"]`);
    const preview  = document.querySelector(`.preview-img[data-slot="${slot}"]`);
    const clearBtn = document.querySelector(`.clear-photo-btn[data-slot="${slot}"]`);
    const label    = document.querySelector(`.upload-label[data-slot="${slot}"]`);

    zone.addEventListener("click", ()=> input.click());

    input.addEventListener("change", e=>{
      const f = e.target.files[0];
      if(!f) return;
      photoState[slot].file = f;
      const reader = new FileReader();
      reader.onload = ev=>{
        preview.src = ev.target.result;
        preview.style.display = "block";
        clearBtn.style.display = "block";
        label.textContent = f.name.length > 20 ? f.name.slice(0,18)+"…" : f.name;
      };
      reader.readAsDataURL(f);
    });

    clearBtn.addEventListener("click", ()=>{
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
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e=>{ img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = ()=>{
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(b=> b ? resolve(b) : reject(new Error("Error al comprimir")), "image/jpeg", 0.8);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------- Subida a Cloudinary ---------- */
async function uploadToCloudinary(blob){
  const fd = new FormData();
  fd.append("file", blob);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method:"POST", body:fd });
  if(!res.ok) throw new Error("Cloudinary respondió " + res.status);
  return (await res.json()).secure_url;
}

/* ============================================================ */
/*  GUARDAR AUTO (alta o edición)                               */
/* ============================================================ */
function msg(type, text){ const el = document.getElementById("formMsg"); el.className="msg "+type; el.textContent=text; }

document.getElementById("carForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const saveBtn = document.getElementById("saveBtn");
  const editId  = document.getElementById("editId").value;

  const car = {
    nombre:      document.getElementById("fName").value.trim(),
    anio:        Number(document.getElementById("fYear").value),
    precio:      Number(document.getElementById("fPrice").value),
    descripcion: document.getElementById("fDesc").value.trim(),
    transmision: document.getElementById("fTransmision").value || null,
    pasajeros:   Number(document.getElementById("fPasajeros").value) || null,
    combustible: document.getElementById("fCombustible").value || null,
    puertas:     Number(document.getElementById("fPuertas").value) || null,
    ac:          document.getElementById("fAc").checked
  };
  Object.keys(car).forEach(k=> car[k]===null && delete car[k]);

  if(!firebaseReady){
    msg("err","Firebase no está configurado.");
    return;
  }

  saveBtn.disabled = true;
  try {
    const fotosFinales = [];
    for(let i = 0; i < 3; i++){
      if(photoState[i].file){
        msg("info", `Subiendo foto ${i+1}…`);
        const blob = await compressImage(photoState[i].file);
        const url  = await uploadToCloudinary(blob);
        fotosFinales.push(url);
      } else if(photoState[i].existingUrl){
        fotosFinales.push(photoState[i].existingUrl);
      }
    }

    if(!fotosFinales.length && !editId){
      msg("err","Agrega al menos una foto del auto.");
      saveBtn.disabled = false;
      return;
    }

    if(fotosFinales.length) car.fotos = fotosFinales;

    if(editId){
      await db.collection("autos").doc(editId).update(car);
      msg("ok","Auto actualizado ✓");
    } else {
      car.creado = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("autos").add(car);
      msg("ok","Auto agregado ✓");
    }
    resetForm();
  } catch(err){
    console.error(err);
    msg("err","Error: " + err.message);
  } finally {
    saveBtn.disabled = false;
  }
});

/* ---------- Reset del formulario ---------- */
function resetPhotoSlot(slot){
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

function resetForm(){
  document.getElementById("carForm").reset();
  document.getElementById("editId").value = "";
  [0,1,2].forEach(resetPhotoSlot);
  document.getElementById("formTitle").textContent = "Agregar auto";
  document.getElementById("formNum").textContent = "+";
  document.getElementById("editBanner").style.display = "none";
  setTimeout(()=>{ const el=document.getElementById("formMsg"); el.textContent=""; el.className="msg"; }, 4000);
}

/* ---------- Editar ---------- */
window.editCar = function(id){
  const c = currentCars.find(x=>x.id===id);
  if(!c) return;

  document.getElementById("editId").value    = c.id;
  document.getElementById("fName").value     = c.nombre || "";
  document.getElementById("fYear").value     = c.anio || "";
  document.getElementById("fPrice").value    = c.precio || "";
  document.getElementById("fDesc").value     = c.descripcion || "";
  document.getElementById("fTransmision").value = c.transmision || "";
  document.getElementById("fPasajeros").value   = c.pasajeros || "";
  document.getElementById("fCombustible").value = c.combustible || "";
  document.getElementById("fPuertas").value     = c.puertas || "";
  document.getElementById("fAc").checked        = !!c.ac;

  const existingFotos = c.fotos && c.fotos.length ? c.fotos : (c.foto ? [c.foto] : []);
  [0,1,2].forEach(slot=>{
    resetPhotoSlot(slot);
    const url = existingFotos[slot] || "";
    if(url){
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
window.deleteCar = async function(id){
  if(!confirm("¿Eliminar este auto del catálogo?")) return;
  if(!firebaseReady){ alert("Firebase no está configurado."); return; }
  try { await db.collection("autos").doc(id).delete(); }
  catch(err){ alert("Error al eliminar: " + err.message); }
};
