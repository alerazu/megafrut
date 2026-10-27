/* Selector de idioma. Los textos vienen de <script id="copy"> (generado desde content/lang/*.json).
   Escrito en ES5 a propósito, para que funcione en cualquier Safari/iOS reciente sin transpilar. */
(function () {
  'use strict';

  var doc = document;
  var KEY = 'megafrut-lang';
  var COPY = JSON.parse(doc.getElementById('copy').textContent);
  var DEFAULT = doc.documentElement.getAttribute('data-default-lang');

  function has(code) { return Object.prototype.hasOwnProperty.call(COPY, code); }
  function read() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { window.localStorage.setItem(KEY, v); } catch (e) {} }
  function each(sel, fn) { Array.prototype.forEach.call(doc.querySelectorAll(sel), fn); }

  // Orden de prioridad: ?lang=xx, última elección guardada, idioma del navegador, idioma por defecto.
  function initial() {
    var q = /[?&]lang=([a-z]{2,3})\b/i.exec(window.location.search);
    if (q && has(q[1].toLowerCase())) return q[1].toLowerCase();
    var saved = read();
    if (saved && has(saved)) return saved;
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || DEFAULT];
    for (var i = 0; i < prefs.length; i++) {
      var p = String(prefs[i]).toLowerCase().split('-')[0];
      if (has(p)) return p;
    }
    return DEFAULT;
  }

  function apply(lang) {
    var t = COPY[lang];
    doc.documentElement.setAttribute('lang', lang);
    doc.title = t['meta.title'];
    var md = doc.getElementById('meta-desc');
    if (md) md.setAttribute('content', t['meta.description']);
    each('[data-i18n]', function (el) { el.textContent = t[el.getAttribute('data-i18n')]; });
    each('[data-i18n-alt]', function (el) { el.setAttribute('alt', t[el.getAttribute('data-i18n-alt')]); });
    each('[data-i18n-href]', function (el) { el.setAttribute('href', t[el.getAttribute('data-i18n-href')]); });
    each('.lang button', function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  each('.lang button', function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang');
      if (!has(l)) return;
      write(l);
      apply(l);
    });
  });

  apply(initial());
})();
