# Megafrut – sitio web (megafrut.cl)

Landing page estática de Megafrut, en español e inglés, sin dependencias ni paso de compilación.

## Estructura

```
index.html          # página completa (HTML + CSS + selector ES/EN)
assets/img/         # fotos de frutas, entrada del fundo, logo e íconos
```

## Cómo editar

- **Textos:** están en el objeto `COPY` al final de `index.html`, uno por idioma (`es` y `en`).
  Cambia el texto ahí; el HTML tiene `data-i18n="clave"` en cada elemento.
- **Temporadas, contacto, ubicación:** también viven en `COPY`.
- **Fotos:** reemplaza los archivos de `assets/img/` conservando el nombre.

## Idioma

Al abrir la página se usa, en este orden: `?lang=es|en` en la URL, la última elección guardada
en el navegador, el idioma del navegador (inglés si empieza con `en`) y, por defecto, español.

## Compatibilidad con equipos Apple

Pensada para Safari en macOS, iPhone y iPad (Safari 15 / iOS 15 o superior):
`viewport-fit=cover` y márgenes de zona segura para iPhone con notch, `-webkit-text-size-adjust`,
botones sin estilo nativo (`-webkit-appearance`), objetivos táctiles de al menos 44 px,
`apple-touch-icon` para "Añadir a pantalla de inicio" y sin teléfonos autodetectados.
Los hovers solo se aplican con puntero real, para que no queden "pegados" en pantallas táctiles.

## Publicación

Es un sitio estático: sirve cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages,
servidor propio). Sube la carpeta tal cual; `index.html` debe quedar en la raíz.
Las URL de `og:image` y `canonical` asumen `https://megafrut.cl/`.
