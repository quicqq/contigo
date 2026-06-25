// ============================================================
// Datos "de mentira" para que el prototipo se sienta funcional
// sin necesitar una base real de profesionales todavía.
// ============================================================
const PROFESSIONALS = {
  maria: {
    name: "María Fernanda López", role: "Abogada", color: "#ec4899", initials: "ML",
    rating: "4.9 (124 reseñas)", price: "Desde $25 por consulta",
    bio: "12 años de experiencia en trámites notariales y de derecho civil. Te acompaña en escrituras, poderes, declaraciones juradas y herencias.",
    specialties: ["Trámites notariales", "Herencias", "Poderes", "Declaraciones juradas"],
  },
  juan: {
    name: "Juan Pablo Martínez", role: "Contador Público", color: "#5b4fe3", initials: "JM",
    rating: "4.8 (98 reseñas)", price: "Desde $20 por consulta",
    bio: "Especialista en SRI: RUC, declaraciones de impuestos y contabilidad para personas naturales y pequeños negocios.",
    specialties: ["RUC", "Declaraciones SRI", "Contabilidad básica", "Facturación electrónica"],
  },
  ana: {
    name: "Ana Sofía Gómez", role: "Gestora Administrativa", color: "#16a34a", initials: "AG",
    rating: "4.7 (76 reseñas)", price: "Desde $15 por consulta",
    bio: "Te ayuda a agendar y completar trámites de tránsito: licencias, matriculación vehicular y permisos de circulación.",
    specialties: ["Licencias de conducción", "Matriculación", "Permisos de tránsito"],
  },
  david: {
    name: "David Morales", role: "Abogado Migratorio", color: "#f97316", initials: "DM",
    rating: "4.9 (112 reseñas)", price: "Desde $30 por consulta",
    bio: "Apoya procesos de visas, residencias y trámites ante la Cancillería y Migración para viajes y reubicación.",
    specialties: ["Visas de turismo", "Residencias", "Trámites migratorios"],
  },
};

const VIDEOS = {
  ruc: { title: "Cómo sacar el RUC", desc: "Aprende paso a paso cómo obtener tu RUC por primera vez ante el SRI." },
  licencia: { title: "Renovar licencia de conducción", desc: "Tutorial completo para renovar tu licencia sin contratiempos." },
  antecedentes: { title: "Certificado de antecedentes", desc: "Paso a paso para obtener tu certificado de antecedentes penales." },
  visa: { title: "Solicitar visa de turismo", desc: "Guía completa para solicitar tu visa de turismo ante Cancillería." },
};

// ============================================================
// Modal genérico
// ============================================================
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

// ============================================================
// Búsqueda (lo primero que casi todos van a tocar)
// ============================================================
function quickSearch(term) {
  document.getElementById("searchInput").value = term;
  runSearch();
}

function runSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const banner = document.getElementById("searchBanner");
  const allCards = document.querySelectorAll(".video-card, .pro-card");

  if (window.contigoTrack) window.contigoTrack("ejecuta_busqueda", query);

  if (!query) {
    allCards.forEach((c) => c.classList.remove("match", "dim"));
    banner.style.display = "none";
    return;
  }

  let matches = 0;
  allCards.forEach((card) => {
    const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
    const text = card.textContent.toLowerCase();
    const isMatch = keywords.includes(query) || text.includes(query);
    card.classList.toggle("match", isMatch);
    card.classList.toggle("dim", !isMatch);
    if (isMatch) matches++;
  });

  banner.style.display = "flex";
  if (matches > 0) {
    banner.innerHTML =
      `Mostrando ${matches} resultado(s) para "<b>${query}</b>" — <button onclick="clearSearch()">ver todo</button>`;
    document.querySelector(".match")?.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    banner.innerHTML =
      `No encontramos trámites o profesionales para "<b>${query}</b>". Prueba con otra palabra, o ` +
      `<button onclick="openPublishForm()">publica tu trámite</button> y te ayudamos a buscarlo.`;
  }
}

function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.querySelectorAll(".video-card, .pro-card").forEach((c) => c.classList.remove("match", "dim"));
  document.getElementById("searchBanner").style.display = "none";
}

