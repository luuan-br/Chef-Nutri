// Chef&Nutri — consulta de CEP na página de produto, usando a API pública e
// gratuita ViaCEP (https://viacep.com.br) para resolver cidade/bairro e
// avisar se a entrega é na área de cobertura (Salvador e Lauro de Freitas).
(function () {
  'use strict';
  var form = document.getElementById('cepForm');
  if (!form) return;

  var input = document.getElementById('cepInput');
  var result = document.getElementById('cepResult');
  var COVERED_CITIES = ['salvador', 'lauro de freitas'];

  input.addEventListener('input', function () {
    var digits = input.value.replace(/\D/g, '').slice(0, 8);
    input.value = digits.length > 5 ? digits.slice(0, 5) + '-' + digits.slice(5) : digits;
  });

  function setResult(html, cls) {
    result.innerHTML = html;
    result.className = 'cep-check__result' + (cls ? ' ' + cls : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var cep = input.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      setResult('Digite um CEP válido com 8 números.', 'is-error');
      return;
    }
    setResult('Consultando...', '');
    fetch('https://viacep.com.br/ws/' + cep + '/json/')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.erro) {
          setResult('CEP não encontrado. Verifique e tente novamente.', 'is-error');
          return;
        }
        var cidade = (data.localidade || '').trim();
        var uf = data.uf || '';
        var isCovered = COVERED_CITIES.indexOf(cidade.toLowerCase()) !== -1;
        if (isCovered) {
          setResult('Entregamos em ' + cidade + '/' + uf + '! Frete grátis para compras acima de R$200.', 'is-ok');
        } else {
          setResult(
            'Ainda não entregamos automaticamente em ' + cidade + '/' + uf + '. Fale com a gente no ' +
            '<a href="https://api.whatsapp.com/send?phone=5571996115102" target="_blank" rel="noopener">WhatsApp</a> para consultar disponibilidade.',
            ''
          );
        }
      })
      .catch(function () {
        setResult('Não foi possível consultar o CEP agora. Tente novamente em instantes.', 'is-error');
      });
  });
})();
