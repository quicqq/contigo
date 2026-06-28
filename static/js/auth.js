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
// Paso 1: elegir "Crear cuenta" o "Iniciar sesión" te lleva primero
// a elegir el caso (persona natural / experto), y de ahí al formulario.
// ============================================================
function openAuthChoice(mode) {
  const isLogin = mode === "login";
  if (window.contigoTrack) window.contigoTrack(isLogin ? "abre_login" : "abre_registro_choice", "");

  const goUsuario = isLogin ? "openLogin('usuario')" : "openRegister('usuario')";
  const goExperto = isLogin ? "openLogin('experto')" : "openRegister('experto')";

  openModal(`
    <h2>${isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>
    <div class="sub">¿Cómo quieres entrar?</div>
    <div class="role-choice-grid">
      <div class="role-choice-card" onclick="${goUsuario}">
        <div class="role-icon" style="background:#eef0ff; color:#5b4fe3; width:42px; height:42px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>
        </div>
        <h4>Persona natural</h4>
        <p>Busco ayuda con un trámite</p>
      </div>
      <div class="role-choice-card" onclick="${goExperto}">
        <div class="role-icon" style="background:#e8f7ee; color:#16a34a; width:42px; height:42px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
        </div>
        <h4>Experto / asesor</h4>
        <p>Quiero ofrecer mis servicios</p>
      </div>
    </div>
  `);
}

// ============================================================
// REGISTRO (igual que antes: campos comunes + extra de experto)
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
    <div class="sub" style="margin-top:10px; text-align:center;">¿Ya tienes cuenta? <a href="#" onclick="openAuthChoice('login'); return false;">Inicia sesión</a></div>
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

  loginAs(user, "registro_completado");
}

// ============================================================
// LOGIN — con dos cuentas de prueba fijas para no registrarse
// cada vez: user/user (persona natural) y admin/admin (experto).
// ============================================================
const DEMO_ACCOUNTS = {
  usuario: {
    creds: { u: "user", p: "user" },
    profile: { nombre: "Usuario de Prueba", correo: "user@contigo.test", role: "usuario" },
  },
  experto: {
    creds: { u: "admin", p: "admin" },
    profile: {
      nombre: "Admin Experto", correo: "admin@contigo.test", role: "experto",
      profesion: "Abogado/a", experiencia: "8",
      bio: "Perfil de prueba para validar el panel de experto.", tituloSubido: true,
    },
  },
};

function openLogin(role) {
  if (window.contigoTrack) window.contigoTrack("abre_login_form", role);
  const demo = DEMO_ACCOUNTS[role].creds;
  const isExperto = role === "experto";

  openModal(`
    <h2>Iniciar sesión ${isExperto ? "como experto" : "como usuario"}</h2>
    <div class="sub">Cuenta de prueba: <b>${demo.u} / ${demo.p}</b></div>

    <button class="btn-outline" style="width:100%; margin-bottom:16px;" onclick="quickLogin('${role}')">
      ⚡ Entrar con la cuenta de prueba
    </button>

    <label>Usuario</label>
    <input type="text" id="loginUser" placeholder="ej: ${demo.u}">
    <label>Contraseña</label>
    <input type="password" id="loginPass" placeholder="••••••">
    <button class="btn-primary" style="width:100%; justify-content:center; margin-top:14px; ${isExperto ? 'background:#16a34a;' : ''}"
            onclick="submitLogin('${role}')">
      Iniciar sesión
    </button>
    <div class="sub" style="margin-top:10px; text-align:center;">¿No tienes cuenta? <a href="#" onclick="openAuthChoice('register'); return false;">Créala aquí</a></div>
  `);
}

function quickLogin(role) {
  loginAs(DEMO_ACCOUNTS[role].profile, "login_demo");
}

function submitLogin(role) {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();
  const demo = DEMO_ACCOUNTS[role].creds;

  if (u === demo.u && p === demo.p) {
    quickLogin(role);
  } else {
    showToast(`Usa la cuenta de prueba: ${demo.u} / ${demo.p}`);
  }
}

function loginAs(profile, trackEvent) {
  sessionStorage.setItem("contigo_user", JSON.stringify(profile));
  if (window.contigoTrack) window.contigoTrack(trackEvent, profile.role);
  window.location.href = profile.role === "experto" ? "/experto" : "/usuario";
}
