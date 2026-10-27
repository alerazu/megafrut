// Genera index.html a partir de src/template.html y content/.
// Sin dependencias: solo necesita Node 18 o superior.   Uso:  node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readText = (p) => readFileSync(join(root, p), 'utf8');
const errors = [];
const fail = (msg) => errors.push(msg);

function readJSON(p) {
  try {
    return JSON.parse(readText(p));
  } catch (e) {
    fail(`No se pudo leer ${p}: ${e.message}`);
    return null;
  }
}

const esc = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeJSON = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// ---------- datos ----------
const site = readJSON('content/site.json');
const fruits = readJSON('content/fruits.json');
if (!site || !fruits) finish();

const langs = site.languages.map((l) => l.code);
const def = site.defaultLanguage;
if (!langs.includes(def)) fail(`defaultLanguage "${def}" no está en la lista "languages" de content/site.json`);

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}

const dict = {};
for (const code of langs) {
  const file = `content/lang/${code}.json`;
  const data = existsSync(join(root, file)) ? readJSON(file) : (fail(`Falta el archivo ${file}`), null);
  dict[code] = data ? flatten(data) : {};
}

// frutas: cada fruta aporta sus propias claves a cada idioma
const ids = new Set();
for (const f of fruits) {
  if (!f.id || !f.image) fail(`Cada fruta necesita "id" e "image" (revisa content/fruits.json)`);
  if (ids.has(f.id)) fail(`Fruta repetida: "${f.id}"`);
  ids.add(f.id);
  if (f.image && !existsSync(join(root, 'assets/img', f.image))) fail(`Fruta "${f.id}": no existe assets/img/${f.image}`);
  for (const code of langs) {
    for (const field of ['name', 'season', 'description']) {
      if (!f[field] || !f[field][code]) fail(`Fruta "${f.id}": falta "${field}" en "${code}" (content/fruits.json)`);
    }
    const d = dict[code];
    d[`fruit.${f.id}.name`] = f.name?.[code] ?? '';
    d[`fruit.${f.id}.season`] = `${d['fruits.seasonLabel'] ?? ''}: ${f.season?.[code] ?? ''}`;
    d[`fruit.${f.id}.description`] = f.description?.[code] ?? '';
  }
}

