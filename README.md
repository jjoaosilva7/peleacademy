# Pelé Academia

Aplicativo da Pelé Academia (Resende, RJ) que acompanha o atleta **da peneira à formação**. O MVP tem duas áreas com login separado:

- **Atleta**: o candidato procura peneiras da sua categoria, se inscreve e acompanha o resultado. Depois de aprovado, vira atleta da academia e passa a fazer check-in diário (bem-estar e carga de treino) e acompanhar sua evolução técnica.
- **Equipe** (técnicos e comissão): painel com alertas, lista de inscritos por peneira, avaliação de candidatos com notas por critério e decisão de aprovação, e ficha completa de cada atleta (avaliações, tendência, bem-estar, carga e histórico de peneiras).

Challenge FIAP 2026 · Sprint 3 · **Grupo Zenyth** · 1º Engenharia de Software (RJ)

## Integrantes

| Nome | RM |
| --- | --- |
| Guilherme de Paula Correia | RM572126 |
| João Vitor Barbosa Silva | RM570109 |
| Lucas Rodrigues de Carvalho | RM573788 |

Também em [`integrantes.txt`](integrantes.txt).

## Links

- Deploy (Vercel): https://peleacademy.vercel.app
- Protótipo navegável (feito com Claude, no lugar do Figma): https://claude.ai/artifact/R9vKJzVTYYeRwdUC12RULb
- Apresentação (slides em HTML): https://claude.ai/artifact/71rMADfh4yxxeavct1zb5R
- Repositório: https://github.com/jjoaosilva7/peleacademy
- Vídeo de demonstração (até 3 min, com trecho só por teclado): https://drive.google.com/drive/folders/1VfuohDz0s2ZK5NBlg386KAhDk4etXoMQ?usp=drive_link

> Antes de entregar, abra os três links em uma aba anônima para confirmar que estão públicos.

## Entregas da Sprint 3 neste repositório

| Disciplina | Onde | O que é |
| --- | --- | --- |
| FED | raiz (`src/`, `README.md`, `docs/fed/`) | MVP em React + Tailwind, prints, Lighthouse, vídeo e PDF da entrega |
| WD | [`wd/`](wd/README.md) | Camada de interatividade em Vanilla JS (feed com tags e votos, filtros em tempo real, validação de cadastro e login) |
| CTWP | [`ctwp/`](ctwp/README.md) | Gêmeo lógico em Python (mesmas regras do MVP, em terminal) |
| STED | [`docs/sted/`](docs/sted/) | Diagramas de casos de uso e documentação (Word e PDF) |
| DPS | [`docs/dps/`](docs/dps/) | Limites, derivadas e integrais aplicados ao overall e à carga de treino (PDF) |
| ECCS | [`eccs/`](eccs/README.md) | ESP32 + DHT22 + OLED + ThingSpeak (código, Wokwi e passo a passo) |

## Stack

- React 18 com TypeScript
- Vite 6
- Tailwind CSS v4 (tokens do design system em `src/styles/theme.css`)
- React Router 7 (HashRouter)
- Ícones: lucide-react
- Fontes: Big Shoulders Display (títulos em caixa alta, números e cartão) e Instrument Sans (textos), auto-hospedadas via Fontsource

## Como rodar

Pré-requisito: Node.js 18 ou mais recente.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

Outros comandos:

```bash
npm run build      # gera a versão de produção em dist/
npm run preview    # serve a versão de produção localmente
npm run typecheck  # checagem de tipos do TypeScript
```

## Contas de demonstração

Todas usam a senha `pele2026`. A tela de login tem atalhos para preencher cada uma.

| Perfil | Tipo de acesso | E-mail |
| --- | --- | --- |
| Candidato aguardando resultado | Atleta | kaua@exemplo.com |
| Atleta da academia (camisa 10, cartão elite) | Atleta | joao@exemplo.com |
| Atleta em alerta (3 treinos ruins, dor e sono ruim) | Atleta | lucas@exemplo.com |
| Técnica e olheira | Equipe | tecnico@peleacademia.com.br |

Os dados ficam salvos no navegador (localStorage). O botão **Restaurar dados de exemplo**, na tela de login, volta tudo ao estado inicial.

Roteiro sugerido para a banca:

