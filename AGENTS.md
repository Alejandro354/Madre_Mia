# AGENTS.md

Student recruitment platform ("PractiCompu"). Two apps: Flask backend + Vite/React frontend. UI and backend messages are in **Spanish**. Not a git repo.

## Stack / layout
- `backend/` — Flask + SQLite + Flask-JWT-Extended. App factory `app.py` (`create_app()`); blueprints `auth.py`, `profile.py`, `vacancies.py`, `portfolio.py`, `socials.py`, `applications.py`, `favorites.py`. Models in `models.py`, shared serializers + `require_user` in `helpers.py`.
- `frontend/` — Vite + React 19 + React Router v7 + axios. Pure CSS (`src/App.css`, `src/index.css`; variables in `:root`). No Tailwind, no test framework.
- Frontend structure: `src/api` (axios services), `src/components`, `src/context` (AuthContext), `src/pages`, `src/utils/validators.js`.

## Commands
- Backend: `pip install -r requirements.txt`, `python seed.py`, `python app.py` (runs `0.0.0.0:5000`).
- Frontend: `npm install`, `npm run dev` (port 5173; Vite proxies `/api` and `/uploads` to `localhost:5000`), `npm run build`, `npm run lint` (oxlint, not eslint).
- No test suite. Verify with `npm run build` + `npm run lint` and ad-hoc backend smoke tests via `app.test_client()`.

## Critical gotchas
- **`python seed.py` drops and recreates ALL tables** — it deletes users, not just re-seeds. After running it, any browser JWT becomes stale (points at a deleted user). The backend then returns 401 and the frontend should redirect to login; the user must log in again.
- **No migrations framework**, but you do NOT have to drop the DB to add a column. `seed.py` drops everything (deletes users); SQLite supports `ALTER TABLE ADD COLUMN`, so write a one-off idempotent script instead — see `backend/migrate_vacancy_detail.py` as the pattern (checks `PRAGMA table_info`, adds only what's missing, backfills with `COALESCE` so it never overwrites existing values, safe to re-run). Add the column to `models.py` **and** to `seed.py` so fresh installs match.
- **Ad-hoc backend tests will destroy `backend/app.db` unless you redirect the DB *before* `create_app()`.** `create_app()` calls `db.init_app(app)` and `db.create_all()`, so the engine is already bound to `config.Config`'s URI by the time it returns — setting `app.config["SQLALCHEMY_DATABASE_URI"]` afterwards is silently ignored and every write (including `db.drop_all()`) hits the real DB. `Config.SQLALCHEMY_DATABASE_URI` is a hardcoded path (no env var), so the only way is to patch it *before* the call:

  ```python
  import config
  config.Config.SQLALCHEMY_DATABASE_URI = "sqlite:///" + tmp_path
  from app import create_app
  app = create_app()
  ```

  Then assert you actually landed on the throwaway file — `with app.app_context(): assert "app.db" not in str(db.engine.url)` — before any write.
- **Auth decorator convention**: protected endpoints use `@require_user` (from `helpers.py`), NOT raw `@jwt_required()`. `@jwt_required(refresh=True)` is only for `/api/auth/refresh`. `require_user` returns 401 "Sesión inválida o usuario no encontrado" when the JWT is valid but the user no longer exists.
- **Error responses**: endpoints return JSON `{"errors": {"<field>": "msg"}}` (field keys) or `{"errors": {"general": "msg"}}`. Frontend `extractErrors()` in `src/api/client.js` relies on this shape.
- **Exact validation messages matter** — they map to acceptance criteria in `Criterios_Aceptacion_Estudiante.docx` and `QA_Estudiante_MVP.md`. Don't reword casually (e.g. "Correo o contraseña incorrectos", "Este campo es obligatorio").

## Non-obvious behavior already implemented
- Axios response interceptor (`src/api/client.js`) auto-refreshes the access token on 401, but **excludes `/api/auth/login` and `/api/auth/refresh`** from the redirect logic (otherwise a wrong login reloads the page and hides the error).
- Login blocking: 5 failed attempts lock the account 5 min. Backend returns `account_exists` alongside the generic error so the frontend only shows the "will block" hint for real accounts.
- File uploads land in `backend/uploads/` and are served at `/uploads/<file>`. Photo: JPG/PNG ≤ 5 MB (size checked explicitly). Portfolio: PDF/JPG/PNG ≤ 10 MB (global `MAX_CONTENT_LENGTH` is 10 MB).
- Postulation ("Postularme") requires a complete profile (all fields). Portfolio is optional; if items exist, they are linked to the application as `ApplicationDocument` rows.
- `DELETE /api/applications/<id>` lets the student withdraw a postulation. It filters by `id` **and** `user_id`, so someone else's application returns 404 (not 403 — don't leak existence). `Application.documents` cascades, so the `ApplicationDocument` rows go with it while the `PortfolioItem`s are kept. Deleting frees the `(user_id, vacancy_id)` unique constraint, so the student can re-apply and `vacancy.aplicada` flips back to `false`.

## Design state
The Figma-based redesign was reverted; the frontend is a basic custom CSS design. Profile page has two underline tabs ("Perfil" / "Portafolio"); user menu (photo + name + dropdown) lives in `src/components/UserMenu.jsx` rendered by `ProtectedRoute`. "Inicio"/Dashboard page was removed — post-login route is `/vacantes`.

Both profile tabs share a two-column shell: `.split-view` / `.split-view-aside` (sticky) / `.split-view-main` inside a `page--wide`, collapsing to one column at 768px. Shared card styling is the `.pv-*` prefix in `App.css`.

