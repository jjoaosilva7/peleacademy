# Pelé Academia · Camada de interatividade (Web Development · Sprint 3)

Rede de talentos da Pelé Academia feita **só com HTML, CSS e JavaScript puro (Vanilla JS)**, sem framework e sem biblioteca.
As páginas usam os mesmos tokens visuais (Blue, Gamboge, Dun) e as mesmas regras de negócio do MVP em React
(idade de 7 a 20 anos, categoria pela idade, overall inicial por posição).

**Grupo Zenyth** · FIAP · 1º Engenharia de Software (RJ)

| Integrante | RM |
| --- | --- |
| Guilherme de Paula Correia | RM572126 |
| João Vitor Barbosa Silva | RM570109 |
| Lucas Rodrigues de Carvalho | RM573788 |

**URL publicada:** https://jjoaosilva7.github.io/peleacademy/wd/ *(GitHub Pages: Settings → Pages → Deploy from a branch → main / root)*

## Páginas

| Página | O que faz |
| --- | --- |
| `index.html` | Feed da rede de talentos: 16 atletas (academia + candidatos), tags de atributos com votos, botão seguir, filtros em tempo real por nome, posição, estado e "só quem eu sigo", abas Todos / Na academia / Candidatos. |
| `cadastro.html` | Formulário de criação de conta com validação campo a campo, categoria calculada ao vivo pela data de nascimento e bloco do responsável que só aparece para menores de 18. |
| `entrar.html` | Login com validação, mensagem de erro geral, botão mostrar/ocultar senha e atalhos das contas de demonstração. |

Contas de demonstração (senha `pele2026`): `kaua@exemplo.com`, `joao@exemplo.com`, `lucas@exemplo.com` (atletas) e `tecnico@peleacademia.com.br` (equipe).

## Como rodar

Não precisa instalar nada. Abra `index.html` direto no navegador **ou** sirva a pasta com qualquer servidor estático:

```bash
cd wd
python3 -m http.server 8080
# http://localhost:8080
```

## Estrutura

```
wd/
├── index.html          # feed / rede de talentos
├── cadastro.html       # criar conta
├── entrar.html         # login
└── assets/
    ├── css/estilo.css  # tokens e componentes (mesma identidade do MVP)
    └── js/
        ├── data.js        # dados em memória (atletas, contas demo, posições, UFs)
        ├── ui.js          # toasts, abas acessíveis, link ativo do menu, escape de HTML
        ├── filters.js     # filtros em tempo real (nome, posição, estado, só quem eu sigo)
        ├── feed.js        # desenha a vitrine, votos nas tags, seguir/deixar de seguir
        └── validation.js  # regras e mensagens dos formulários de cadastro e login
```

Todos os arquivos JS escrevem no mesmo namespace `window.PA`, para não poluir o escopo global. A ordem de carregamento em cada página é `data.js → ui.js → (filters.js → feed.js | validation.js)`.

## Manual de Interatividade

Cada funcionalidade dinâmica, o arquivo que a controla e como ela funciona por dentro.

### 1. Feed de atletas com tags e votos — `assets/js/feed.js`

- `PA.desenharFeed()` monta o HTML da lista (`#lista-atletas`) a partir de `PA.ATLETAS`, já passando pelos filtros (`PA.filtrar`) e pela aba ativa. Atualiza o contador `#contagem` (`aria-live="polite"`) e mostra `#vazio` quando nada passa.
- Cada tag de atributo é um `<button class="tag" data-acao="votar" data-atleta="id" data-tag="índice" aria-pressed="true|false">` com o número de confirmações em `<span class="votos">`.
- **Voto dinâmico:** um único escutador de `click` na lista (delegação de eventos) chama `votar(atletaId, indiceTag)`. Ela adiciona ou remove o usuário atual (`PA.USUARIO_ATUAL`) do array `votos` da tag e atualiza **só aquele botão** (`aria-pressed` + contador), sem redesenhar a lista inteira. Cada pessoa tem um voto por tag, e o atleta não vota nos próprios atributos (botão `disabled`).
- **Seguir:** `seguir(atletaId)` alterna o usuário no array `seguidores`, troca o texto do botão (`Seguir` ↔ `Seguindo`, com `aria-pressed`), atualiza o contador `[data-seguidores]` e, se o filtro "só quem eu sigo" estiver ligado, redesenha a lista para refletir a mudança.
- Toda ação dispara um aviso (toast) via `PA.avisar`.

### 2. Filtros em tempo real por posição e região — `assets/js/filters.js`