1. Na tela de login, toque em **Continuar com Apple** e escolha o Kauã. Em **Sua próxima peneira**, toque em **Como chegar** e escolha o app. Veja o cartão inicial (52 de overall).
2. Entre como **Carla** (Equipe) e toque em **Avaliar treino de hoje**. Abra o Joãozinho, marque 2 gols e 1 assistência e veja a nota mudar. Salve: o aviso mostra quantos atletas subiram de overall.
3. Em **Times**, escolha 2 ou 3 times e toque em **Montar times**. Use **Misturar de novo** ou mova um jogador.
4. Em **Jogos**, registre um jogo. Tente lançar mais gols do que o placar para ver a validação.
5. Entre como **Lucas**. O app mostra **Vamos cuidar de você** e sugere fisioterapeuta e psicólogo. Agende um horário: a consulta aparece no painel da Carla.
6. Entre como **João**, abra **Perfil**, envie uma foto 3x4 e troque o apelido. O cartão atualiza na hora.
7. Ainda na Carla, abra **Peneiras**, avalie o Kauã e aprove: o menu dele muda para o de atleta da academia.

## Fluxos do MVP

| Fluxo | Onde |
| --- | --- |
| Login separado atleta e equipe | `/entrar` |
| Cadastro de atleta com validação (idade 7 a 20, responsável e LGPD para menores) | `/cadastro` |
| Procurar peneiras com filtros e se inscrever | `/atleta/peneiras` |
| Acompanhar inscrições e resultado | `/atleta/peneiras?aba=inscricoes` |
| Check-in diário (bem-estar e carga) | `/atleta/check-in` |
| Evolução técnica e carga de treino | `/atleta/evolucao` |
| Rede de talentos: seguir atletas e confirmar pontos fortes | `/atleta/talentos` |
| Tela de entrar em fundo escuro com o logo, slogan, cartão branco, Google/Apple e contas de demonstração | `/entrar` |
| Entrar com Google ou Apple (simulado na demonstração) | `/entrar` |
| Botão "Como chegar" em toda peneira: abre Uber, Moovit, Waze ou Google Maps com o destino marcado | `/atleta` e `/atleta/peneiras` |
| Cartão do jogador com overall, país, foto 3x4 e atributos | `/atleta`, `/atleta/perfil`, fichas |
| Apelido, país e foto 3x4 (com recorte) | `/atleta/perfil` |
| Rede de cuidado: 3 treinos ruins sugerem fisio ou psicólogo, com agendamento | `/atleta` |
| Encaminhamento pela equipe (profissional, horário e motivo), visível para o atleta | `/equipe` e ficha do atleta |
| Painel da equipe com alertas e encaminhamentos | `/equipe` |
| Avaliação rápida de treino com estatísticas e pontos a melhorar | `/equipe/treino` |
| Montagem de times equilibrados por posição e overall | `/equipe/times` |
| Registro de jogos (gols, assistências, desarmes, defesas) | `/equipe/jogos` |
| Avaliar candidato e aprovar para a academia | `/equipe/peneiras` |
| Ficha completa do atleta e nova avaliação | `/equipe/atletas` |

## Design system no Tailwind

Os tokens ficam em `src/styles/theme.css`. A paleta tem três cores principais, declaradas como variáveis CSS com versão clara e escura:

| Cor | Hex | Uso |
| --- | --- | --- |
| Blue | `#004E72` | marca: botões principais, navegação ativa, blocos de destaque |
| Gamboge | `#EDA335` | destaque: botão de ação principal, número da camisa, grafismo |
| Dun | `#E8D1BA` | fundos: fundo da página (versão clara), superfícies secundárias, bordas |

Tokens de apoio: `marca` (`#0B1F3A`, azul-marinho dos blocos de destaque, botões e item ativo), `ceu-claro` (`#7FB6DB`, blocos secundários), `cromo` (`#0B1F3A`, barra flutuante do celular), cores dos anéis de progresso (`anel-verde`, `anel-rosa`, `anel-azul`, `anel-coral`, `anel-amarelo`, `anel-lilas`) e a escala de notas `nota-elite`, `nota-otima`, `nota-boa`, `nota-regular` e `nota-ruim`, usada nos chips de nota de treino.