- **Perfil (lectura)** — `src/components/ProfileView.jsx`: left aside with avatar + camera badge, name, role, location/email, and a read-only "Redes sociales" card (fetches `getSocials` itself); right column with a dark "Editar perfil" pill and the Datos personales / Datos académicos / Descripción profesional cards.
- **Perfil (edición)** — the `editing || !hasProfile` branch of `src/pages/Profile.jsx`, same shell: left aside repeats the avatar card (camera badge + "Cambiar foto"), right column has a `pv-main-top--split` header with Cancelar/Guardar and the same three cards as inputs, then the editable `SocialsSection` below the `<form>` (kept outside it — no nested forms). The hidden photo file input lives in `Profile.jsx` and is triggered from both views. There is no separate "Contacto" card — Ciudad sits in Datos personales.
- Shared inline SVG icons live in `src/components/icons.jsx` (all exports are components, so oxlint's `only-export-components` stays quiet — don't export non-component helpers from a `.jsx` that also exports a component).

**App shell**: `ProtectedRoute` renders only the sidebar + `<main class="app-content">`. Each protected page renders its own `<Topbar title subtitle>` (`src/components/Topbar.jsx`) as the first element of a fragment — that's what carries the page heading, the optional centered slot (Vacantes puts its search box there), and the right-hand actions (decorative chat + bell, then `UserMenu`). There is no `.page-title` class any more. Sidebar is `PrácticaYa` (bolt tile + wordmark drawn in CSS/SVG, `public/logo.png` is unused) with three icon links: Vacantes, Mis postulaciones, Guardados.

**Vacantes** (`src/pages/Vacancies.jsx`) is a card grid (`.vac-*`): search + 4 filters + sort, all **client-side** over the single `GET /api/vacancies` response — there is no search/filter endpoint. Cards (`src/components/VacancyCard.jsx`) apply and bookmark in place; the company logo tile is an initial over a colour hashed from the company name, since there is no logo field. The card body is a `<button>`, not a link, so the bookmark/apply buttons aren't nested inside an anchor. Favoriting is optimistic and reverts on error.

**Mis postulaciones** (`src/pages/Applications.jsx`) is a `.panel` with underline tabs and `.app-row` rows: status pill, delete button, chevron to the vacancy. `estado` is a free-text column defaulting to `"Enviada"` and **nothing in the app changes it yet**, so the tabs filter on a derived bucket (`bucketOf`): `Acepta*` → accepted, `Rechaza*` → rejected, everything else (including `Enviada`) → review. The pill shows the real `estado` string but is coloured by bucket — don't relabel `Enviada` as `En revisión`.

**Medición de tiempos** (criterios de aceptación 2.1 y 3.4): `src/utils/perf.js` + `src/components/PerfNote.jsx` muestran, bajo los filtros de Vacantes, una línea gris con el tiempo de carga del listado y —solo la primera vez tras entrar— el del login. `Login.jsx` mide y guarda su tiempo en `sessionStorage` porque se desmonta al redirigir; `Vacancies.jsx` lo consume con `useState(takeLoginTime)` (inicializador, no `useRef().current`, que dispara el warning `react(refs)` de oxlint). El tiempo del listado se toma dentro de un `requestAnimationFrame` para incluir el render, no solo la petición. El backend añade `X-Response-Time` a cada respuesta (`app.py`, `before_request`/`after_request`) y `cors.init_app` lo expone. Es instrumentación para QA, no una función de producto — el procedimiento está en `QA_Estudiante_MVP.md` §5.1.

**Detalle de vacante** (`src/pages/VacancyDetail.jsx`, CSS `.vd-*`): breadcrumb + `.split-view--main-first` (contenido a la izquierda, aside a la derecha — el `.split-view` normal es al revés). `requisitos` y `beneficios` siguen siendo texto libre en la BD; `src/utils/text.js` los parte en viñetas (`splitSentences`, por frases) y chips (`splitItems`, por comas y " y "). `Vacancy` ganó 6 columnas opcionales (`fecha_limite`, `skills` — texto separado por comas que `vacancy_detail` devuelve ya como lista —, `experiencia`, `nivel_estudios`, `area`, `industria`); todas nullable, así que una vacante sin ellas renderiza sin romperse. **No hay campo `salario`**: se quitó a propósito porque en prácticas y pasantías casi nunca está definido (`migrate_vacancy_detail.py` lo elimina vía `DROPPED_COLUMNS` si viene de una base que lo tenía).

**Pendiente del mockup:** la tarjeta "Sobre la empresa" (descripción, nº de empleados, ubicación principal, sitio web) **no está implementada** a propósito: requiere un modelo `Company` y esa parte la lleva otro integrante del equipo. Hoy `empresa` es solo un `String` en `Vacancy`. Cuando exista el modelo, la tarjeta va en el `<aside>` de `VacancyDetail.jsx`, encima de "Lo que necesitas saber".

Both screens share `.panel` (white rounded container) and the company logo tile, whose colour is hashed from the company name in `src/utils/tileColor.js` — a plain `.js` so components can import it without tripping `only-export-components`. Vacantes uses a solid tile, Mis postulaciones a tinted one. Guardados still uses the older flat `.vacancy-card` list style.
- **Portafolio** — `src/pages/Portfolio.jsx` (`.pf-*` CSS): left aside with a folder hero + item count and the "Agregar elemento" form; right column lists items as cards with a type icon (doc/link), title, tag, link and icon-only edit/delete buttons. Native file inputs are hidden and driven by `.pf-file-btn` (shows the chosen filename). The component returns a fragment, not a `.card`.
