# Link Direto

Crie um link para o seu WhatsApp com mensagem pronta, direto no navegador. Quem clicar já cai na conversa com você, sem precisar salvar seu número.

**Usar agora:** https://mauricioaugustobr.github.io/link-direto/

## Como funciona

1. Escolha o país (Brasil vem marcado).
2. Digite o número com DDD: ele ganha a máscara `(21) 99999-9999` enquanto você digita. Se colar com `+55`, `0` na frente ou outro código de país, ele limpa sozinho.
3. Escreva uma mensagem, se quiser, ou toque numa sugestão pronta (Instagram, orçamento, agendar).
4. Copie, teste ou compartilhe o link. Ao lado aparece uma prévia de como a conversa abre para o cliente.

O link segue o formato oficial do WhatsApp (`https://wa.me/<número>?text=<mensagem>`). Na tela ele aparece legível; o que vai copiado é a versão codificada, que mantém acentos, emojis e quebras de linha.

Nada é enviado para servidor nenhum: é uma página estática com HTML, CSS e JavaScript puro, sem cadastro e sem rastreamento. Funciona no celular e no computador, com tema claro ou escuro conforme o aparelho.

## Rodar localmente

Abra o `index.html` no navegador. Para os testes (Node 18+):

```bash
npm test
```

## Licença

MIT