O texto usa um azul bem escuro (`#0B2B3C`) derivado do Blue, porque o Blue sobre o Gamboge não atinge o contraste mínimo AA. O bloco `@theme inline` transforma cada variável em classe do Tailwind:

```css
@theme inline {
  --color-marca: var(--marca);       /* bg-marca, text-marca */
  --color-acento: var(--acento);     /* bg-acento (botão principal) */
  --color-tinta: var(--tinta);       /* cor do texto */
  --color-sucesso: var(--sucesso);   /* estados */
  --color-atencao: var(--atencao);
  --color-erro: var(--erro);
}

@theme {
  --font-display: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
  --font-sans: 'Instrument Sans', 'Segoe UI', Roboto, sans-serif;
  --font-cartao: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
}
```

Nenhum componente usa cor solta (hexadecimal) no JSX: tudo passa pelos tokens.

## Estrutura de pastas

```
src/
  app/
    App.tsx              rotas e proteção por tipo de acesso
    tipos.ts             modelos de dados
    lib/regras.ts        regras de cadastro, peneira, bem-estar e carga
    lib/desempenho.ts    atributos, overall, nota de treino, times e jogos
    lib/cuidado.ts       rede de cuidado (fisio e psicólogo)
    lib/mobilidade.ts    links de rota para Uber, Moovit, Waze e Google Maps
    dados/exemplo.ts     dados fictícios da demonstração
    estado/EstadoApp.tsx sessão, dados e ações do app
    componentes/ui       botões, campos, abas, avisos (toasts)
    componentes/dominio  cartão de peneira, formulário de avaliação, painéis
    componentes/graficos gráficos em SVG
    paginas/auth         entrar e cadastro
    paginas/atleta       área do atleta
    paginas/equipe       área da equipe
  styles/theme.css       tokens do design system
```

## Regras de negócio

Ficam em `src/app/lib/regras.ts` e são as mesmas do script Python:

- Idade aceita: 7 a 20 anos. Categorias: Sub-11 e Sub-13 Futsal, Sub-15, Sub-17 e Sub-20.
- Menores de 18 anos precisam de responsável e consentimento.
- Nota da peneira: média dos 6 critérios (velocidade, passe, drible, finalização, posicionamento, físico). Nota 7 ou mais sugere aprovação; a decisão é do técnico.
- Bem-estar: soma de 4 perguntas de 1 a 5 (de 4 a 20). Abaixo de 10 gera alerta.
- Carga do treino: esforço (0 a 10) vezes minutos. Se a carga dos últimos 7 dias passar de 1,5 vez a média semanal das últimas 4 semanas, gera alerta.
- Tendência: variação média da nota nas últimas 3 avaliações.

### Cartão e overall (`lib/desempenho.ts`)

- Todo jogador de linha novo começa com ataque 55, defesa 45, força 45 e habilidade 55. O goleiro tem cartão próprio, com chute 45, elasticidade 55 e posicionamento 50. Os atributos não são digitados: o app recalcula a partir do histórico de notas do treinador, em ordem de data.
- Cada avaliação técnica puxa o atributo 25% em direção à nota do critério vezes 10 (ataque = finalização e velocidade, defesa = posicionamento, força = físico, habilidade = passe e drible; no goleiro, chute = passe e finalização, elasticidade = físico e velocidade, posicionamento = posicionamento), no máximo 5 pontos por avaliação.
- Cada treino avaliado soma (nota − 6,5) × 0,15 em todos os atributos, mais bônus por estatística (ex.: gol +0,6 no ataque, desarme +0,3 na defesa; no goleiro, defesa +0,35 na elasticidade, saída +0,25 e gol sofrido −0,25 no posicionamento, passe decisivo +0,25 no chute) e −0,5 no atributo ligado a cada ponto a melhorar. No máximo 2 pontos por treino. Limites de 30 a 99.
- Overall = média ponderada pela posição (ex.: atacante 45% ataque, 30% habilidade, 15% força, 10% defesa; goleiro 45% elasticidade, 40% posicionamento, 15% chute). Faixa do cartão: base até 59, destaque de 60 a 74, elite a partir de 75.

### Nota de treino

