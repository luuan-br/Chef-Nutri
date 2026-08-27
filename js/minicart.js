// Chef&Nutri — mini carrinho exibido ao clicar em "Comprar Agora" num card de
// produto: adiciona 1 unidade ao carrinho e mostra um resumo com o que já
// está no carrinho, atalhos (ver carrinho / finalizar / continuar comprando)
// e uma lista de recomendações.
(function () {
  'use strict';
  var mcOverlay = document.getElementById('mcOverlay');
  if (!mcOverlay) return;

  var DATA = (window.CHEFNUTRI_DATA && window.CHEFNUTRI_DATA.products) || [];
  var produtoBase = window.PRODUTO_BASE || 'produto/';
  var mcList = document.getElementById('mcList');
  var mcSubtotal = document.getElementById('mcSubtotal');
  var mcRecommend = document.getElementById('mcRecommend');
  var mcCheckout = document.getElementById('mcCheckout');
  var WHATSAPP_PHONE = '5571996115102';

  function fmt(n) { return n.toFixed(2).replace('.', ','); }
  function findProduct(id) { return DATA.filter(function (p) { return p.id === id; })[0] || null; }

  function currentItems() {
    var cart = window.ChefNutriCart.readCart();
    return Object.keys(cart).map(function (id) {
      var product = findProduct(id);
      return product ? { product: product, qty: cart[id] } : null;
    }).filter(Boolean);
  }

  function render(lastAddedId) {
    var items = currentItems();

    mcList.innerHTML = items.map(function (it) {
      var price = it.product.promo || it.product.price;
      var imgHtml = it.product.img
        ? '<img src="' + it.product.img + '" alt="' + it.product.name + '">'
        : '<div class="img-placeholder">' + it.product.name + '</div>';
      return '' +
        '<div class="cart-item mc-item">' +
        '  <div class="cart-item__image">' + imgHtml + '</div>' +
        '  <div class="cart-item__body">' +
        '    <div class="cart-item__name">' + it.product.name + '</div>' +
        '    <div class="cart-item__row">' +
        '      <div class="cart-qty">' +
        '        <span data-mc-dec="' + it.product.id + '" role="button" tabindex="0">−</span>' +
        '        <span class="cart-qty__num">' + it.qty + '</span>' +
        '        <span data-mc-inc="' + it.product.id + '" role="button" tabindex="0">+</span>' +
        '      </div>' +
        '      <span class="cart-item__total">R$ ' + fmt(price * it.qty) + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <button class="cart-item__remove" type="button" data-mc-remove="' + it.product.id + '" aria-label="Remover">&times;</button>' +
        '</div>';
    }).join('');

    var subtotal = items.reduce(function (sum, it) { return sum + (it.product.promo || it.product.price) * it.qty; }, 0);
    mcSubtotal.textContent = 'R$ ' + fmt(subtotal);

    var cartIds = items.map(function (it) { return it.product.id; });
    var recs = DATA.filter(function (p) { return cartIds.indexOf(p.id) === -1; }).slice(0, 3);
    mcRecommend.innerHTML = recs.map(function (p) {
      var price = p.promo || p.price;
      var imgHtml = p.img
        ? '<img src="' + p.img + '" alt="' + p.name + '">'
        : '<div class="img-placeholder">' + p.name + '</div>';
      return '' +
        '<a href="' + produtoBase + p.id + '.html" class="related-card">' +
        '  <div class="related-card__image">' + imgHtml + '</div>' +
        '  <div class="related-card__body">' +
        '    <div class="related-card__name">' + p.name + '</div>' +
        '    <div class="related-card__price">R$ ' + fmt(price) + '</div>' +
        '  </div>' +
        '</a>';
    }).join('');
  }

  function openMc(id) {
    window.ChefNutriCart.addToCart(id, 1);
    render(id);
    document.body.classList.add('mc-open');
  }
  function closeMc() { document.body.classList.remove('mc-open'); }

  // Quantidade editável e remoção dos itens do mini carrinho, igual à página de carrinho.
  mcList.addEventListener('click', function (e) {
    var target = e.target;
    var incId = target.getAttribute && target.getAttribute('data-mc-inc');
    var decId = target.getAttribute && target.getAttribute('data-mc-dec');
    var removeId = target.getAttribute && target.getAttribute('data-mc-remove');
    if (incId) {
      var cart = window.ChefNutriCart.readCart();
      window.ChefNutriCart.setQty(incId, (cart[incId] || 0) + 1);
      render();
    } else if (decId) {
      var cart2 = window.ChefNutriCart.readCart();
      window.ChefNutriCart.setQty(decId, (cart2[decId] || 0) - 1);
      if (window.ChefNutriCart.cartCount() === 0) closeMc();
      else render();
    } else if (removeId) {
      window.ChefNutriCart.removeFromCart(removeId);
      if (window.ChefNutriCart.cartCount() === 0) closeMc();
      else render();
    }
  });

  document.querySelectorAll('[data-buy-now]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openMc(btn.getAttribute('data-buy-now'));
    });
  });
  mcOverlay.addEventListener('click', closeMc);
  document.querySelectorAll('[data-close-mc]').forEach(function (el) { el.addEventListener('click', closeMc); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMc(); });

  if (mcCheckout) {
    mcCheckout.addEventListener('click', function () {
      var items = currentItems();
      if (!items.length) return;
      var lines = items.map(function (it) {
        var price = it.product.promo || it.product.price;
        return '• ' + it.qty + 'x ' + it.product.name + ' — R$ ' + fmt(price * it.qty);
      });
      var subtotal = items.reduce(function (sum, it) { return sum + (it.product.promo || it.product.price) * it.qty; }, 0);
      lines.push('');
      lines.push('Subtotal: R$ ' + fmt(subtotal));
      var text = 'Olá! Quero finalizar este pedido:\n\n' + lines.join('\n');
      window.open('https://api.whatsapp.com/send?phone=' + WHATSAPP_PHONE + '&text=' + encodeURIComponent(text), '_blank');
    });
  }
})();
