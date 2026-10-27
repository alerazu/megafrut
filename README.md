# Megafrut · megafrut.cl

Sitio web estático de Megafrut (exportadora de fruta fresca, San Fernando, Región de O’Higgins, Chile), en español e inglés.

La página se **genera** a partir de archivos de contenido. Para cambiar textos, frutas o datos de contacto **no hace falta tocar código**: se editan archivos JSON y se ejecuta el build.

## Estructura

```
content/
  site.json        Nombre, URL, idiomas, contacto, menú y certificación
  fruits.json      Las frutas (una entrada por fruta)
  lang/es.json     Todos los textos en español
  lang/en.json     Todos los textos en inglés
src/template.html  Estructura de la página
assets/            Imágenes, CSS y JS
build.mjs          Genera index.html (sin dependencias, requiere Node 18+)
index.html         Archivo generado: no se edita a mano
```

## Generar la página

```bash
node build.mjs      # o: npm run build
```

Si falta una traducción, una imagen o un dato, el build **se detiene y lista los problemas** sin tocar `index.html`.

Para verla en local: `python3 -m http.server` y abrir http://localhost:8000.

## Tareas frecuentes

### Cambiar un texto
Editar la clave en `content/lang/es.json` y en `content/lang/en.json`, y ejecutar el build.

### Cambiar correo, teléfono, WhatsApp o enlace de Google Maps
Editar `contact` en `content/site.json`. Los enlaces `mailto:`, `tel:` y WhatsApp se actualizan solos en toda la página.

### Agregar una fruta
1. Copiar la foto a `assets/img/` (formato JPG, ~1200 px de ancho).
2. Agregar una entrada en `content/fruits.json`:

```json
{
  "id": "plums",
  "image": "plums.jpg",
  "focus": "center",
  "accent": "#5A2A5E",
  "name":        { "es": "Ciruelas", "en": "Plums" },
  "season":      { "es": "enero a febrero", "en": "January to February" },
  "description": { "es": "…", "en": "…" }
}
```
3. Ejecutar el build. Las columnas de la grilla se ajustan solas al número de frutas.

`focus` indica qué parte de la foto queda visible al recortarla (por ejemplo `70% center`). `accent` es el color de la temporada.

### Agregar un idioma
1. Copiar `content/lang/en.json` a `content/lang/fr.json` y traducirlo.
2. Agregar el idioma en `languages` de `content/site.json`: `{ "code": "fr", "label": "FR", "name": "Français" }`.
3. En `content/fruits.json`, agregar `"fr"` en `name`, `season` y `description` de cada fruta.
4. Ejecutar el build. Aparece el botón FR y el sitio también detecta el idioma del navegador.

El idioma por defecto se define en `defaultLanguage` (`site.json`). También funciona `?lang=en` en la URL.

### Agregar o quitar una sección del menú
Agregar la sección en `src/template.html` con su `id`, y una entrada en `nav` de `content/site.json` con su clave de texto (por ejemplo `nav.prices`), que debe existir en cada archivo de `content/lang/`.

### Certificación GLOBALG.A.P.
En `certification` de `content/site.json`:

- `"ggn"`: número GGN de Megafrut (se muestra en la franja).
- `"logo"`: nombre del archivo del logo oficial dentro de `assets/img/` (PNG con fondo transparente o SVG).
- `"enabled": false` oculta la franja completa.

> El logo GLOBALG.A.P. es marca registrada: debe usarse el archivo entregado por el organismo certificador, junto al GGN, y solo en comunicación entre empresas (no en envases para consumidor).

## Publicación

Es un sitio estático. En Netlify, Cloudflare Pages o GitHub Pages:

- **Build command:** `npm run build` (o dejarlo vacío, porque `index.html` ya está generado y versionado)
- **Publish directory:** `.` (raíz del repositorio)

El workflow `.github/workflows/build.yml` regenera `index.html` automáticamente al subir cambios a `content/`, `src/` o `build.mjs`.

## Compatibilidad

Pensado para Safari/iOS 15+, Chrome, Edge y Firefox: `viewport-fit=cover` y áreas seguras en iPhone, botones de 44 px, ícono `apple-touch-icon` y JavaScript ES5 sin dependencias.