// enlaces que dependen del idioma y de los datos de contacto
for (const code of langs) {
  const d = dict[code];
  d['jobs.cvHref'] = `mailto:${site.contact.email}?subject=${encodeURIComponent(d['jobs.cvSubject'] ?? '')}`;
  d['jobs.waHref'] = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(d['jobs.waMessage'] ?? '')}`;
}

// todos los idiomas deben tener exactamente las mismas claves
const allKeys = new Set(Object.values(dict).flatMap((d) => Object.keys(d)));
for (const code of langs) {
  for (const k of allKeys) if (!(k in dict[code])) fail(`Falta la clave "${k}" en content/lang/${code}.json`);
}

// ---------- fragmentos ----------
const n = fruits.length;
const cols = { lg: n <= 4 ? Math.max(n, 1) : n <= 6 ? 3 : 4, md: Math.min(n, 3) || 1, sm: Math.min(n, 2) || 1 };

const whyCount = Object.keys(dict[def] ?? {}).filter((k) => /^why\.items\.\d+\.title$/.test(k)).length;

const cert = site.certification ?? {};
const certBlock = !cert.enabled
  ? ''
  : `<section id="certificacion" class="cert">
  <div class="wrap">
    ${
      cert.logo
        ? `<img class="cert-logo" src="assets/img/${esc(cert.logo)}" alt="GLOBALG.A.P." height="64">`
        : `<svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="26" fill="none" stroke="#E9B84A" stroke-width="3"/><path d="M17 29l8 8 14-16" fill="none" stroke="#E9B84A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    }
    <div class="cert-text">
      <h2 data-i18n="cert.title"></h2>
      <p data-i18n="cert.text"></p>
      ${cert.ggn ? `<p class="cert-ggn">GGN: ${esc(cert.ggn)}</p>` : ''}
    </div>
  </div>
</section>`;

const fragments = {
  nav: site.nav.map((i) => `<a href="#${esc(i.id)}" data-i18n="${esc(i.label)}"></a>`).join('\n      '),
  langButtons: site.languages
    .map((l) => `<button type="button" data-lang="${esc(l.code)}" aria-pressed="${l.code === def}">${esc(l.label)}</button>`)
    .join('\n      '),
  cards: fruits
    .map(
      (f) => `<article class="card">
        <img src="assets/img/${esc(f.image)}" data-i18n-alt="fruit.${esc(f.id)}.name" loading="lazy" decoding="async" style="object-position:${esc(f.focus || 'center')}">
        <div class="card-body">
          <h3 data-i18n="fruit.${esc(f.id)}.name"></h3>
          <span class="season" style="color:${esc(f.accent || '#14301F')}" data-i18n="fruit.${esc(f.id)}.season"></span>
          <p data-i18n="fruit.${esc(f.id)}.description"></p>
        </div>
      </article>`,
    )
    .join('\n      '),
  why: Array.from({ length: whyCount }, (_, i) => `<div><h3 data-i18n="why.items.${i}.title"></h3><p data-i18n="why.items.${i}.text"></p></div>`).join('\n      '),
  cert: certBlock,
  jsonld: safeJSON({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: `${site.url}assets/img/logo-megafrut.png`,
    email: site.contact.email,
    telephone: site.contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
  }),
  copy: safeJSON(dict),
};

// ---------- plantilla ----------
const ctx = {
  site,
  contact: site.contact,
  defaultLang: def,
  domain: new URL(site.url).hostname,
  year: new Date().getFullYear(),
  cols,
};

const lookup = (path) => {
  if (path.startsWith('t.')) {
    const v = dict[def]?.[path.slice(2)];
    if (v === undefined) fail(`La plantilla usa {{${path}}} pero no existe en content/lang/${def}.json`);
    return v ?? '';
  }
  let v = ctx;
  for (const part of path.split('.')) v = v?.[part];
  if (v === undefined) fail(`La plantilla usa {{${path}}} pero ese dato no existe`);
  return v ?? '';
};

let html = readText('src/template.html');
html = html.replace(/\{\{@(\w+)\}\}/g, (_, k) => {
  if (!(k in fragments)) fail(`La plantilla usa {{@${k}}} y no existe`);
  return fragments[k] ?? '';
});
html = html.replace(/\{\{([\w.]+)\}\}/g, (_, p) => esc(lookup(p)));

// rellena en el idioma por defecto los elementos marcados con data-i18n (la página sale completa antes de que cargue el JS)
const t = (key) => {
  const v = dict[def]?.[key];
  if (v === undefined) fail(`La plantilla usa data-i18n="${key}" pero no existe en content/lang/${def}.json`);
  return v ?? '';
};
html = html.replace(/(<[^>]*\sdata-i18n="([\w.]+)"[^>]*>)(<\/)/g, (_, open, key, close) => open + esc(t(key)).replace(/&quot;/g, '"') + close);
html = html.replace(/data-i18n-alt="([\w.]+)"/g, (_, key) => `data-i18n-alt="${key}" alt="${esc(t(key))}"`);
html = html.replace(/data-i18n-href="([\w.]+)"/g, (_, key) => `data-i18n-href="${key}" href="${esc(t(key))}"`);

if (/\{\{/.test(html)) fail('Quedaron marcadores {{ }} sin resolver en la plantilla');

// el aviso de la plantilla se reemplaza por uno que corresponde al archivo generado
html = html.replace(/<!--[\s\S]*?-->\n/, '<!-- Archivo generado por build.mjs a partir de src/template.html y content/. No lo edites a mano: cambia esos archivos y ejecuta `node build.mjs`. -->\n');

// ---------- salida ----------
function finish() {
  if (errors.length) {
    console.error(`\nNo se generó index.html. Hay ${errors.length} problema(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error('');
    process.exit(1);
  }
}
finish();
writeFileSync(join(root, 'index.html'), html);
console.log(`index.html generado: ${n} frutas, idiomas: ${langs.join(', ')} (por defecto ${def}), ${Object.keys(dict[def]).length} textos por idioma.`);
