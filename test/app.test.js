const test = require('node:test');
const assert = require('node:assert/strict');
const { montarNumero, validar, gerarLink } = require('../app.js');

test('junta DDI e número com máscara', () => {
  assert.equal(montarNumero('55', '(21) 99999-8888'), '5521999998888');
});

test('remove zero de DDD/operadora', () => {
  assert.equal(montarNumero('55', '021 99999-8888'), '5521999998888');
});

test('aceita número colado já com +DDI', () => {
  assert.equal(montarNumero('55', '+351 912 345 678'), '351912345678');
  assert.equal(montarNumero('55', '00 1 415 555 0100'), '14155550100');
});

test('não duplica 55 quando a pessoa já digitou', () => {
  assert.equal(montarNumero('55', '55 21 99999-8888'), '5521999998888');
});

test('link sem mensagem', () => {
  assert.equal(gerarLink('55', '21 99999-8888', ''), 'https://wa.me/5521999998888');
});

test('link com mensagem codifica acentos, espaços, emoji e quebra de linha', () => {
  const link = gerarLink('55', '21999998888', 'Olá! Quero um orçamento & prazo\n😀');
  assert.equal(link, 'https://wa.me/5521999998888?text=' + encodeURIComponent('Olá! Quero um orçamento & prazo\n😀'));
  assert.ok(!link.includes(' '));
  assert.equal(new URL(link).searchParams.get('text'), 'Olá! Quero um orçamento & prazo\n😀');
});

test('mensagem só com espaços é ignorada', () => {
  assert.equal(gerarLink('55', '21999998888', '   '), 'https://wa.me/5521999998888');
});

test('validação Brasil: DDD + 8 ou 9 dígitos', () => {
  assert.equal(validar('55', '21 99999-8888'), null);
  assert.equal(validar('55', '21 3333-4444'), null);
  assert.match(validar('55', '99999-8888'), /DDD/);
  assert.match(validar('55', ''), /DDD/);
});

test('validação de outros países pelo tamanho E.164', () => {
  assert.equal(validar('351', '912 345 678'), null);
  assert.match(validar('1', '12'), /inválido/);
  assert.match(validar('351', '1234567890123456'), /inválido/);
});
