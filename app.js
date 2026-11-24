/* Link Direto — gera links wa.me do WhatsApp. Roda 100% no navegador. */
(function (root) {
  'use strict';

  var PAISES = [
    { ddi: '55', nome: 'Brasil' },
    { ddi: '351', nome: 'Portugal' },
    { ddi: '1', nome: 'EUA / Canadá' },
    { ddi: '54', nome: 'Argentina' },
    { ddi: '598', nome: 'Uruguai' },
    { ddi: '595', nome: 'Paraguai' },
    { ddi: '56', nome: 'Chile' },
    { ddi: '57', nome: 'Colômbia' },
    { ddi: '52', nome: 'México' },
    { ddi: '34', nome: 'Espanha' },
    { ddi: '44', nome: 'Reino Unido' },
    { ddi: '244', nome: 'Angola' },
    { ddi: '258', nome: 'Moçambique' }
  ];

  function soDigitos(s) {
    return String(s == null ? '' : s).replace(/\D+/g, '');
  }

  // Junta DDI + número. Aceita número já com "+DDI" ou "00DDI" colado.
  function montarNumero(ddi, numero) {
    var bruto = String(numero == null ? '' : numero).trim();
    var d = soDigitos(ddi);
    var n = soDigitos(bruto);
    var internacional = /^\s*(\+|00)/.test(bruto);
    if (internacional) {
      n = n.replace(/^00/, '');
      return n;
    }
    n = n.replace(/^0+/, ''); // tira 0 de operadora/DDD (ex.: 021...)
    if (d === '55' && n.length >= 12 && n.indexOf('55') === 0) return n; // já veio com 55
    return d + n;
  }

  // Retorna null se ok, ou a mensagem de erro.
  function validar(ddi, numero) {
    var bruto = String(numero == null ? '' : numero).trim();
    if (!soDigitos(bruto)) return 'Digite o número com DDD.';
    var completo = montarNumero(ddi, numero);
    if (completo.length < 8 || completo.length > 15) return 'Número inválido: confira o DDI e o DDD.';
    if (completo.indexOf('55') === 0) { // +55 é só o Brasil
      var local = completo.slice(2);
      if (local.length !== 10 && local.length !== 11) {
        return 'No Brasil o número tem DDD + 8 ou 9 dígitos (ex.: 21 99999-8888).';
      }
    }
    return null;
  }

  function gerarLink(ddi, numero, mensagem) {
    var link = 'https://wa.me/' + montarNumero(ddi, numero);
    var msg = String(mensagem == null ? '' : mensagem).trim();
    if (msg) link += '?text=' + encodeURIComponent(msg);
    return link;
  }

  var api = { PAISES: PAISES, soDigitos: soDigitos, montarNumero: montarNumero, validar: validar, gerarLink: gerarLink };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.LinkDireto = api;

  // ---- Interface ----
  var $ = function (id) { return document.getElementById(id); };
  function iniciar() {
    var selDdi = $('ddi'), inNum = $('numero'), inMsg = $('mensagem');
    var saida = $('resultado'), campoLink = $('link'), erro = $('erro');
    var btCopiar = $('copiar'), btAbrir = $('abrir'), contador = $('contador');

    PAISES.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.ddi;
      o.textContent = p.nome + ' (+' + p.ddi + ')';
      selDdi.appendChild(o);
    });

    var saiuDoCampo = false; // só aponta erro depois que a pessoa termina de digitar

    function atualizar() {
      contador.textContent = inMsg.value.length + ' caracteres';
      var msgErro = inNum.value.trim() ? validar(selDdi.value, inNum.value) : null;
      erro.textContent = saiuDoCampo && msgErro ? msgErro : '';
      inNum.setAttribute('aria-invalid', saiuDoCampo && msgErro ? 'true' : 'false');
      if (!inNum.value.trim() || msgErro) {
        saida.hidden = true;
        return;
      }
      var link = gerarLink(selDdi.value, inNum.value, inMsg.value);
      campoLink.value = link;
      btAbrir.href = link;
      saida.hidden = false;
    }

    [selDdi, inNum, inMsg].forEach(function (el) { el.addEventListener('input', atualizar); });
    inNum.addEventListener('blur', function () { saiuDoCampo = true; atualizar(); });
    $('form').addEventListener('submit', function (e) { e.preventDefault(); saiuDoCampo = true; atualizar(); });

    btCopiar.addEventListener('click', function () {
      var feito = function () {
        btCopiar.textContent = 'Copiado!';
        setTimeout(function () { btCopiar.textContent = 'Copiar link'; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(campoLink.value).then(feito, function () { campoLink.select(); document.execCommand('copy'); feito(); });
      } else {
        campoLink.select();
        document.execCommand('copy');
        feito();
      }
    });
    atualizar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(typeof window !== 'undefined' ? window : this);
