# ContiGO — Prototipo (vista usuario, no prestador)

Prototipo navegable de la landing de ContiGO con tracking de eventos integrado,
pensado para correr pruebas de usabilidad y validar hipótesis sin tener que
construir analítica desde cero cada vez.

## Qué incluye

- `app.py` — servidor Flask con 3 vistas: landing, usuario y experto, más el tracking y el dashboard.
- `templates/landing.html` — **página de inicio**: portada + selección de rol (usuario / experto) + registro falso.
- `templates/usuario.html` — vista de la persona que busca un trámite (la que ya tenías).
- `templates/experto.html` — **nuevo**: panel del experto/asesor (ofertar servicios, ver solicitudes, reputación).
- `templates/dashboard.html` — panel donde ves los resultados de las pruebas (`/dashboard`).
- `static/js/auth.js` — modal de registro falso (común + campos extra de experto).
- `static/js/session.js` — aplica el nombre/rol guardado del registro a `usuario.html` y `experto.html`.
- `static/js/interactions.js` — interactividad de `usuario.html` (búsqueda, perfiles, chat, etc.).
- `static/js/experto.js` — interactividad de `experto.html` (publicar servicios, responder solicitudes).
- `static/img/portada.png` — la imagen de portada que subiste.
- `events.db` — base SQLite donde se guardan los eventos (se crea sola al arrancar).

## Cómo funciona el flujo

1. Entras a `/` (la landing con la portada).
2. Eliges "Soy persona natural" o "Soy experto / asesor" → se abre el modal de registro falso.
   - Ambos roles piden: nombre, usuario, correo, contraseña.
   - Si eliges experto, además pide: profesión, años de experiencia, descripción y "subir título SENESCYT" (no se sube de verdad a ningún lado — es solo para que el flujo se sienta completo).
3. Al "crear cuenta", te lleva a `/usuario` o `/experto` según el rol, y ese nombre queda guardado en el navegador (sessionStorage) para personalizar saludo y perfil.
4. Desde cualquiera de esas dos vistas, el ícono de flecha junto a tu nombre te regresa a `/`.

Nota: el registro es 100% simulado (no hay base de usuarios real ni contraseñas guardadas en serio). Es justo lo que necesitas para un prototipo de validación — si más adelante quieres cuentas reales, ahí sí conviene una base de datos y autenticación de verdad.


## Cómo correrlo en tu máquina

```bash
cd contigo
python -m venv venv
source venv/bin/activate          # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Abre **http://localhost:5000** para la landing y
**http://localhost:5000/dashboard** para ver las métricas en vivo.

## Cómo agregar un evento nuevo (sin tocar Python)

En el HTML, a cualquier botón o link que quieras medir, agrégale:

```html
<button data-track="nombre_del_evento" data-track-label="texto opcional para identificarlo">
  Mi botón
</button>
```

Eso es todo. El `tracking.js` lo detecta solo y lo manda al backend.
Útil para que, en las próximas semanas, agregues la vista del prestador de
servicios sin reescribir la lógica de analítica.

## Cómo correrlo gratis en la web (para repartir el link a tus testers)

**Opción recomendada: Render.com**

1. Sube esta carpeta a un repositorio de GitHub (público o privado).
2. Entra a render.com → "New +" → "Web Service" → conecta tu repo de GitHub.
3. Configura:
   - Build command: `pip install -r requirements.txt`
   - Start command: `python app.py`
4. Render te da gratis una URL pública tipo `https://contigo.onrender.com`.

**Alternativa: PythonAnywhere** (también gratis, pensado específicamente para
Flask; un poco más manual de configurar pero no depende de GitHub).

⚠️ **Importante para tus pruebas**: en el plan gratuito de Render, el servidor
"duerme" tras un rato sin uso y el archivo `events.db` puede reiniciarse en
cada redeploy. Para una ronda de pruebas con usuarios reales:
1. Corre la prueba completa en una sola sesión de despliegue (sin redeploys).
2. Al terminar la ronda, entra a `/dashboard` y descarga el CSV con el botón
   "Exportar eventos en CSV" — eso ya no depende del servidor.

## Próximos pasos sugeridos

- Vista del prestador de servicios (semana siguiente).
- Si vas a correr pruebas moderadas (con el usuario presente), puedes
  complementar este tracking cuantitativo con una sesión grabada (ej. con
  Zoom u OBS) para ver el "por qué" detrás del clic, no solo el "qué".
