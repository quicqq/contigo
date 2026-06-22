# ContiGO — Prototipo (vista usuario, no prestador)

Prototipo navegable de la landing de ContiGO con tracking de eventos integrado,
pensado para correr pruebas de usabilidad y validar hipótesis sin tener que
construir analítica desde cero cada vez.

## Qué incluye

- `app.py` — servidor Flask: sirve la landing, recibe eventos y muestra el dashboard.
- `templates/index.html` — la landing (vista de usuario que busca un trámite).
- `templates/dashboard.html` — panel donde ves los resultados de las pruebas.
- `static/js/tracking.js` — script que registra automáticamente cualquier clic
  en un elemento con el atributo `data-track="nombre_del_evento"`.
- `events.db` — base SQLite donde se guardan los eventos (se crea sola al arrancar).

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
