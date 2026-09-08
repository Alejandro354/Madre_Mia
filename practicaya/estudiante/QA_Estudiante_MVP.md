# Documentación para QA — Página de Estudiante

## 1. Alcance

Esta entrega implementa **las 9 historias de usuario del backlog del estudiante**:

| # | Historia | Estado |
|---|---|---|
| 1 | Registro de usuario | ✅ Completo |
| 2 | Inicio de sesión | ✅ Completo |
| 3 | Ver vacantes | ✅ Completo |
| 4 | Seleccionar empresas y postularse | ⚠️ Completo salvo 4.5 (ver abajo) |
| 5 | Crear y editar perfil | ✅ Completo |
| 6 | Foto de perfil | ✅ Completo |
| 7 | Crear, cargar y editar portafolio | ✅ Completo |
| 8 | Eliminar documentos | ✅ Completo |
| 9 | Vincular redes sociales | ⚠️ Completo salvo 9.2 (ver abajo) |

Stack: **React (Vite) + Python (Flask) + SQLite + JWT**.

### Limitaciones conocidas

Dos criterios no se pueden probar todavía y **no son defectos**:

- **4.5 — Estados de postulación.** La columna `estado` existe y la interfaz sabe mostrar los cuatro estados con sus colores y pestañas, pero **nada en el sistema cambia el estado**: toda postulación nace como `Enviada` y no hay panel de empresa ni endpoint que la mueva. Al probar, todas las postulaciones aparecerán bajo "Todas" y "En revisión"; las pestañas "Aceptadas" y "Rechazadas" estarán vacías. Depende del módulo de empresas.
- **9.2 — Enlace visible en el perfil público.** No existe un perfil público: las redes se ven solo en el perfil propio del estudiante. Los criterios 9.1, 9.3 y 9.4 sí son verificables. Depende del módulo de empresas.

Fuera de alcance de este módulo: todo lo relativo a la vista de empresa (incluida la tarjeta "Sobre la empresa" del detalle de vacante).

---

## 2. Requisitos para ejecutar

### Backend (puerto 5000)

```powershell
cd backend
pip install -r requirements.txt
python seed.py
python app.py
```

### Frontend (puerto 5173)

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. El frontend hace proxy de `/api` y `/uploads` hacia el backend.

> **`python seed.py` BORRA Y RECREA la base de datos.** Elimina todos los usuarios, perfiles, portafolios y postulaciones, no solo las vacantes. Úsalo para empezar QA con estado limpio; después de correrlo hay que registrarse de nuevo (el token del navegador queda apuntando a un usuario que ya no existe y la app redirige al login).

> **Si ya tienes una base con datos que quieres conservar** y necesitas las columnas de detalle de vacante, usa `python migrate_vacancy_detail.py` en vez de `seed.py`. Es idempotente y no borra nada.

---

## 3. Estructura de la base de datos

### `users`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| nombre_completo | VARCHAR(150) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL, INDEX |
| password_hash | VARCHAR(255) | NOT NULL |
| failed_attempts | INTEGER | DEFAULT 0 |
| lockout_until | DATETIME | NULL |
| created_at | DATETIME | DEFAULT utcnow |

### `profiles`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| user_id | INTEGER | FK users.id, UNIQUE, NOT NULL |
| fecha_nacimiento | DATE | NULL |
| telefono | VARCHAR(30) | NULL |
| institucion | VARCHAR(150) | NULL |
| programa | VARCHAR(150) | NULL |
| semestre | VARCHAR(30) | NULL |
| ciudad | VARCHAR(100) | NULL |
| descripcion | TEXT | NULL |
| foto_url | VARCHAR(255) | NULL |

