// Chef&Nutri — slider do hero da página inicial (autoplay, setas e dots).
(function () {
  'use strict';
  var hero = document.getElementById('hero');
  if (!hero) return;

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var titleEl = document.getElementById('heroTitle');
  var subtitleEl = document.getElementById('heroSubtitle');
  var ctaEl = document.getElementById('heroCta');
  var prevBtn = document.getElementById('heroPrev');
  var nextBtn = document.getElementById('heroNext');
  if (!slides.length) return;

  var HERO_CONTENT = [
    { title: 'Comida funcional, sem glúten e sem lactose', subtitle: 'Congelados artesanais, ingredientes naturais e zero conservantes — prontos em minutos.', cta: 'Ver Pizzas' },
    { title: 'Feito com ingredientes naturais', subtitle: 'Receitas testadas até chegar ao sabor de verdade, sem abrir mão da saúde.', cta: 'Nossos Diferenciais' },
    { title: '<span class="hero-title--accent">Sem Glúten e</span><span class="hero-title--accent">Sem Lactose</span>', subtitle: 'Linha de produção dedicada, zero contaminação cruzada.', cta: 'Saiba Mais' },
  ];

  var current = 0;
  var timer = null;

  function render() {
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
    var c = HERO_CONTENT[current];
    if (titleEl) titleEl.innerHTML = c.title;
    if (subtitleEl) subtitleEl.textContent = c.subtitle;
    if (ctaEl) ctaEl.textContent = c.cta;
  }

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    render();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartAutoplay(); });
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); restartAutoplay(); });
  });
  if (ctaEl) ctaEl.addEventListener('click', function () {
    var goto = slides[current].getAttribute('data-goto');
    if (goto) window.location.href = goto;
  });

  render();
  restartAutoplay();
})();
