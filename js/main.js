// Chef&Nutri — comportamento compartilhado por todas as páginas do site:
// menu mobile, animação de revelar ao rolar, carrosséis de produtos,
// acordeões (detalhe do produto e FAQ), seletor de quantidade e
// formulários decorativos (sem back-end).
(function () {
  'use strict';

  // ---- Menu mobile (drawer) ----
  var menuBtn = document.getElementById('menuBtn');
  var drawerClose = document.getElementById('drawerClose');
  var drawerOverlay = document.getElementById('drawerOverlay');

  function openMenu() { document.body.classList.add('menu-open'); }
  function closeMenu() { document.body.classList.remove('menu-open'); }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (drawerClose) drawerClose.addEventListener('click', closeMenu);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ---- Revelar ao rolar ----
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
    }
  }

  // ---- Carrosséis de produtos (setas) ----
  document.querySelectorAll('[data-carousel-prev], [data-carousel-next]').forEach(function (btn) {
    var name = btn.getAttribute('data-carousel-prev') || btn.getAttribute('data-carousel-next');
    var dir = btn.hasAttribute('data-carousel-prev') ? -1 : 1;
    btn.addEventListener('click', function () {
      var track = document.querySelector('[data-carousel="' + name + '"]');
      if (track) track.scrollBy({ left: dir * track.clientWidth * 0.82, behavior: 'smooth' });
    });
  });

  // ---- Acordeão de único painel aberto (usado no detalhe do produto e no FAQ) ----
  function setupExclusiveAccordion(itemSelector, triggerSelector, symbolSelector) {
    var items = document.querySelectorAll(itemSelector);
    items.forEach(function (item) {
      var trigger = item.querySelector(triggerSelector);
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        var wasOpen = item.classList.contains('is-open');
        items.forEach(function (other) {
          other.classList.remove('is-open');
          var sym = other.querySelector(symbolSelector);
          if (sym) sym.textContent = '+';
        });
        if (!wasOpen) {
          item.classList.add('is-open');
          var sym = item.querySelector(symbolSelector);
          if (sym) sym.textContent = '−';
        }
      });
    });
  }
  setupExclusiveAccordion('.accordion-item', '[data-accordion-trigger]', '.accordion-symbol');
  setupExclusiveAccordion('.faq-item', '[data-faq-trigger]', '.faq-symbol');

  // ---- Seletor de quantidade (página de detalhe do produto) ----
  document.querySelectorAll('.qty-row').forEach(function (row) {
    var val = row.querySelector('[data-qty-val]');
    var dec = row.querySelector('[data-qty-dec]');
    var inc = row.querySelector('[data-qty-inc]');
    if (!val) return;
    if (dec) dec.addEventListener('click', function () {
      val.textContent = String(Math.max(1, parseInt(val.textContent, 10) - 1));
    });
    if (inc) inc.addEventListener('click', function () {
      val.textContent = String(parseInt(val.textContent, 10) + 1);
    });
  });

  // ---- Formulários decorativos (sem back-end nesta versão estática) ----
  document.querySelectorAll('[data-prevent-submit]').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  });
})();