### `vacancies`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| empresa | VARCHAR(150) | NOT NULL |
| cargo | VARCHAR(150) | NOT NULL |
| ubicacion | VARCHAR(150) | NOT NULL |
| modalidad | VARCHAR(50) | NULL |
| jornada | VARCHAR(50) | NULL |
| fecha_publicacion | DATETIME | NOT NULL |
| descripcion | TEXT | NOT NULL |
| requisitos | TEXT | NOT NULL |
| beneficios | TEXT | NOT NULL |
| activa | BOOLEAN | DEFAULT true |
| fecha_limite | DATE | NULL |
| skills | TEXT | NULL — separadas por comas |
| experiencia | VARCHAR(100) | NULL |
| nivel_estudios | VARCHAR(100) | NULL |
| area | VARCHAR(100) | NULL |
| industria | VARCHAR(100) | NULL |

> No hay campo `salario`: se descartó porque en prácticas y pasantías casi nunca está definido.

### `portfolio_items`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| user_id | INTEGER | FK users.id, NOT NULL |
| tipo | VARCHAR(20) | NOT NULL — `archivo` o `enlace` |
| titulo | VARCHAR(150) | NOT NULL |
| archivo_url | VARCHAR(255) | NULL |
| enlace_url | VARCHAR(500) | NULL |
| created_at | DATETIME | DEFAULT utcnow |

### `social_links`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| user_id | INTEGER | FK users.id, NOT NULL |
| red | VARCHAR(20) | NOT NULL — `linkedin`, `github` o `instagram` |
| url | VARCHAR(500) | NOT NULL |

Restricción única: `(user_id, red)` — una sola URL por red y usuario.

### `applications`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| user_id | INTEGER | FK users.id, NOT NULL |
| vacancy_id | INTEGER | FK vacancies.id, NOT NULL |
| estado | VARCHAR(30) | DEFAULT `Enviada` |
| created_at | DATETIME | DEFAULT utcnow |

Restricción única: `(user_id, vacancy_id)` — impide postularse dos veces (criterio 4.3).

### `application_documents`

Enlaza la postulación con los ítems del portafolio enviados (criterio 4.2).

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| application_id | INTEGER | FK applications.id, NOT NULL |
| portfolio_item_id | INTEGER | FK portfolio_items.id, NOT NULL |

### `vacancy_favorites`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INTEGER | PK |
| user_id | INTEGER | FK users.id, NOT NULL |
| vacancy_id | INTEGER | FK vacancies.id, NOT NULL |
| created_at | DATETIME | DEFAULT utcnow |

Restricción única: `(user_id, vacancy_id)`.

**Relaciones con borrado en cascada:** `users 1—1 profiles`; `applications 1—N application_documents` (al eliminar una postulación se borran sus vínculos, pero **no** los ítems del portafolio).

---

## 4. Endpoints de la API

Todas las rutas protegidas requieren el header `Authorization: Bearer <access_token>`. Si el token es válido pero el usuario ya no existe (típico tras `seed.py`), responden **401** con `"Sesión inválida o usuario no encontrado"`.

Los errores tienen siempre la forma `{"errors": {"<campo>": "mensaje"}}` o `{"errors": {"general": "mensaje"}}`.

**Todas las respuestas** incluyen el header `X-Response-Time` con el tiempo del backend en milisegundos (ver §6).

### Autenticación

| Método | Ruta | Body | Respuesta esperada |
|---|---|---|---|
| POST | `/api/auth/register` | `{ nombre_completo, email, password, confirm_password }` | 201 con `user` y tokens; 400/409 con `errors` |
| POST | `/api/auth/login` | `{ email, password }` | 200 con tokens y `user`; 400/401/429 con `errors` |
| POST | `/api/auth/refresh` | header con el `refresh_token` | 200 con `access_token` |
| GET | `/api/auth/me` | — | 200 con `user` (y `profile` si existe) |

### Perfil

