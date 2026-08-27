// Chef&Nutri — carrinho real, salvo no navegador (localStorage), compartilhado
// por todas as páginas. Permite adicionar produtos com o botão "+" sem sair
// da página atual — a pessoa escolhe os produtos e só depois vai ao carrinho
// para finalizar a compra.
(function () {
  'use strict';
  var STORAGE_KEY = 'chefnutri_cart_v1';

  function readCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) { return {}; }
  }

  function writeCart(cart) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
    updateBadge();
  }

  function addToCart(id, qty) {
    qty = qty || 1;
    var cart = readCart();
    cart[id] = Math.max(1, (cart[id] || 0) + qty);
    writeCart(cart);
    return cart[id];
  }

  function setQty(id, qty) {
    var cart = readCart();
    if (qty <= 0) delete cart[id]; else cart[id] = qty;
    writeCart(cart);
  }

  function removeFromCart(id) {
    var cart = readCart();
    delete cart[id];
    writeCart(cart);
  }

  function clearCart() { writeCart({}); }

  function cartCount() {
    var cart = readCart();
    return Object.keys(cart).reduce(function (sum, id) { return sum + cart[id]; }, 0);
  }

  function updateBadge() {
    var n = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(n);
      el.classList.toggle('is-zero', n === 0);
    });
  }

  var toastTimer = null;
  function showToast(msg) {
    var toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  window.ChefNutriCart = {
    readCart: readCart,
    addToCart: addToCart,
    setQty: setQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    cartCount: cartCount,
    updateBadge: updateBadge,
    showToast: showToast,
  };

  // Qualquer botão "+" com [data-add-cart="id-do-produto"] adiciona 1 unidade
  // ao carrinho na hora, sem navegar — funciona em cards criados dinamicamente
  // (filtros/busca) porque o listener fica no document (delegação de evento).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-add-cart]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    addToCart(btn.getAttribute('data-add-cart'), 1);
    showToast('Produto adicionado ao carrinho');
  });

  updateBadge();
})();