- Começa em 6,5. Soma o peso de cada estatística: gol +1, assistência +0,7, finalização no alvo +0,2, passe decisivo +0,3, drible +0,15, desarme +0,3, interceptação +0,25, defesa +0,4, gol sofrido −0,3, perda de bola −0,15.
- Cada ponto a melhorar (passe, finalização, marcação, posicionamento, intensidade, tomada de decisão) tira 0,3. O treinador ainda pode ajustar de −1 a +1. Resultado entre 3 e 10.
- Cores: 8 ou mais (azul), 7 a 7,9 (verde), 6,5 a 6,9 (amarelo), 6 a 6,4 (laranja), abaixo de 6 (vermelho).

### Rede de cuidado (`lib/cuidado.ts`)

- Treino bom = nota 6,5 ou mais. Três treinos seguidos abaixo disso acendem o alerta.
- Dor média até 2,5 nos 3 últimos check-ins, ou treinos ruins com cansaço alto ou falha de intensidade: sugere fisioterapeuta.
- Sono ou estresse médio até 2,5 nos 3 últimos check-ins: sugere psicólogo do esporte. Treinos ruins sem sinal físico também sugerem psicólogo.
- A equipe pode **encaminhar** qualquer atleta da academia (painel ou ficha): escolhe o profissional, um horário nos próximos 3 dias e o motivo. A consulta aparece no início do app do atleta e no painel da equipe, marcada como encaminhamento da comissão.

### Times

- Os jogadores presentes são divididos por setor (goleiros, defesa, meio, ataque). Em cada setor, do maior para o menor overall, cada um vai para o time com menos jogadores daquele setor e, no empate, para o time com menor soma de overall. **Misturar de novo** embaralha jogadores de nota parecida e refaz a divisão.

### Jogos

- Gols dos jogadores não podem passar do placar da academia, e o total de assistências não pode passar do número de gols. As estatísticas aparecem no perfil do atleta só para atletas da academia e para a equipe.

### Abertura (preloader)

- `componentes/abertura/Abertura.tsx` e `abertura.css`. O logo é "desenhado" como num editor vetorial (contornos e pontos de ancoragem), ganha o dourado, passa um brilho, mostra o slogan "Onde o legado entra em campo" e dá um zoom para dentro da figura antes de revelar o app. Cerca de 4,6 s, com botão **Pular** (também por teclado), a cada abertura ou recarga da página.
- Com "reduzir movimento" ligado no sistema, aparece só o logo pronto por 1 s.
- O logo em vetor (`LogoPeleAcademia.ts`) foi redesenhado a partir de uma imagem pequena. Quando tiver o SVG oficial, troque os caminhos `d` de cada peça mantendo as chaves: a animação continua igual.

### Entrar com Google e Apple (`lib/autenticacaoSocial.ts`)

- **Google:** usa o Google Identity Services (janela pop-up com o fluxo de token). Crie um ID de cliente OAuth "aplicativo da Web" no Google Cloud Console, cadastre `http://localhost:5173` e o endereço da Vercel em "Origens JavaScript autorizadas" e coloque o ID em `VITE_GOOGLE_CLIENT_ID`.
- **Apple:** usa o Sign in with Apple JS (pop-up). Exige conta paga no Apple Developer Program: crie um Services ID, cadastre o domínio e a URL de retorno e preencha `VITE_APPLE_CLIENT_ID` e `VITE_APPLE_REDIRECT_URI`.
- Copie `.env.example` para `.env` (o `.env` não vai para o Git). Na Vercel, cadastre as mesmas variáveis em Settings > Environment Variables.
- Sem a chave de um provedor, o botão dele abre a escolha de conta de demonstração. Com a chave, abre a janela real; se o e-mail já tem conta, entra; se não tem, o atleta cai no cadastro com nome e e-mail preenchidos e sem campos de senha.
- Nesta versão o token é lido no navegador. Em produção, valide o token no servidor antes de criar a sessão.

### Cartão do jogador