| Método | Ruta | Body / Form | Respuesta esperada |
|---|---|---|---|
| GET | `/api/profile` | — | 200 con `profile` (o `profile: null`) |
| PUT | `/api/profile` | `{ fecha_nacimiento, telefono, institucion, programa, semestre, ciudad, descripcion }` | 200 con `profile`; 400 con `errors` |
| POST | `/api/profile/photo` | `multipart/form-data`, campo `file` | 200 con `foto_url`; 400/413 con `errors` |

### Vacantes

| Método | Ruta | Respuesta esperada |
|---|---|---|
| GET | `/api/vacancies` | 200 con `vacancies` ordenadas de más reciente a más antigua. Cada una trae `empresa, cargo, ubicacion, modalidad, jornada, fecha_publicacion, descripcion` y los flags `guardada` y `aplicada` |
| GET | `/api/vacancies/<id>` | 200 con el detalle: lo anterior más `requisitos, beneficios, fecha_limite, skills` (lista), `experiencia, nivel_estudios, area, industria` |

### Portafolio

| Método | Ruta | Body / Form | Respuesta esperada |
|---|---|---|---|
| GET | `/api/portfolio` | — | 200 con `items` |
| POST | `/api/portfolio` | `multipart/form-data`: `titulo` + (`file` **o** `enlace`) | 201 con `item`; 400 con `errors` |
| PUT | `/api/portfolio/<id>` | igual que POST | 200 con `item`; 400/404 con `errors` |
| DELETE | `/api/portfolio/<id>` | `?force=true` para confirmar | 200; **409 con `warning`** si está vinculado a una postulación activa |

### Redes sociales

| Método | Ruta | Body | Respuesta esperada |
|---|---|---|---|
| GET | `/api/socials` | — | 200 con `socials` |
| POST | `/api/socials` | `{ red, url }` | 200 con `social`; 400 con `errors` |
| DELETE | `/api/socials/<red>` | — | 200; 404 si no está vinculada |

### Postulaciones

| Método | Ruta | Body | Respuesta esperada |
|---|---|---|---|
| GET | `/api/applications` | — | 200 con `applications` (más reciente primero) |
| POST | `/api/applications` | `{ vacancy_id }` | 201; **400 con `missing_section: "perfil"`** si el perfil está incompleto; 409 si ya se postuló; 404 si la vacante no existe |
| DELETE | `/api/applications/<id>` | — | 200; 404 si no es del usuario o no existe |

### Guardados (favoritas)

| Método | Ruta | Body | Respuesta esperada |
|---|---|---|---|
| GET | `/api/favorites` | — | 200 con `vacancies` |
| POST | `/api/favorites` | `{ vacancy_id }` | 201 si es nueva; 200 si ya estaba guardada |
| DELETE | `/api/favorites/<vacancy_id>` | — | 200; 404 si no estaba guardada |

---

## 5. Casos de prueba

> Convención: los mensajes entre comillas deben aparecer **exactamente** como se indican.

### 5.1 Registro de usuario (historia 1)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| REG-01 | 1.1 | Ir a `/register` | Se muestran: nombre completo, correo, contraseña y confirmar contraseña |
| REG-02 | 1.4 | Dejar campos vacíos y enviar | No se envía; "Este campo es obligatorio" junto a cada campo vacío |
| REG-03 | 1.7 | Ingresar `correo.invalido` | "Formato de correo inválido" y no se envía |
| REG-04 | 1.5 | Contraseña `abc` (o sin número) | "La contraseña debe tener mínimo 8 caracteres, incluyendo letras y números" |
| REG-05 | 1.6 | Contraseña y confirmación distintas | "Las contraseñas no coinciden" |
| REG-06 | 1.3 | Registrar un correo ya existente | "Este correo ya está registrado. Inicia sesión o usa otro correo" y **no** crea la cuenta |
| REG-07 | 1.2 | Datos válidos | Crea la cuenta y redirige a `/perfil`, que muestra el formulario "Completa tu perfil" |

