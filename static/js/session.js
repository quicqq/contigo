// Lee los datos del "registro" simulado (guardados al crear cuenta en la
// landing) y los aplica donde haga falta. Si alguien entra directo a
// /usuario o /experto sin pasar por el registro, se queda con los valores
// por defecto del HTML — útil para demos rápidas sin tener que registrarse.

function getContigoUser() {
  try {
    return JSON.parse(sessionStorage.getItem("contigo_user") || "null");
  } catch (e) {
    return null;
  }
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

document.addEventListener("DOMContentLoaded", function () {
  const user = getContigoUser();
  if (!user || !user.nombre) return;

  const ini = initials(user.nombre);

  document.querySelectorAll("#topAvatar, #sideAvatar, #profAvatar").forEach((el) => (el.textContent = ini));
  const greeting = document.getElementById("topGreeting");
  if (greeting) greeting.textContent = "Hola, " + user.nombre.split(" ")[0];
  const sideName = document.getElementById("sideName");
  if (sideName) sideName.textContent = user.nombre;
  const sideEmail = document.getElementById("sideEmail");
  if (sideEmail && user.correo) sideEmail.textContent = user.correo;
  const profName = document.getElementById("profName");
  if (profName) profName.textContent = user.nombre;
  const profRole = document.getElementById("profRole");
  if (profRole && user.profesion) profRole.textContent = user.profesion;
});
