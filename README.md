# Link Direto

Crie um link para o seu WhatsApp com mensagem pronta, direto no navegador. Quem clicar já cai na conversa com você, sem precisar salvar seu número.

**Usar agora:** https://mauricioaugustobr.github.io/link-direto/

## Como funciona

1. Escolha o país (Brasil vem marcado).
2. Digite o número com DDD — pode ser com parênteses, traço ou espaço. Se colar com `+DDI`, ele respeita.
3. Escreva uma mensagem, se quiser.
4. Copie o link ou teste no WhatsApp.

O link segue o formato oficial do WhatsApp (`https://wa.me/<número>?text=<mensagem>`). A mensagem é codificada para manter acentos, emojis e quebras de linha.

Nada é enviado para servidor nenhum: é uma página estática com HTML, CSS e JavaScript puro, sem cadastro e sem rastreamento.

## Rodar localmente

Abra o `index.html` no navegador. Para os testes (Node 18+):

```bash
npm test
```

## Licença

MIT