### 5.2 Inicio de sesión (historia 2)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| LOG-01 | 2.1 | Login con credenciales válidas | Inicia sesión y redirige a **`/vacantes`** (el panel principal) en menos de 3 s — ver §6 |
| LOG-02 | 2.2 | Login con contraseña errónea | "Correo o contraseña incorrectos", sin indicar qué campo falla |
| LOG-03 | 2.3 | Correo o contraseña vacíos | "Este campo es obligatorio" por campo; **no se realiza el intento** contra el servidor |
| LOG-04 | 2.4 | Fallar 5 veces seguidas con un correo registrado | Al 5.º intento: "Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos". Intentos posteriores: "Cuenta bloqueada temporalmente. Intenta de nuevo en X minuto(s)" |
| LOG-05 | 2.4 | Fallar con un correo **no** registrado | Solo "Correo o contraseña incorrectos", sin el aviso de bloqueo (no se revela si la cuenta existe) |

> El aviso "Después de 5 intentos fallidos la cuenta se bloqueará por 5 minutos" solo aparece si el correo **sí** está registrado.

### 5.3 Ver vacantes (historia 3)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| VAC-01 | 3.1 | Entrar a `/vacantes` | Cuadrícula de tarjetas con empresa, cargo, ubicación y antigüedad ("Publicado hoy"), ordenadas de más reciente a más antigua |
| VAC-02 | 3.2 | Sin vacantes activas | "No hay vacantes disponibles en este momento" en lugar de una lista vacía |
| VAC-03 | 3.3 | Clic en una tarjeta | Detalle con descripción del cargo, requisitos (en viñetas), empresa, beneficios, "Sobre el rol" y skills |
| VAC-04 | 3.1 | Usar el buscador y los filtros | Filtran sin recargar. Si nada coincide: "Ninguna vacante coincide con los filtros" |
| VAC-05 | 3.4 | Medición de tiempo | Ver §6 |

### 5.4 Postularse y guardar (historia 4)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| POS-01 | 4.1 | Clic en el marcador de una tarjeta | Se guarda y aparece en "Guardados". Volver a pulsarlo la quita |
| POS-02 | 4.4 | Postularse con el perfil incompleto | No se postula; "Completa tu perfil antes de postularte" con enlace "Ir a mi perfil" |
| POS-03 | 4.2 | Postularse con perfil completo | "Postulación enviada con éxito". Si hay portafolio, se adjunta automáticamente |
| POS-04 | 4.3 | Volver a postularse a la misma vacante | El botón queda deshabilitado como "Postulado" / "Ya te has postulado" |
| POS-05 | 4.5 | Abrir "Mis postulaciones" | Cada postulación muestra su estado. **Ver limitación en §1: hoy todas dicen "Enviada"** |
| POS-06 | — | Eliminar una postulación | Pide confirmación; al aceptar desaparece sin recargar y muestra "Postulación eliminada". La vacante vuelve a permitir postularse |

### 5.5 Crear y editar perfil (historia 5)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| PER-01 | 5.1 | Abrir `/perfil` sin perfil creado | Formulario con fecha de nacimiento, teléfono, ciudad, institución, programa, semestre y descripción |
| PER-02 | 5.4 | Guardar con un campo vacío | No guarda y marca el campo con "Este campo es obligatorio" |
| PER-03 | 5.3 | Llenar todo y guardar | "Perfil actualizado correctamente" y la vista de perfil refleja los cambios de inmediato |
| PER-04 | 5.2 | Pulsar "Editar perfil" y cambiar un campo | Permite editar cualquier campo en cualquier momento |
| PER-05 | 5.5 | Modificar un campo y navegar a otra sección **sin guardar** | Aparece el modal "Cambios sin guardar" con las opciones Cancelar / Descartar y salir |
| PER-06 | 5.5 | Modificar un campo y **cerrar la pestaña** sin guardar | El navegador muestra su propia advertencia de salida |
| PER-07 | 5.4 | Teléfono `abc` / semestre `20` | "El teléfono debe contener solo números y tener entre 7 y 15 dígitos" / "El semestre debe ser un número entre 1 y 12" |
| PER-08 | 5.4 | Fecha de nacimiento futura | "La fecha de nacimiento no puede ser futura" |

