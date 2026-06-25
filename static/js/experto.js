function openModal(html) {
  document.getElementById("modalBox").innerHTML =
    '<button class="modal-close" onclick="closeModal()">✕</button>' + html;
  document.getElementById("modalOverlay").classList.add("open");
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

const SERVICE_CATEGORIES = [
  "Trámites notariales / civiles",
  "RUC / impuestos (SRI)",
  "Trámites de tránsito",
  "Visas / migración",
  "Auditoría / finanzas",
  "Otro",
];

function getServices() {
  try {
    return JSON.parse(sessionStorage.getItem("contigo_services") || "[]");
  } catch (e) {
    return [];
  }
}
function saveServices(list) {
  sessionStorage.setItem("contigo_services", JSON.stringify(list));
}

// ============================================================
// Inicialización: nombre/profesión y estado del perfil
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(sessionStorage.getItem("contigo_user") || "null");

  const welcomeName = document.getElementById("welcomeName");
  if (user && user.nombre && welcomeName) welcomeName.textContent = user.nombre.split(" ")[0];

  const profRole = document.getElementById("profRole");
  if (user && user.profesion && profRole) profRole.textContent = user.profesion;

  const badge = document.getElementById("verifyBadge");
  if (user && !user.tituloSubido && badge) {
    badge.textContent = "⚠️ Falta subir tu título";
    badge.className = "badge-pill badge-pending";
  }

  renderServices();
  updateCompleteness();
});

function updateCompleteness() {
  const user = JSON.parse(sessionStorage.getItem("contigo_user") || "null");
  const services = getServices();
  let pct = 40; // por registrarse
  if (user && user.bio) pct += 15;
  if (user && user.tituloSubido) pct += 20;
  if (services.length > 0) pct += 25;
  pct = Math.min(pct, 100);

  document.getElementById("completePct").textContent = pct + "%";
  document.getElementById("completeFill").style.width = pct + "%";
}

// ============================================================
// Ofertar servicio
// ============================================================
function openServiceForm() {
  if (window.contigoTrack) window.contigoTrack("abre_formulario_servicio", "");
  openModal(`
    <h2>Ofertar un servicio</h2>
    <div class="sub">Así lo verán los usuarios que buscan ayuda con su trámite.</div>
    <label>Título del servicio</label>
    <input type="text" id="svcTitulo" placeholder="Ej: Te ayudo a renovar tu licencia de conducción">
    <label>Categoría</label>
    <select id="svcCategoria">
      ${SERVICE_CATEGORIES.map((c) => `<option>${c}</option>`).join("")}
    </select>
    <label>Descripción</label>
    <textarea id="svcDesc" placeholder="Explica qué incluye tu servicio y cómo trabajas..."></textarea>
    <label>Precio referencial (USD)</label>
    <input type="number" id="svcPrecio" min="0" placeholder="Ej: 20">
    <label>Tiempo estimado</label>
    <input type="text" id="svcTiempo" placeholder="Ej: 2-3 días hábiles">
    <button class="btn-primary" style="width:100%; justify-content:center; margin-top:18px; background:#16a34a;" onclick="submitService()">
      Publicar servicio
    </button>
  `);
}

function submitService() {
  const titulo = document.getElementById("svcTitulo").value.trim();
  const desc = document.getElementById("svcDesc").value.trim();
  const categoria = document.getElementById("svcCategoria").value;
  const precio = document.getElementById("svcPrecio").value;
  const tiempo = document.getElementById("svcTiempo").value.trim();

  if (!titulo || !desc) {
    showToast("Agrega al menos un título y una descripción");
    return;
  }

  const services = getServices();
  services.push({ titulo, desc, categoria, precio, tiempo, id: Date.now() });
  saveServices(services);

  if (window.contigoTrack) window.contigoTrack("servicio_publicado", titulo);
  closeModal();
  showToast("¡Servicio publicado! Ya es visible para los usuarios.");
  renderServices();
  updateCompleteness();
}

function deleteService(id) {
  const services = getServices().filter((s) => s.id !== id);
  saveServices(services);
  renderServices();
  updateCompleteness();
}

function renderServices() {
  const grid = document.getElementById("serviceGrid");
  const services = getServices();

  if (services.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size:30px;">🗂️</div>
        Aún no has publicado servicios.<br>Publica el primero para que los usuarios puedan encontrarte.
        <div style="margin-top:14px;"><button class="btn-primary" style="background:#16a34a;" onclick="openServiceForm()">Ofertar mi primer servicio</button></div>
      </div>`;
    return;
  }

  grid.innerHTML = services
    .map(
      (s) => `
      <div class="service-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <span class="tag">${s.categoria}</span>
          <button class="modal-close" style="position:static; width:24px; height:24px; font-size:12px;" onclick="deleteService(${s.id})">✕</button>
        </div>
        <div class="pro-name">${s.titulo}</div>
        <div class="pro-desc" style="min-height:auto;">${s.desc}</div>
        <div class="meta">⏱ ${s.tiempo || "Tiempo a coordinar"}</div>
        <div class="price">${s.precio ? "$" + s.precio : "Precio a convenir"}</div>
      </div>`
    )
    .join("");
}

// ============================================================
// Chat con un lead (usuario que pidió ayuda)
// ============================================================
function openLeadChat(name) {
  if (window.contigoTrack) window.contigoTrack("click_responder_solicitud", name);
  openModal(`
    <h2>Chat con ${name}</h2>
    <div class="chat-window">
      <div class="chat-messages" id="chatMessages">
        <div class="chat-bubble me">Hola, vi tu solicitud. Cuéntame un poco más para ayudarte mejor.</div>
        <div class="chat-bubble bot">¡Hola! Claro, te cuento los detalles en un momento 🙂</div>
      </div>
      <div class="chat-input-row">
        <input type="text" id="chatInput" placeholder="Escribe un mensaje..." onkeydown="if(event.key==='Enter') sendLeadChat()">
        <button class="btn-primary" style="background:#16a34a;" onclick="sendLeadChat()">➤</button>
      </div>
    </div>
  `);
}

function sendLeadChat() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  const box = document.getElementById("chatMessages");
  box.insertAdjacentHTML("beforeend", `<div class="chat-bubble me">${text}</div>`);
  input.value = "";
  box.scrollTop = box.scrollHeight;
  if (window.contigoTrack) window.contigoTrack("envia_mensaje_chat_experto", text);
}
