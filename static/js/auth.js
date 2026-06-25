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
// Registro falso. Campos comunes para ambos roles, y un bloque
// extra (profesión + título SENESCYT) solo si es experto.
// ============================================================
function openRegister(role) {
  if (window.contigoTrack) window.contigoTrack("abre_registro", role);

  const isExperto = role === "experto";

  const expertFields = `
    <label>Profesión</label>
    <select id="regProfesion">
      <option>Abogado/a</option>
      <option>Contador/a Público</option>
      <option>Economista</option>
      <option>Auditor/a</option>
      <option>Otro</option>
    </select>
    <label>Años de experiencia</label>
    <input type="number" id="regExperiencia" min="0" placeholder="Ej: 5">
    <label>Breve descripción profesional</label>
    <textarea id="regBio" placeholder="Ej: Especialista en trámites notariales y civiles..."></textarea>
    <label>Título profesional (registro SENESCYT)</label>
    <div class="file-upload" onclick="document.getElementById('regTitulo').click()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
      <span id="fileLabel">Subir PDF o imagen del título</span>
    </div>
    <input type="file" id="regTitulo" accept=".pdf,.jpg,.jpeg,.png" style="display:none;" onchange="onFileChosen(this)">
    <div class="sub" style="margin-top:6px;">Tu título se revisará antes de mostrar la insignia de "Verificado" en tu perfil.</div>
  `;

  openModal(`
    <h2>${isExperto ? "Crear perfil de experto" : "Crear cuenta de usuario"}</h2>
    <div class="sub">${isExperto ? "Cuéntanos quién eres para empezar a ofrecer tus servicios." : "Es rápido y gratis. Así te conectamos con el profesional ideal."}</div>

    <label>Nombre completo</label>
    <input type="text" id="regNombre" placeholder="Ej: Carlos Ramírez">
    <label>Nombre de usuario</label>
    <input type="text" id="regUsuario" placeholder="Ej: carlos.ramirez">
    <label>Correo electrónico</label>
    <input type="email" id="regCorreo" placeholder="Ej: carlos@correo.com">
    <label>Contraseña</label>
    <input type="password" id="regPass" placeholder="••••••••">

    ${isExperto ? expertFields : ""}

    <button class="btn-primary" style="width:100%; justify-content:center; margin-top:18px; ${isExperto ? 'background:#16a34a;' : ''}"
            onclick="submitRegister('${role}')">
      ${isExperto ? "Crear perfil de experto" : "Crear cuenta"}
    </button>
  `);
}

function onFileChosen(input) {
  const label = document.getElementById("fileLabel");
  if (input.files && input.files[0]) {
    label.textContent = "✅ " + input.files[0].name;
  }
}

function submitRegister(role) {
  const nombre = document.getElementById("regNombre").value.trim();
  const correo = document.getElementById("regCorreo").value.trim();

  if (!nombre || !correo) {
    showToast("Completa al menos tu nombre y correo para continuar");
    return;
  }

  const user = { nombre, correo, role };
  if (role === "experto") {
    user.profesion = document.getElementById("regProfesion").value;
    user.experiencia = document.getElementById("regExperiencia").value;
    user.bio = document.getElementById("regBio").value;
    const fileInput = document.getElementById("regTitulo");
    user.tituloSubido = !!(fileInput.files && fileInput.files[0]);
  }

  sessionStorage.setItem("contigo_user", JSON.stringify(user));
  if (window.contigoTrack) window.contigoTrack("registro_completado", role);

  window.location.href = role === "experto" ? "/experto" : "/usuario";
}