### 5.6 Foto de perfil (historia 6)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| FOT-01 | 6.1 | Subir JPG o PNG de máximo 5 MB | Se carga correctamente |
| FOT-02 | 6.2 | Subir GIF u otro formato, o mayor a 5 MB | "Formato no válido o archivo demasiado pesado. Usa JPG o PNG de máximo 5 MB" y no carga |
| FOT-03 | 6.3 | Subir una nueva foto teniendo otra | Reemplaza la anterior y muestra la nueva |
| FOT-04 | 6.4 | Subir foto válida | "Foto de perfil actualizada" |

> El botón de la cámara sobre el avatar funciona tanto en la vista de perfil como en el modo edición.

### 5.7 Portafolio (historia 7)

Pestaña "Portafolio" dentro de `/perfil`.

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| POR-01 | 7.1 | Agregar con título + archivo PDF/JPG/PNG | "Portafolio guardado correctamente" y aparece en la lista |
| POR-02 | 7.1 | Agregar con título + enlace externo | Se guarda como tipo "Enlace" y el enlace es clicable |
| POR-03 | 7.3 | Adjuntar un formato no soportado (ej. `.docx`) | "Formato no soportado. Usa PDF, JPG, PNG o un enlace válido" |
| POR-04 | 7.4 | Adjuntar un archivo mayor a 10 MB | "El archivo supera el tamaño máximo de 10 MB" |
| POR-05 | 7.1 | Guardar sin título | "El título es obligatorio" |
| POR-06 | 7.1 | Guardar sin archivo ni enlace | "Adjunta un archivo o ingresa un enlace" |
| POR-07 | 7.2 | Editar un elemento y reemplazar su archivo | "Portafolio guardado correctamente" y el elemento queda actualizado |
| POR-08 | 7.5 | Guardar cualquier cambio | Se muestra el mensaje de éxito |

### 5.8 Eliminar documentos (historia 8)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| ELI-01 | 8.1 | Pulsar la papelera de un elemento del portafolio | Ventana "Eliminar documento" con "¿Seguro que deseas eliminar este documento?" |
| ELI-02 | 8.3 | Pulsar Cancelar | La ventana se cierra y el documento sigue intacto |
| ELI-03 | 8.2 | Confirmar | "Documento eliminado" y la lista se actualiza **sin recargar la página** |
| ELI-04 | 8.4 | Eliminar un documento adjunto a una postulación activa | Advertencia: "Este documento está vinculado a una postulación en curso. Eliminarlo puede afectar su evaluación", con la opción "Eliminar de todos modos" |

> **Cómo preparar ELI-04:** crear un ítem de portafolio, completar el perfil, postularse a una vacante (el ítem se adjunta solo) y recién entonces intentar eliminarlo.

### 5.9 Redes sociales (historia 9)

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| RED-01 | 9.1 | Abrir el modo edición del perfil | Aparecen LinkedIn, GitHub e Instagram |
| RED-02 | 9.2 | Guardar `https://www.linkedin.com/in/usuario` | "Red social guardada" y el enlace queda visible y clicable en la vista de perfil |
| RED-03 | 9.3 | Guardar `htp://mal` o una URL de otro dominio | "El enlace ingresado no es válido" y **no** se guarda |
| RED-04 | 9.3 | Guardar en LinkedIn una URL de GitHub | "El enlace ingresado no es válido" — cada red solo acepta su propio dominio |
| RED-05 | 9.4 | Pulsar el botón de desvincular | "Red social desvinculada" y vuelve a mostrarse como "Sin vincular" |

Cada red solo acepta URLs de su propio dominio: `linkedin.com`, `github.com` o `instagram.com`, con o sin `www.`.