- Desenhado em HTML e CSS (`componentes/dominio/CartaoJogador.tsx` e `cartao.css`), com a unidade `--u` = largura ÷ 250, para renderizar igual no Chrome, no Safari do iPhone e no Firefox: moldura em escudo (`clip-path`), faixa lateral com overall, posição e bandeira, foto 3x4 (ou a marca-d'água PA quando não há foto), apelido, os atributos da posição e o escudo da academia na medalha.
- Moldura cor de areia até 59 de overall, dourada de 60 a 74 e dourada com brilho a partir de 75.

### Rotas até a peneira (`lib/mobilidade.ts`)

- São links universais, sem chave de API: abrem o app se estiver instalado ou o site no navegador. Uber (`m.uber.com/ul`), Moovit (`moovit.com/?to=...&tll=lat_lng`), Waze (`waze.com/ul?ll=...&navigate=yes`) e Google Maps.
- **Atenção:** os endereços e coordenadas das peneiras nos dados de exemplo são aproximados. Troque pelos endereços reais em `src/app/dados/exemplo.ts` antes da apresentação.

## Acessibilidade

- Contraste AA nos temas claro e escuro, verificado com axe-core.
- Foco visível em todos os elementos interativos e link "Pular para o conteúdo".
- Campos com rótulo, mensagens de erro ligadas ao campo (`aria-describedby`) e foco no primeiro erro.
- Abas navegáveis pelas setas do teclado, avisos anunciados por leitor de tela (`aria-live`).
- Área de toque mínima de 44 px.

## Contribuições

Cada integrante trabalhou em uma branch própria, aberta a partir da `main`, e integrou por Pull Request revisado por outro integrante (veja [`docs/guia-github.md`](docs/guia-github.md)).

| Integrante | RM | Branch | PR | Telas / módulos |
| --- | --- | --- | --- | --- |
| Guilherme de Paula Correia | RM572126 | `feature/entrada-e-cadastro` | #1 (mesclado) | Abertura animada, Entrar (login atleta/equipe, Google e Apple), Cadastro com validação e LGPD, design system (`theme.css`) |
| João Vitor Barbosa Silva | RM570109 | `feature/area-do-atleta` | #2 (mesclado) | Início do atleta, Peneiras e Como chegar (Uber, Moovit, Waze, Maps), Check-in, Evolução e cartão do jogador, Talentos, Perfil com foto 3x4 |
| Lucas Rodrigues de Carvalho | RM573788 | `feature/area-da-equipe` | pendente | Painel da equipe, Avaliar treino, Times, Jogos, Peneiras e avaliação de candidatos, Ficha do atleta e Encaminhar ao cuidado |

## Qualidade (Lighthouse e WCAG)

Auditoria com o Lighthouse 12 (modo celular, build de produção servido com compressão), relatórios em `docs/fed/lighthouse/`:

| Tela | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| Entrar (`#/entrar`) | 100 | 100 | 100 | 100 |
| Cadastro (`#/cadastro`) | 99 | 100 | 100 | 100 |
| Início do atleta (`#/atleta`) | 99 | 100 | 100 | 100 |
| Evolução (`#/atleta/evolucao`) | 99 | 100 | 100 | 100 |
| Peneiras (`#/atleta/peneiras`) | 99 | 100 | 100 | 100 |
| Painel da equipe (`#/equipe`) | 99 | 100 | 100 | 100 |
| Avaliar treino (`#/equipe/treino`) | 99 | 100 | 100 | 100 |

Para repetir: `npm run build`, sirva a pasta `dist` (ex.: `npx serve -s dist -l 4173`) e rode `npx lighthouse http://localhost:4173/#/entrar --view`. No deploy, rode direto na URL da Vercel.

Checklist WCAG 2.1 AA verificado: contraste mínimo 4,5:1 (1.4.3), redimensionamento até 200 % sem perda (1.4.4), teclado (2.1.1), sem armadilha de teclado (2.1.2), pular blocos (2.4.1), título de página por tela (2.4.2), ordem de foco (2.4.3), foco visível (2.4.7), idioma da página (3.1.1), rótulos e instruções (3.3.2), identificação e sugestão de erro (3.3.1 e 3.3.3), nome/função/valor (4.1.2), mensagens de status (4.1.3), alvos de toque de 44 px e respeito a `prefers-reduced-motion`.

## Desempenho

- As áreas do atleta e da equipe são carregadas sob demanda (`React.lazy` em `App.tsx`): a tela de entrar baixa 89 KB de JavaScript comprimido.
- `index.html` pinta o fundo e o slogan antes do JavaScript, e o `favicon` é um SVG embutido.
- Fontes auto-hospedadas em WOFF2, só os pesos usados.

## Uso de IA

Os prompts usados estão em [PROMPTS.md](PROMPTS.md).
