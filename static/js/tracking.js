(function () {
  // Identificador de sesión: persiste mientras la pestaña esté abierta.
  // Así podemos saber si "el mismo usuario" hizo varias acciones en orden.
  function getSessionId() {
    let sid = sessionStorage.getItem("contigo_session");
    if (!sid) {
      sid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
      sessionStorage.setItem("contigo_session", sid);
    }
    return sid;
  }

  function track(eventName, eventLabel) {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: getSessionId(),
        event_name: eventName,
        event_label: eventLabel || "",
        page: window.location.pathname,
      }),
    }).catch(function () {
      // Si falla el tracking, no debe romper la experiencia del usuario.
    });
  }

  // Registrar la vista de página al cargar.
  window.addEventListener("DOMContentLoaded", function () {
    track("pageview", document.title);

    // Cualquier elemento con data-track="nombre_evento" se registra solo.
    // No hay que tocar este archivo para instrumentar un botón nuevo.
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () {
        const eventName = el.getAttribute("data-track");
        const eventLabel = el.getAttribute("data-track-label") || el.textContent.trim();
        track(eventName, eventLabel);
      });
    });
  });

  // Exponer track() globalmente por si se necesita disparar eventos
  // personalizados desde otro script (ej. al abrir un modal).
  window.contigoTrack = track;
})();
