const test = require('node:test');
const assert = require('node:assert/strict');
const { onlyDigits, normalizeLocal, validateNumber, buildLink, formatBR } = require('../app.js');

test('onlyDigits tira máscara', () => {
  assert.equal(onlyDigits('(21) 99999-8888'), '21999998888');
  assert.equal(onlyDigits(undefined), '');
});

test('normalizeLocal tira zero de operadora/DDD', () => {
  assert.equal(normalizeLocal('55', '021 99999-8888'), '21999998888');
  assert.equal(normalizeLocal('44', '07911 123456'), '7911123456');
});

test('normalizeLocal tira o código do país colado de novo', () => {
  assert.equal(normalizeLocal('55', '+55 21 99999-8888'), '21999998888');
  assert.equal(normalizeLocal('55', '5521999998888'), '21999998888');
  assert.equal(normalizeLocal('351', '+351 912 345 678'), '912345678');
  assert.equal(normalizeLocal('1', '001 415 555 0100'), '4155550100');
});

test('normalizeLocal não corta DDD 55 (Rio Grande do Sul) de número sem DDI', () => {
  assert.equal(normalizeLocal('55', '(55) 99999-8888'), '55999998888');
});

test('validateNumber Brasil: DDD + 8 ou 9 dígitos', () => {
  assert.deepEqual(validateNumber('55', '(21) 99999-8888'), { ok: true, digits: '21999998888' });
  assert.equal(validateNumber('55', '(21) 3333-4444').ok, true);
  assert.equal(validateNumber('55', '99999-8888').reason, 'short');
  assert.equal(validateNumber('55', '').reason, 'empty');
  assert.equal(validateNumber('55', '219999988881').reason, 'long');
});

test('validateNumber outros países', () => {
  assert.equal(validateNumber('351', '912345678').ok, true);
  assert.equal(validateNumber('1', '12').reason, 'short');
  assert.equal(validateNumber('351', '123456789012345').reason, 'long');
});

test('buildLink sem mensagem', () => {
  assert.equal(buildLink({ ddi: '55', numero: '21999998888', mensagem: '  ' }), 'https://wa.me/5521999998888');
});

test('buildLink codifica acentos, &, emoji e quebra de linha', () => {
  const msg = 'Olá! Orçamento & prazo\n😀';
  const link = buildLink({ ddi: '55', numero: '21999998888', mensagem: msg });
  assert.equal(link, 'https://wa.me/5521999998888?text=' + encodeURIComponent(msg));
  assert.equal(new URL(link).searchParams.get('text'), msg);
});

test('formatBR celular e fixo', () => {
  assert.equal(formatBR('21999998888'), '(21) 99999-8888');
  assert.equal(formatBR('2133334444'), '(21) 3333-4444');
  assert.equal(formatBR('21'), '(21');
  assert.equal(formatBR(''), '');
});