> **Inconsistencia conocida (frontend vs. backend).** Desde la interfaz solo se aceptan URLs `https://`, pero el endpoint `POST /api/socials` también acepta `http://`. Probando por la UI el comportamiento es el correcto; probando la API directamente, una URL `http://www.linkedin.com/in/usuario` se guarda. No afecta al criterio 9.3 (que solo pide validar el formato), pero conviene igualar las dos validaciones.

---

## 6. Medición de tiempos (criterios 2.1 y 3.4)

Dos criterios exigen un límite de 3 segundos:

- **2.1** — iniciar sesión y redirigir al panel en menos de 3 s.
- **3.4** — el listado de vacantes debe cargar en máximo 3 s con conexión estándar.

La app los mide y los muestra, así que **no hace falta cronómetro**.

### Dónde se ve

En `/vacantes`, bajo la fila de filtros, aparece una línea gris:

```
4 vacantes · cargadas en 383 ms · sesión iniciada en 842 ms
```

- **"cargadas en"** → criterio 3.4. Se mide desde antes de pedir los datos hasta que las tarjetas quedan pintadas (incluye red, servidor y render — no solo la petición HTTP).
- **"sesión iniciada en"** → criterio 2.1. Se mide desde el clic en "Iniciar sesión" hasta la redirección al panel. **Solo aparece la primera vez que se abre el panel tras entrar**; al recargar desaparece, porque el dato se consume al leerse. Para volver a verlo hay que cerrar sesión y entrar de nuevo.

| ID | Criterio | Pasos | Resultado esperado |
|---|---|---|---|
| PERF-01 | 2.1 | Iniciar sesión con credenciales correctas | El panel muestra "sesión iniciada en …" con un valor **menor a 3 s** |
| PERF-02 | 3.4 | Abrir `/vacantes` | La línea muestra "cargadas en …" con un valor **menor a 3 s** |
| PERF-03 | 3.4 | Recargar `/vacantes` varias veces | El valor se mantiene estable y siempre bajo 3 s |

### Verificación independiente (opcional)

1. DevTools (F12) → pestaña **Network** → recargar `/vacantes`.
2. Buscar `GET /api/vacancies` y leer la columna **Time**: es el tiempo de la petición, algo menor que el que muestra la app (que además incluye el render).
3. En **Headers** de esa petición, `X-Response-Time` indica cuánto tardó solo el backend. Si `X-Response-Time` es bajo pero *Time* es alto, el cuello de botella es la red, no el servidor.

### Simular "conexión estándar"

En local los tiempos salen muy bajos (SQLite y servidor en la misma máquina). Si el evaluador exige una conexión realista: DevTools → **Network** → throttling → **Fast 3G**, y recargar. El indicador debe seguir por debajo de 3 s.

---

## 7. Mensajes de validación (referencia)

### Generales

| Contexto | Mensaje |
|---|---|
| Campo obligatorio vacío | "Este campo es obligatorio" |
| Error inesperado (frontend) | "Ocurrió un error. Intenta de nuevo." |
| Token válido pero usuario inexistente | "Sesión inválida o usuario no encontrado" |
| Ruta inexistente | "Recurso no encontrado" |

### Registro e inicio de sesión

| Contexto | Mensaje |
|---|---|
| Formato de correo inválido | "Formato de correo inválido" |
| Contraseña débil | "La contraseña debe tener mínimo 8 caracteres, incluyendo letras y números" |
| Contraseñas distintas | "Las contraseñas no coinciden" |
| Correo duplicado | "Este correo ya está registrado. Inicia sesión o usa otro correo" |
| Login incorrecto | "Correo o contraseña incorrectos" |
| Aviso de bloqueo (solo si la cuenta existe) | "Correo o contraseña incorrectos. Después de 5 intentos fallidos la cuenta se bloqueará por 5 minutos." |
| Bloqueo aplicado | "Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos" |
| Bloqueo activo | "Cuenta bloqueada temporalmente. Intenta de nuevo en X minuto(s)" |

