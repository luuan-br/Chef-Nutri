// Chef&Nutri — modal de Visualização Rápida (Quick View) com botão "Comprar
// Agora". Compartilhado por qualquer página que tenha cards de produto com
// [data-quickview] e o overlay #qvOverlay (home, pizzas, busca, posts do blog).
(function () {
  'use strict';
  var qvOverlay = document.getElementById('qvOverlay');
  if (!qvOverlay) return;

  var DATA = (window.CHEFNUTRI_DATA && window.CHEFNUTRI_DATA.products) || [];
  var produtoBase = window.PRODUTO_BASE || 'produto/';

  var qvImage = document.getElementById('qvImage');
  var qvTags = document.getElementById('qvTags');
  var qvName = document.getElementById('qvName');
  var qvSize = document.getElementById('qvSize');
  var qvPrice = document.getElementById('qvPrice');
  var qvDesc = document.getElementById('qvDesc');
  var qvQty = document.getElementById('qvQty');
  var qvTotal = document.getElementById('qvTotal');
  var qvLink = document.getElementById('qvLink');
  var qvDec = document.getElementById('qvDec');
  var qvInc = document.getElementById('qvInc');
  var qvAdd = document.getElementById('qvAdd');
  var qvQtyVal = 1;
  var qvProduct = null;

  function fmt(n) { return n.toFixed(2).replace('.', ','); }

  function renderQv() {
    if (!qvProduct) return;
    var price = qvProduct.promo || qvProduct.price;
    qvTags.innerHTML = qvProduct.tags.map(function (t) { return '<span class="tag tag--lg">' + t + '</span>'; }).join('');
    qvName.textContent = qvProduct.name;
    qvSize.textContent = qvProduct.size;
    qvPrice.innerHTML = qvProduct.promo
      ? '<span class="product-card__price-old">R$ ' + fmt(qvProduct.price) + '</span> R$ ' + fmt(price)
      : 'R$ ' + fmt(price);
    qvDesc.textContent = qvProduct.desc;
    qvQty.textContent = String(qvQtyVal);
    qvTotal.textContent = 'R$ ' + fmt(price * qvQtyVal);
    qvLink.setAttribute('href', produtoBase + qvProduct.id + '.html');
    qvImage.innerHTML = qvProduct.img
      ? '<img src="' + qvProduct.img + '" alt="' + qvProduct.name + '">'
      : '<div class="img-placeholder">' + qvProduct.name + '</div>';
  }

  function openQv(id) {
    qvProduct = DATA.filter(function (p) { return p.id === id; })[0] || null;
    if (!qvProduct) return;
    qvQtyVal = 1;
    renderQv();
    document.body.classList.add('qv-open');
  }
  function closeQv() { document.body.classList.remove('qv-open'); }

  document.querySelectorAll('[data-quickview]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openQv(btn.getAttribute('data-quickview'));
    });
  });
  qvOverlay.addEventListener('click', closeQv);
  document.querySelectorAll('[data-close-qv]').forEach(function (el) { el.addEventListener('click', closeQv); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQv(); });
  if (qvDec) qvDec.addEventListener('click', function () { qvQtyVal = Math.max(1, qvQtyVal - 1); renderQv(); });
  if (qvInc) qvInc.addEventListener('click', function () { qvQtyVal += 1; renderQv(); });
  if (qvAdd) qvAdd.addEventListener('click', function () {
    if (!qvProduct || !window.ChefNutriCart) return;
    window.ChefNutriCart.addToCart(qvProduct.id, qvQtyVal);
    closeQv();
    window.ChefNutriCart.showToast('Produto adicionado ao carrinho');
  });
})();