// ============================================================
// Perfil de profesional
// ============================================================
function openProfile(id) {
  const p = PROFESSIONALS[id];
  if (!p) return;
  openModal(`
    <div style="display:flex; gap:14px; align-items:center; margin-bottom:6px;">
      <div style="width:56px; height:56px; border-radius:50%; background:${p.color}; color:white;
                  display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px;">${p.initials}</div>
      <div>
        <h2 style="padding-right:0;">${p.name}</h2>
        <div class="sub" style="margin:0;">${p.role} · ⭐ ${p.rating}</div>
      </div>
    </div>
    <p style="font-size:13.5px; line-height:1.5; color:var(--text-muted);">${p.bio}</p>
    <label>Especialidades</label>
    <div style="display:flex; flex-wrap:wrap; gap:6px;">
      ${p.specialties.map((s) => `<span class="tag">${s}</span>`).join("")}
    </div>
    <label>Tarifa referencial</label>
    <div style="font-size:14px; font-weight:600;">${p.price}</div>
    <button class="btn-primary" style="width:100%; justify-content:center; margin-top:18px;"
            onclick="contigoTrack('click_contactar_profesional','${p.name}'); closeModal(); openChat('${p.name}')">
      Contactar a ${p.name.split(" ")[0]}
    </button>
  `);
}

// ============================================================
// Video (modal simple con la info; aquí es donde insertarías el embed real de YouTube)
// ============================================================
function openVideoModal(id) {
  const v = VIDEOS[id];
  if (!v) return;
  openModal(`
    <h2>${v.title}</h2>
    <div class="sub">${v.desc}</div>
    <div style="background:#1e1b2e; border-radius:10px; aspect-ratio:16/9; display:flex; align-items:center;
                justify-content:center; color:white; font-size:13px; text-align:center; padding:20px;">
      🎬 Aquí se reproduciría el video tutorial.<br>(En la versión real, este recuadro será el video embebido de YouTube.)
    </div>
  `);
}

// ============================================================
// Mi perfil
// ============================================================
function openMyProfile() {
  openModal(`
    <h2>Mi perfil</h2>
    <div class="sub">Así te ven los profesionales cuando publicas un trámite.</div>
    <label>Nombre</label><input type="text" value="Carlos Ramírez" readonly>
    <label>Correo</label><input type="text" value="carlos.ramirez@email.com" readonly>
    <label>Ciudad</label><input type="text" value="Guayaquil, Ecuador" readonly>
    <button class="btn-outline" style="margin-top:18px;" onclick="showToast('La edición de perfil llegará en una próxima versión')">Editar datos</button>
  `);
}

// ============================================================
// Estados vacíos (Mis trámites / Favoritos)
// ============================================================
function openMyProcedures() {
  openModal(`
    <h2>Mis trámites</h2>
    <div class="empty-state">
      <div style="font-size:30px;">📄</div>
      Todavía no tienes trámites activos.<br>Cuando publiques uno o contactes a un profesional, aparecerá aquí.
      <div style="margin-top:14px;"><button class="btn-primary" onclick="closeModal(); openPublishForm()">Publicar mi primer trámite</button></div>
    </div>
  `);
}

function openFavorites() {
  openModal(`
    <h2>Favoritos</h2>
    <div class="empty-state">
      <div style="font-size:30px;">🤍</div>
      Aún no guardaste profesionales o trámites.<br>Toca el corazón en cualquier perfil para guardarlo aquí.
    </div>
  `);
}

function openSettings() {
  openModal(`
    <h2>Configuración</h2>
    <label>Notificaciones por correo</label>
    <select><option>Activadas</option><option>Desactivadas</option></select>
    <label>Idioma</label>
    <select><option>Español</option><option>English</option></select>
    <button class="btn-primary" style="width:100%; justify-content:center; margin-top:18px;" onclick="showToast('Preferencias guardadas'); closeModal();">Guardar</button>
  `);
}

function openNotifications() {
  openModal(`
    <h2>Notificaciones</h2>
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
      <div style="font-size:13.5px; padding:10px; background:var(--primary-light); border-radius:8px;">
        🔔 Juan Pablo Martínez respondió tu consulta sobre el RUC.
      </div>
      <div style="font-size:13.5px; padding:10px; background:var(--bg); border-radius:8px;">
        ✅ Tu certificado de antecedentes fue marcado como "en proceso".
      </div>
    </div>
  `);
}