### Perfil y foto

| Contexto | Mensaje |
|---|---|
| Perfil guardado | "Perfil actualizado correctamente" |
| Fecha inválida | "Fecha de nacimiento inválida" |
| Fecha futura | "La fecha de nacimiento no puede ser futura" |
| Teléfono inválido | "El teléfono debe contener solo números y tener entre 7 y 15 dígitos" |
| Semestre fuera de rango | "El semestre debe ser un número entre 1 y 12" |
| Foto inválida | "Formato no válido o archivo demasiado pesado. Usa JPG o PNG de máximo 5 MB" |
| Foto guardada | "Foto de perfil actualizada" |

### Portafolio y documentos

| Contexto | Mensaje |
|---|---|
| Guardado | "Portafolio guardado correctamente" |
| Sin título | "El título es obligatorio" |
| Sin archivo ni enlace | "Adjunta un archivo o ingresa un enlace" |
| Formato no soportado | "Formato no soportado. Usa PDF, JPG, PNG o un enlace válido" |
| Archivo demasiado grande | "El archivo supera el tamaño máximo de 10 MB" |
| Confirmación de borrado | "¿Seguro que deseas eliminar este documento?" |
| Documento borrado | "Documento eliminado" |
| Vinculado a postulación activa | "Este documento está vinculado a una postulación en curso. Eliminarlo puede afectar su evaluación" |

### Postulaciones, guardados y redes

| Contexto | Mensaje |
|---|---|
| Postulación enviada | "Postulación enviada con éxito" |
| Perfil incompleto | "Completa tu perfil antes de postularte" |
| Ya postulado | "Ya te has postulado a esta vacante" |
| Postulación eliminada | "Postulación eliminada" |
| Vacante guardada | "Vacante guardada" |
| Vacante quitada | "Vacante quitada de guardados" |
| Red social guardada | "Red social guardada" |
| Red social desvinculada | "Red social desvinculada" |
| URL de red inválida | "El enlace ingresado no es válido" |

### Reglas

- **Contraseña:** mínimo 8 caracteres, al menos una letra y un número.
- **Correo:** formato `usuario@dominio.com`.
- **Teléfono:** 7 a 15 dígitos; admite `+`, espacios, guiones y paréntesis.
- **Semestre:** número entero entre 1 y 12.
- **Foto:** JPG o PNG, máximo 5 MB.
- **Portafolio:** PDF, JPG o PNG, máximo 10 MB por archivo.
- **Redes:** solo HTTPS y solo el dominio de cada red.

---

## 8. Datos de prueba

`python seed.py` inserta 4 vacantes, con fechas de publicación escalonadas de 2 días para poder verificar el orden del criterio 3.1:

| Empresa | Cargo | Ubicación | Modalidad | Jornada |
|---|---|---|---|---|
| TechNova | Desarrollador Frontend Junior | Bogotá, Colombia | Presencial | Tiempo completo |
| DataSur | Analista de Datos | Medellín, Colombia | Híbrido | Tiempo completo |
| CreativoLab | Diseñador Gráfico | Cali, Colombia | Remoto | Medio tiempo |
| FinanzasPro | Practicante de Finanzas | Bogotá, Colombia | Presencial | Medio tiempo |

Las cuatro traen además fecha límite, skills, experiencia, nivel de estudios, área e industria, para poder probar el detalle completo (VAC-03).

**Usuarios:** no hay ninguno pre-cargado; hay que crearlos desde `/register`.

**Para probar VAC-02** (sin vacantes activas), poner `activa = 0` en la base:

```powershell
cd backend
python -c "import sqlite3; c=sqlite3.connect('app.db'); c.execute('update vacancies set activa=0'); c.commit()"
```

Para revertirlo, cambiar `activa=0` por `activa=1`.
