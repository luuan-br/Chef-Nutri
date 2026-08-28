// Chef&Nutri — filtros, ordenação e busca usados nas páginas de listagem de
// produtos (pizzas.html e busca.html). A Visualização Rápida (Quick View)
// fica em js/quickview.js, compartilhada com outras páginas.
(function () {
  'use strict';
  var grid = document.querySelector('[data-products-grid]');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-product]'));
  var searchInput = document.getElementById('searchInput');

  var activeTags = [];
  var sortBy = 'relevancia';

  // ---- Paginação (ativa apenas se a página tiver [data-pagination]) ----
  var PAGE_SIZE = 12;
  var paginationEl = document.querySelector('[data-pagination]');
  var currentPage = 1;

  function paginate(visible) {
    if (!paginationEl) return;
    var totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * PAGE_SIZE;
    visible.forEach(function (card, i) {
      if (i < start || i >= start + PAGE_SIZE) card.style.display = 'none';
    });
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    function addBtn(label, page, opts) {
      opts = opts || {};
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = opts.isNum ? 'pagination__num' : 'pagination__btn';
      btn.textContent = label;
      if (opts.isActive) { btn.classList.add('is-active'); }
      if (opts.disabled) { btn.disabled = true; }
      if (!opts.disabled && !opts.isActive) {
        btn.addEventListener('click', function () {
          currentPage = page;
          applyAll(false);
          grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      paginationEl.appendChild(btn);
    }

    function addEllipsis() {
      var span = document.createElement('span');
      span.className = 'pagination__ellipsis';
      span.textContent = '…';
      paginationEl.appendChild(span);
    }

    addBtn('‹', currentPage - 1, { disabled: currentPage === 1 });

    var pages = [];
    for (var p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) pages.push(p);
    }
    var lastAdded = 0;
    pages.forEach(function (p) {
      if (lastAdded && p - lastAdded > 1) addEllipsis();
      addBtn(String(p), p, { isNum: true, isActive: p === currentPage });
      lastAdded = p;
    });

    addBtn('›', currentPage + 1, { disabled: currentPage === totalPages });
  }

  // ---- Filtros (chips desktop + gaveta mobile) ----
  var allChipEls = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var clearBtns = Array.prototype.slice.call(document.querySelectorAll('[data-clear-filters]'));
  var filterCountBadge = document.querySelector('[data-filter-count]');

  function toggleTag(tag) {
    var idx = activeTags.indexOf(tag);
    if (idx === -1) activeTags.push(tag); else activeTags.splice(idx, 1);
    syncFilterUI();
    applyAll();
  }

  function syncFilterUI() {
    allChipEls.forEach(function (chip) {
      chip.classList.toggle('is-active', activeTags.indexOf(chip.getAttribute('data-filter')) !== -1);
    });
    var hasActive = activeTags.length > 0;
    clearBtns.forEach(function (btn) { btn.classList.toggle('is-visible', hasActive); });
    if (filterCountBadge) {
      filterCountBadge.textContent = String(activeTags.length);
      filterCountBadge.classList.toggle('is-visible', hasActive);
    }
  }

  allChipEls.forEach(function (chip) {
    chip.addEventListener('click', function () { toggleTag(chip.getAttribute('data-filter')); });
  });
  clearBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeTags = [];
      syncFilterUI();
      applyAll();
    });
  });

  // ---- Gaveta de filtro mobile ----
  var openFiltersBtn = document.querySelector('[data-open-filters]');
  var closeFiltersEls = Array.prototype.slice.call(document.querySelectorAll('[data-close-filters]'));
  if (openFiltersBtn) openFiltersBtn.addEventListener('click', function () { document.body.classList.add('filter-open'); });
  closeFiltersEls.forEach(function (el) { el.addEventListener('click', function () { document.body.classList.remove('filter-open'); }); });

  // ---- Ordenação ----
  var sortSelect = document.querySelector('.sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortBy = sortSelect.value;
      applyAll();
    });
  }

  // ---- Busca (apenas busca.html) ----
  var searchSummary = document.querySelector('[data-search-summary]');
  function currentQuery() { return searchInput ? searchInput.value.trim().toLowerCase() : ''; }
  if (searchInput) {
    searchInput.addEventListener('input', applyAll);
  }

  // ---- Aplica filtro + busca + ordenação + contagem ----
  var resultCountEl = document.querySelector('[data-result-count]');
  var emptyState = document.querySelector('[data-empty-state]');

  function applyAll(resetPage) {
    if (resetPage !== false) currentPage = 1;
    var q = currentQuery();
    var visible = [];
    cards.forEach(function (card) {
      var tags = card.getAttribute('data-tags').split('|');
      var name = card.getAttribute('data-name');
      var matchesFilters = activeTags.every(function (t) { return tags.indexOf(t) !== -1; });
      var matchesSearch = !q || name.indexOf(q) !== -1 || tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
      var show = matchesFilters && matchesSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible.push(card);
    });

    // Ordenação por reposicionamento no DOM
    if (sortBy === 'menor-preco') visible.sort(function (a, b) { return parseFloat(a.dataset.price) - parseFloat(b.dataset.price); });
    else if (sortBy === 'maior-preco') visible.sort(function (a, b) { return parseFloat(b.dataset.price) - parseFloat(a.dataset.price); });
    else if (sortBy === 'nome') visible.sort(function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); });
    visible.forEach(function (card) { grid.appendChild(card); });

    paginate(visible);

    var n = visible.length;
    if (resultCountEl) {
      var label = n === 1 ? resultCountEl.getAttribute('data-singular') : resultCountEl.getAttribute('data-plural');
      resultCountEl.textContent = n + ' ' + label;
    }
    if (emptyState) emptyState.classList.toggle('is-visible', n === 0);
    grid.style.display = n === 0 ? 'none' : '';

    if (searchSummary) {
      var suffix = n + ' ' + (n === 1 ? 'resultado encontrado' : 'resultados encontrados');
      searchSummary.textContent = q ? 'Resultados para "' + searchInput.value.trim() + '" · ' + suffix : 'Mostrando todos os produtos · ' + suffix;
    }
  }

  applyAll();
})();