function openMessages() {
  openModal(`
    <h2>Mensajes</h2>
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
      <div style="display:flex; gap:10px; padding:10px; border:1px solid var(--border); border-radius:10px; cursor:pointer;"
           onclick="closeModal(); openChat('María Fernanda López')">
        <div style="width:36px; height:36px; border-radius:50%; background:#ec4899; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px;">ML</div>
        <div style="flex:1;">
          <div style="font-weight:600; font-size:13.5px;">María Fernanda López</div>
          <div style="font-size:12.5px; color:var(--text-muted);">Claro, te ayudo con la escritura...</div>
        </div>
      </div>
      <div style="display:flex; gap:10px; padding:10px; border:1px solid var(--border); border-radius:10px; cursor:pointer;"
           onclick="closeModal(); openChat('Juan Pablo Martínez')">
        <div style="width:36px; height:36px; border-radius:50%; background:#5b4fe3; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px;">JM</div>
        <div style="flex:1;">
          <div style="font-weight:600; font-size:13.5px;">Juan Pablo Martínez</div>
          <div style="font-size:12.5px; color:var(--text-muted);">Ya revisé tu RUC, falta un paso...</div>
        </div>
      </div>
    </div>
  `);
}

// ============================================================
// Chat falso (sin backend de IA — respuestas guionadas)
// ============================================================
function openChat(withName) {
  const name = withName || "soporte ContiGO";
  openModal(`
    <h2>Chat con ${name}</h2>
    <div class="chat-window">
      <div class="chat-messages" id="chatMessages">
        <div class="chat-bubble bot">Hola Carlos 👋 ¿En qué trámite te podemos ayudar hoy?</div>
      </div>
      <div class="chat-input-row">
        <input type="text" id="chatInput" placeholder="Escribe un mensaje..." onkeydown="if(event.key==='Enter') sendChat()">
        <button class="btn-primary" onclick="sendChat()">➤</button>
      </div>
    </div>
  `);
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  const box = document.getElementById("chatMessages");
  box.insertAdjacentHTML("beforeend", `<div class="chat-bubble me">${text}</div>`);
  input.value = "";
  box.scrollTop = box.scrollHeight;
  if (window.contigoTrack) window.contigoTrack("envia_mensaje_chat", text);

  setTimeout(() => {
    box.insertAdjacentHTML("beforeend",
      `<div class="chat-bubble bot">Gracias por contarnos. Un profesional verificado te responderá en breve 🙂</div>`);
    box.scrollTop = box.scrollHeight;
  }, 700);
}

// ============================================================
// Publicar trámite
// ============================================================
function openPublishForm() {
  openModal(`
    <h2>Publicar mi trámite</h2>
    <div class="sub">Cuéntanos qué necesitas y te conectamos con el profesional ideal.</div>
    <label>Tipo de trámite</label>
    <select id="pubTipo">
      <option>Trámite notarial / civil</option>
      <option>RUC / impuestos</option>
      <option>Licencia de conducción</option>
      <option>Visa / migración</option>
      <option>Otro</option>
    </select>
    <label>Describe lo que necesitas</label>
    <textarea id="pubDesc" placeholder="Ej: Necesito renovar mi licencia tipo B antes de fin de mes..."></textarea>
    <button class="btn-primary" style="width:100%; justify-content:center; margin-top:18px;" onclick="submitPublish()">Publicar trámite</button>
  `);
}

function submitPublish() {
  const desc = document.getElementById("pubDesc").value.trim();
  if (window.contigoTrack) window.contigoTrack("submit_publicar_tramite", desc);
  openModal(`
    <div class="empty-state">
      <div style="font-size:34px;">✅</div>
      <b>¡Listo! Tu trámite fue publicado.</b><br>
      Los profesionales disponibles podrán contactarte en las próximas horas.
      <div style="margin-top:16px;"><button class="btn-outline" onclick="closeModal()">Entendido</button></div>
    </div>
  `);
}