- `PA.iniciarFiltros(aoMudar)` preenche os `<select>` de posição (`#filtro-posicao`) e de estado (`#filtro-uf`, só os estados que têm atletas) e liga os escutadores: `input` na busca por nome, `change` nos selects e no checkbox `#so-seguindo`, `click` em `#limpar-filtros`.
- `PA.filtrar(atletas)` devolve só quem passa por **todos** os filtros ao mesmo tempo. A busca por nome/apelido ignora acentos e maiúsculas (`normalize('NFD')`).
- Como o callback é `PA.desenharFeed`, qualquer tecla digitada ou opção escolhida redesenha a vitrine **na hora, sem recarregar a página**.
- As abas Todos / Na academia / Candidatos usam `PA.abas` (ui.js) e funcionam como um filtro a mais, com navegação por setas do teclado.

### 3. Validação do cadastro — `assets/js/validation.js`

- Regras puras, sem DOM, reutilizáveis: `PA.calcularIdade`, `PA.categoriaPorIdade` (Sub-11 Futsal, Sub-13 Futsal, Sub-15, Sub-17, Sub-20), `PA.validarEmail`, `PA.validarSenha` (8+ caracteres, letras e números) e `PA.validarCadastro(dados)`, que devolve um objeto `{ campo: mensagem }`.
- O formulário tem `novalidate`; o JS assume a validação para as mensagens serem as nossas. Cada campo tem um `<p class="erro" data-erro="nome-do-campo">` que recebe a mensagem e ganha a classe `.visivel`; o input recebe `aria-invalid="true"` (borda vermelha via CSS).
- `#resumo-erros` (`role="alert"`) lista todos os erros de uma vez, e o foco vai para o primeiro campo inválido.
- Depois da primeira tentativa de envio, o formulário passa a revalidar **enquanto o usuário digita** (`input`), então a mensagem some assim que o campo é corrigido.
- **Revelação progressiva:** ao digitar a data de nascimento, `#categoria-viva` mostra a categoria e a idade; se for menor de 18, o `fieldset#bloco-responsavel` aparece e os campos do responsável + consentimento (LGPD) passam a ser obrigatórios.
- No sucesso: caixa `#cadastro-sucesso` (`role="status"`) com a categoria e o overall inicial do cartão (goleiro 52; atacante 53, meia 52, lateral 50, volante 49, zagueiro 47), toast de boas-vindas e `form.reset()`.

### 4. Validação do login — `assets/js/validation.js` (`iniciarEntrar`)

- Valida e-mail e senha em branco com mensagens ao lado do campo; confere a conta em `PA.CONTAS_DEMO` e mostra em `#erro-geral` (`role="alert"`) "E-mail ou senha incorretos" ou o aviso de tipo errado (conta de atleta tentando entrar como equipe e vice-versa).
- Botões `[data-demo]` preenchem e-mail, senha e tipo com um clique.
- `#mostrar-senha` alterna `type="password"` ↔ `type="text"` e informa o estado com `aria-pressed`.
- Login certo: toast de boas-vindas e redirecionamento para o feed.

### 5. Avisos dinâmicos (toasts), abas e menu — `assets/js/ui.js`

- `PA.avisar(texto, tipo)` cria um `<div class="aviso sucesso|erro|info" role="status">` dentro de `#avisos` (`aria-live="polite"`, criado uma vez). O aviso some sozinho em 4,5 s ou pelo botão ×. Animação de entrada desligada com `prefers-reduced-motion`.
- `PA.abas(contenedor, aoMudar)` implementa o padrão *tablist* acessível: `aria-selected`, `tabindex` rotativo e setas ← →.
- `PA.marcarPaginaAtual()` coloca `aria-current="page"` no link do menu da página aberta.
- `PA.escapar(texto)` escapa HTML antes de montar a vitrine com dados.

### 6. Dados — `assets/js/data.js`

Atletas, contas de demonstração, posições e UFs ficam em memória (`PA.ATLETAS`, `PA.CONTAS_DEMO`, `PA.POSICOES`, `PA.UFS`). Em produção viriam de uma API; a estrutura de cada atleta (`tags[].votos[]`, `seguidores[]`) já é a mesma que o MVP usa.

## Acessibilidade

Skip link, `label` em todo campo, `aria-describedby` ligando dica e erro, `aria-invalid`, `role="alert"` / `role="status"`, região `aria-live` para os toasts, botões de tag e seguir com `aria-pressed`, abas com padrão *tablist*, foco visível (contorno dourado), alvos de toque de 44 px e contraste AA nos tokens.

## Testes

`testes/testar_wd.py` (Playwright, `pip install playwright && playwright install chromium`) abre as três páginas e confere 44 pontos: filtros, votos, seguir, abas por teclado, validações do cadastro e do login, ausência de rolagem horizontal em 390/768 px e zero erros de console.
