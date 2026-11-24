const test = require('node:test');
const assert = require('node:assert/strict');
const { onlyDigits, validateNumber, buildLink, formatBR } = require('../app.js');

test('onlyDigits remove máscara e símbolos', () => {
  assert.equal(onlyDigits('(21) 99999-8888'), '21999998888');
  assert.equal(onlyDigits('+55 21'), '5521');
  assert.equal(onlyDigits(null), '');
});

test('validação Brasil: DDD + 8 ou 9 dígitos', () => {
  assert.deepEqual(validateNumber('55', '(21) 99999-8888'), { ok: true, digits: '21999998888' });
  assert.equal(validateNumber('55', '21 3333-4444').ok, true);
  assert.equal(validateNumber('55', '99999-8888').reason, 'short');
  assert.equal(validateNumber('55', '219999988880').reason, 'long');
  assert.equal(validateNumber('55', '').reason, 'empty');
});

test('validação de outros países: 6 a 14 dígitos', () => {
  assert.equal(validateNumber('351', '912 345 678').ok, true);
  assert.equal(validateNumber('1', '12').reason, 'short');
  assert.equal(validateNumber('351', '123456789012345').reason, 'long');
});

test('link sem mensagem', () => {
  assert.equal(buildLink({ ddi: '55', numero: '(21) 99999-8888', mensagem: '' }), 'https://wa.me/5521999998888');
});

test('mensagem só com espaços é ignorada', () => {
  assert.equal(buildLink({ ddi: '55', numero: '21999998888', mensagem: '   ' }), 'https://wa.me/5521999998888');
});

test('link com mensagem codifica acentos, espaços, emoji e quebra de linha', () => {
  const msg = 'Olá! Quero um orçamento & prazo\n😀';
  const link = buildLink({ ddi: '55', numero: '21999998888', mensagem: msg });
  assert.equal(link, 'https://wa.me/5521999998888?text=' + encodeURIComponent(msg));
  assert.ok(!link.includes(' '));
  assert.equal(new URL(link).searchParams.get('text'), msg);
});

test('exemplo da interface', () => {
  assert.equal(
    buildLink({ ddi: '+55', numero: '21 99999-8888', mensagem: 'Olá! Gostaria de fazer um orçamento.' }),
    'https://wa.me/5521999998888?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20or%C3%A7amento.'
  );
});

test('formatBR aplica a máscara enquanto digita', () => {
  assert.equal(formatBR(''), '');
  assert.equal(formatBR('2'), '(2');
  assert.equal(formatBR('2199'), '(21) 99');
  assert.equal(formatBR('2133334444'), '(21) 3333-4444');
  assert.equal(formatBR('21999998888'), '(21) 99999-8888');
  assert.equal(formatBR('219999988889'), '(21) 99999-8888');
});
