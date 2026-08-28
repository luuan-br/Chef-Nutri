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

  // ---- Submenu de categorias no drawer ----
  document.querySelectorAll('[data-drawer-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.closest('.drawer-group');
      if (!group) return;
      var isOpen = group.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
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

  // ---- Carrosséis de produtos (setas + dots) ----
  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  document.querySelectorAll('[data-carousel]').forEach(function (track) {
    var name = track.getAttribute('data-carousel');
    var controls = document.querySelector('[data-carousel-controls="' + name + '"]');
    var dotsWrap = document.querySelector('[data-carousel-dots="' + name + '"]');
    var prevBtn = document.querySelector('[data-carousel-prev="' + name + '"]');
    var nextBtn = document.querySelector('[data-carousel-next="' + name + '"]');
    var dots = [];

    if (prevBtn) prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -track.clientWidth * 0.82, behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: track.clientWidth * 0.82, behavior: 'smooth' });
    });

    if (!controls || !dotsWrap) return;

    function buildDots() {
      var pages = Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
      if (pages === dots.length) return;
      dotsWrap.innerHTML = '';
      dots = [];
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'shelf-dot';
        dot.setAttribute('aria-label', 'Ir para posição ' + (i + 1));
        dot.addEventListener('click', (function (page) {
          return function () { track.scrollTo({ left: page * track.clientWidth, behavior: 'smooth' }); };
        })(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
      updateActiveDot();
    }

    function updateActiveDot() {
      if (!dots.length) return;
      var page = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === page); });
    }

    function checkOverflow() {
      var isScrollable = track.scrollWidth > track.clientWidth + 4;
      controls.classList.toggle('is-active', isScrollable);
      if (isScrollable) buildDots();
    }

    checkOverflow();
    window.addEventListener('resize', debounce(checkOverflow, 150));
    window.addEventListener('load', checkOverflow);
    track.addEventListener('scroll', debounce(updateActiveDot, 80));
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

  // ---- Adicionar ao carrinho (página de detalhe do produto) ----
  var addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn && window.ChefNutriCart) {
    addToCartBtn.addEventListener('click', function () {
      var id = addToCartBtn.getAttribute('data-product-id');
      var valEl = document.querySelector('.qty-row [data-qty-val]');
      var qty = valEl ? parseInt(valEl.textContent, 10) || 1 : 1;
      window.ChefNutriCart.addToCart(id, qty);
      window.ChefNutriCart.showToast('Produto adicionado ao carrinho');
    });
  }

  // ---- Formulários decorativos (sem back-end nesta versão estática) ----
  document.querySelectorAll('[data-prevent-submit]').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  });
})();
