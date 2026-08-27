// Chef&Nutri — renderiza o carrinho real (salvo em localStorage) na página
// carrinho.html: itens, quantidade editável, totais e finalização via WhatsApp.
(function () {
  'use strict';
  var cartEmpty = document.getElementById('cartEmpty');
  var cartContent = document.getElementById('cartContent');
  if (!cartEmpty || !cartContent) return;

  var DATA = (window.CHEFNUTRI_DATA && window.CHEFNUTRI_DATA.products) || [];
  var cartList = document.getElementById('cartList');
  var cartSubtotal = document.getElementById('cartSubtotal');
  var cartFrete = document.getElementById('cartFrete');
  var cartTotal = document.getElementById('cartTotal');
  var cartFreeShipNote = document.getElementById('cartFreeShipNote');
  var checkoutBtn = document.getElementById('checkoutBtn');
  var FREE_SHIPPING_MIN = 200;
  var WHATSAPP_PHONE = '5571996115102';

  function fmt(n) { return n.toFixed(2).replace('.', ','); }
  function findProduct(id) { return DATA.filter(function (p) { return p.id === id; })[0] || null; }

  function render() {
    var cart = window.ChefNutriCart.readCart();
    var ids = Object.keys(cart);
    var items = ids.map(function (id) {
      var product = findProduct(id);
      return product ? { product: product, qty: cart[id] } : null;
    }).filter(Boolean);

    if (items.length === 0) {
      cartEmpty.style.display = 'block';
      cartContent.style.display = 'none';
      return;
    }
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';

    cartList.innerHTML = items.map(function (it) {
      var price = it.product.promo || it.product.price;
      var img = it.product.img
        ? '<img src="' + it.product.img + '" alt="' + it.product.name + '">'
        : '<div class="img-placeholder">' + it.product.name + '</div>';
      return '' +
        '<div class="cart-item" data-cart-item="' + it.product.id + '">' +
        '  <div class="cart-item__image">' + img + '</div>' +
        '  <div class="cart-item__body">' +
        '    <div class="cart-item__name">' + it.product.name + '</div>' +
        '    <div class="cart-item__size">' + it.product.size + '</div>' +
        '    <div class="cart-item__row">' +
        '      <div class="cart-qty">' +
        '        <span data-cart-dec="' + it.product.id + '" role="button" tabindex="0">−</span>' +
        '        <span class="cart-qty__num">' + it.qty + '</span>' +
        '        <span data-cart-inc="' + it.product.id + '" role="button" tabindex="0">+</span>' +
        '      </div>' +
        '      <span class="cart-item__total">R$ ' + fmt(price * it.qty) + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <button class="cart-item__remove" type="button" data-cart-remove="' + it.product.id + '" aria-label="Remover">&times;</button>' +
        '</div>';
    }).join('');

    var subtotal = items.reduce(function (sum, it) { return sum + (it.product.promo || it.product.price) * it.qty; }, 0);
    var frete = subtotal >= FREE_SHIPPING_MIN ? 0 : 15.9;
    var total = subtotal + frete;
    var remaining = Math.max(0, FREE_SHIPPING_MIN - subtotal);

    cartSubtotal.textContent = 'R$ ' + fmt(subtotal);
    cartFrete.textContent = frete === 0 ? 'Grátis' : 'R$ ' + fmt(frete);
    cartTotal.textContent = 'R$ ' + fmt(total);
    cartFreeShipNote.textContent = remaining > 0
      ? 'Faltam R$ ' + fmt(remaining) + ' para frete grátis (Salvador e Lauro de Freitas)'
      : 'Você ganhou frete grátis! (Salvador e Lauro de Freitas)';

    checkoutBtn.onclick = function () {
      var lines = items.map(function (it) {
        var price = it.product.promo || it.product.price;
        return '• ' + it.qty + 'x ' + it.product.name + ' — R$ ' + fmt(price * it.qty);
      });
      lines.push('');
      lines.push('Total: R$ ' + fmt(total));
      var text = 'Olá! Quero finalizar este pedido:\n\n' + lines.join('\n');
      window.open('https://api.whatsapp.com/send?phone=' + WHATSAPP_PHONE + '&text=' + encodeURIComponent(text), '_blank');
    };
  }

  cartList.addEventListener('click', function (e) {
    var target = e.target;
    var incId = target.getAttribute && target.getAttribute('data-cart-inc');
    var decId = target.getAttribute && target.getAttribute('data-cart-dec');
    var removeId = target.getAttribute && target.getAttribute('data-cart-remove');
    if (incId) {
      var cart = window.ChefNutriCart.readCart();
      window.ChefNutriCart.setQty(incId, (cart[incId] || 0) + 1);
      render();
    } else if (decId) {
      var cart2 = window.ChefNutriCart.readCart();
      window.ChefNutriCart.setQty(decId, (cart2[decId] || 0) - 1);
      render();
    } else if (removeId) {
      window.ChefNutriCart.removeFromCart(removeId);
      render();
    }
  });

  render();
})();
