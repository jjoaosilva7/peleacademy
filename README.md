# PelÃ© Academia

Aplicativo da PelÃ© Academia (Resende, RJ) que acompanha o atleta **da peneira Ã  formaÃ§Ã£o**. O MVP tem duas Ã¡reas com login separado:

- **Atleta**: o candidato procura peneiras da sua categoria, se inscreve e acompanha o resultado. Depois de aprovado, vira atleta da academia e passa a fazer check-in diÃ¡rio (bem-estar e carga de treino) e acompanhar sua evoluÃ§Ã£o tÃ©cnica.
- **Equipe** (tÃ©cnicos e comissÃ£o): painel com alertas, lista de inscritos por peneira, avaliaÃ§Ã£o de candidatos com notas por critÃ©rio e decisÃ£o de aprovaÃ§Ã£o, e ficha completa de cada atleta (avaliaÃ§Ãµes, tendÃªncia, bem-estar, carga e histÃ³rico de peneiras).

Challenge FIAP 2026 Â· Sprint 3 Â· **Grupo Zenyth** Â· 1Âº Engenharia de Software (RJ)

## Integrantes

| Nome | RM |
| --- | --- |
| Guilherme de Paula Correia | RM572126 |
| JoÃ£o Vitor Barbosa Silva | RM570109 |
| Lucas Rodrigues de Carvalho | RM573788 |

TambÃ©m em [`integrantes.txt`](integrantes.txt).

## Links

- Deploy (Vercel): https://peleacademy.vercel.app
- ProtÃ³tipo navegÃ¡vel (feito com Claude, no lugar do Figma): https://claude.ai/artifact/R9vKJzVTYYeRwdUC12RULb
- ApresentaÃ§Ã£o (slides em HTML): https://claude.ai/artifact/71rMADfh4yxxeavct1zb5R
- RepositÃ³rio: https://github.com/jjoaosilva7/peleacademy
- VÃ­deo de demonstraÃ§Ã£o (atÃ© 3 min, com trecho sÃ³ por teclado): https://SEU-LINK-DO-VIDEO

> Antes de entregar, abra os trÃªs links em uma aba anÃ´nima para confirmar que estÃ£o pÃºblicos.

## Entregas da Sprint 3 neste repositÃ³rio

| Disciplina | Onde | O que Ã© |
| --- | --- | --- |
| FED | raiz (`src/`, `README.md`, `docs/fed/`) | MVP em React + Tailwind, prints, Lighthouse, vÃ­deo e PDF da entrega |
| WD | [`wd/`](wd/README.md) | Camada de interatividade em Vanilla JS (feed com tags e votos, filtros em tempo real, validaÃ§Ã£o de cadastro e login) |
| CTWP | [`ctwp/`](ctwp/README.md) | GÃªmeo lÃ³gico em Python (mesmas regras do MVP, em terminal) |
| STED | [`docs/sted/`](docs/sted/) | Diagramas de casos de uso e documentaÃ§Ã£o (Word e PDF) |
| DPS | [`docs/dps/`](docs/dps/) | Limites, derivadas e integrais aplicados ao overall e Ã  carga de treino (PDF) |
| ECCS | [`eccs/`](eccs/README.md) | ESP32 + DHT22 + OLED + ThingSpeak (cÃ³digo, Wokwi e passo a passo) |

## Stack

- React 18 com TypeScript
- Vite 6
- Tailwind CSS v4 (tokens do design system em `src/styles/theme.css`)
- React Router 7 (HashRouter)
- Ãcones: lucide-react
- Fontes: Big Shoulders Display (tÃ­tulos em caixa alta, nÃºmeros e cartÃ£o) e Instrument Sans (textos), auto-hospedadas via Fontsource

## Como rodar

PrÃ©-requisito: Node.js 18 ou mais recente.

```bash
npm install
npm run dev
```

Abra o endereÃ§o mostrado no terminal (normalmente http://localhost:5173).

Outros comandos:

```bash
npm run build      # gera a versÃ£o de produÃ§Ã£o em dist/
npm run preview    # serve a versÃ£o de produÃ§Ã£o localmente
npm run typecheck  # checagem de tipos do TypeScript
```

## Contas de demonstraÃ§Ã£o

Todas usam a senha `pele2026`. A tela de login tem atalhos para preencher cada uma.

| Perfil | Tipo de acesso | E-mail |
| --- | --- | --- |
| Candidato aguardando resultado | Atleta | kaua@exemplo.com |
| Atleta da academia (camisa 10, cartÃ£o elite) | Atleta | joao@exemplo.com |
| Atleta em alerta (3 treinos ruins, dor e sono ruim) | Atleta | lucas@exemplo.com |
| TÃ©cnica e olheira | Equipe | tecnico@peleacademia.com.br |

Os dados ficam salvos no navegador (localStorage). O botÃ£o **Restaurar dados de exemplo**, na tela de login, volta tudo ao estado inicial.

Roteiro sugerido para a banca:

1. Na tela de login, toque em **Continuar com Apple** e escolha o KauÃ£. Em **Sua prÃ³xima peneira**, toque em **Como chegar** e escolha o app. Veja o cartÃ£o inicial (52 de overall).
2. Entre como **Carla** (Equipe) e toque em **Avaliar treino de hoje**. Abra o JoÃ£ozinho, marque 2 gols e 1 assistÃªncia e veja a nota mudar. Salve: o aviso mostra quantos atletas subiram de overall.
3. Em **Times**, escolha 2 ou 3 times e toque em **Montar times**. Use **Misturar de novo** ou mova um jogador.
4. Em **Jogos**, registre um jogo. Tente lanÃ§ar mais gols do que o placar para ver a validaÃ§Ã£o.
5. Entre como **Lucas**. O app mostra **Vamos cuidar de vocÃª** e sugere fisioterapeuta e psicÃ³logo. Agende um horÃ¡rio: a consulta aparece no painel da Carla.
6. Entre como **JoÃ£o**, abra **Perfil**, envie uma foto 3x4 e troque o apelido. O cartÃ£o atualiza na hora.
7. Ainda na Carla, abra **Peneiras**, avalie o KauÃ£ e aprove: o menu dele muda para o de atleta da academia.

## Fluxos do MVP

| Fluxo | Onde |
| --- | --- |
| Login separado atleta e equipe | `/entrar` |
| Cadastro de atleta com validaÃ§Ã£o (idade 7 a 20, responsÃ¡vel e LGPD para menores) | `/cadastro` |
| Procurar peneiras com filtros e se inscrever | `/atleta/peneiras` |
| Acompanhar inscriÃ§Ãµes e resultado | `/atleta/peneiras?aba=inscricoes` |
| Check-in diÃ¡rio (bem-estar e carga) | `/atleta/check-in` |
| EvoluÃ§Ã£o tÃ©cnica e carga de treino | `/atleta/evolucao` |
| Rede de talentos: seguir atletas e confirmar pontos fortes | `/atleta/talentos` |
| Tela de entrar em fundo escuro com o logo, slogan, cartÃ£o branco, Google/Apple e contas de demonstraÃ§Ã£o | `/entrar` |
| Entrar com Google ou Apple (simulado na demonstraÃ§Ã£o) | `/entrar` |
| BotÃ£o "Como chegar" em toda peneira: abre Uber, Moovit, Waze ou Google Maps com o destino marcado | `/atleta` e `/atleta/peneiras` |
| CartÃ£o do jogador com overall, paÃ­s, foto 3x4 e atributos | `/atleta`, `/atleta/perfil`, fichas |
| Apelido, paÃ­s e foto 3x4 (com recorte) | `/atleta/perfil` |
| Rede de cuidado: 3 treinos ruins sugerem fisio ou psicÃ³logo, com agendamento | `/atleta` |
| Encaminhamento pela equipe (profissional, horÃ¡rio e motivo), visÃ­vel para o atleta | `/equipe` e ficha do atleta |
| Painel da equipe com alertas e encaminhamentos | `/equipe` |
| AvaliaÃ§Ã£o rÃ¡pida de treino com estatÃ­sticas e pontos a melhorar | `/equipe/treino` |
| Montagem de times equilibrados por posiÃ§Ã£o e overall | `/equipe/times` |
| Registro de jogos (gols, assistÃªncias, desarmes, defesas) | `/equipe/jogos` |
| Avaliar candidato e aprovar para a academia | `/equipe/peneiras` |
| Ficha completa do atleta e nova avaliaÃ§Ã£o | `/equipe/atletas` |

## Design system no Tailwind

Os tokens ficam em `src/styles/theme.css`. A paleta tem trÃªs cores principais, declaradas como variÃ¡veis CSS com versÃ£o clara e escura:

| Cor | Hex | Uso |
| --- | --- | --- |
| Blue | `#004E72` | marca: botÃµes principais, navegaÃ§Ã£o ativa, blocos de destaque |
| Gamboge | `#EDA335` | destaque: botÃ£o de aÃ§Ã£o principal, nÃºmero da camisa, grafismo |
| Dun | `#E8D1BA` | fundos: fundo da pÃ¡gina (versÃ£o clara), superfÃ­cies secundÃ¡rias, bordas |

Tokens de apoio: `marca` (`#0B1F3A`, azul-marinho dos blocos de destaque, botÃµes e item ativo), `ceu-claro` (`#7FB6DB`, blocos secundÃ¡rios), `cromo` (`#0B1F3A`, barra flutuante do celular), cores dos anÃ©is de progresso (`anel-verde`, `anel-rosa`, `anel-azul`, `anel-coral`, `anel-amarelo`, `anel-lilas`) e a escala de notas `nota-elite`, `nota-otima`, `nota-boa`, `nota-regular` e `nota-ruim`, usada nos chips de nota de treino.

O texto usa um azul bem escuro (`#0B2B3C`) derivado do Blue, porque o Blue sobre o Gamboge nÃ£o atinge o contraste mÃ­nimo AA. O bloco `@theme inline` transforma cada variÃ¡vel em classe do Tailwind:

```css
@theme inline {
  --color-marca: var(--marca);       /* bg-marca, text-marca */
  --color-acento: var(--acento);     /* bg-acento (botÃ£o principal) */
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
    App.tsx              rotas e proteÃ§Ã£o por tipo de acesso
    tipos.ts             modelos de dados
    lib/regras.ts        regras de cadastro, peneira, bem-estar e carga
    lib/desempenho.ts    atributos, overall, nota de treino, times e jogos
    lib/cuidado.ts       rede de cuidado (fisio e psicÃ³logo)
    lib/mobilidade.ts    links de rota para Uber, Moovit, Waze e Google Maps
    dados/exemplo.ts     dados fictÃ­cios da demonstraÃ§Ã£o
    estado/EstadoApp.tsx sessÃ£o, dados e aÃ§Ãµes do app
    componentes/ui       botÃµes, campos, abas, avisos (toasts)
    componentes/dominio  cartÃ£o de peneira, formulÃ¡rio de avaliaÃ§Ã£o, painÃ©is
    componentes/graficos grÃ¡ficos em SVG
    paginas/auth         entrar e cadastro
    paginas/atleta       Ã¡rea do atleta
    paginas/equipe       Ã¡rea da equipe
  styles/theme.css       tokens do design system
```

## Regras de negÃ³cio

Ficam em `src/app/lib/regras.ts` e sÃ£o as mesmas do script Python:

- Idade aceita: 7 a 20 anos. Categorias: Sub-11 e Sub-13 Futsal, Sub-15, Sub-17 e Sub-20.
- Menores de 18 anos precisam de responsÃ¡vel e consentimento.
- Nota da peneira: mÃ©dia dos 6 critÃ©rios (velocidade, passe, drible, finalizaÃ§Ã£o, posicionamento, fÃ­sico). Nota 7 ou mais sugere aprovaÃ§Ã£o; a decisÃ£o Ã© do tÃ©cnico.
- Bem-estar: soma de 4 perguntas de 1 a 5 (de 4 a 20). Abaixo de 10 gera alerta.
- Carga do treino: esforÃ§o (0 a 10) vezes minutos. Se a carga dos Ãºltimos 7 dias passar de 1,5 vez a mÃ©dia semanal das Ãºltimas 4 semanas, gera alerta.
- TendÃªncia: variaÃ§Ã£o mÃ©dia da nota nas Ãºltimas 3 avaliaÃ§Ãµes.

### CartÃ£o e overall (`lib/desempenho.ts`)

- Todo jogador de linha novo comeÃ§a com ataque 55, defesa 45, forÃ§a 45 e habilidade 55. O goleiro tem cartÃ£o prÃ³prio, com chute 45, elasticidade 55 e posicionamento 50. Os atributos nÃ£o sÃ£o digitados: o app recalcula a partir do histÃ³rico de notas do treinador, em ordem de data.
- Cada avaliaÃ§Ã£o tÃ©cnica puxa o atributo 25% em direÃ§Ã£o Ã  nota do critÃ©rio vezes 10 (ataque = finalizaÃ§Ã£o e velocidade, defesa = posicionamento, forÃ§a = fÃ­sico, habilidade = passe e drible; no goleiro, chute = passe e finalizaÃ§Ã£o, elasticidade = fÃ­sico e velocidade, posicionamento = posicionamento), no mÃ¡ximo 5 pontos por avaliaÃ§Ã£o.
- Cada treino avaliado soma (nota âˆ’ 6,5) Ã— 0,15 em todos os atributos, mais bÃ´nus por estatÃ­stica (ex.: gol +0,6 no ataque, desarme +0,3 na defesa; no goleiro, defesa +0,35 na elasticidade, saÃ­da +0,25 e gol sofrido âˆ’0,25 no posicionamento, passe decisivo +0,25 no chute) e âˆ’0,5 no atributo ligado a cada ponto a melhorar. No mÃ¡ximo 2 pontos por treino. Limites de 30 a 99.
- Overall = mÃ©dia ponderada pela posiÃ§Ã£o (ex.: atacante 45% ataque, 30% habilidade, 15% forÃ§a, 10% defesa; goleiro 45% elasticidade, 40% posicionamento, 15% chute). Faixa do cartÃ£o: base atÃ© 59, destaque de 60 a 74, elite a partir de 75.

### Nota de treino

- ComeÃ§a em 6,5. Soma o peso de cada estatÃ­stica: gol +1, assistÃªncia +0,7, finalizaÃ§Ã£o no alvo +0,2, passe decisivo +0,3, drible +0,15, desarme +0,3, interceptaÃ§Ã£o +0,25, defesa +0,4, gol sofrido âˆ’0,3, perda de bola âˆ’0,15.
- Cada ponto a melhorar (passe, finalizaÃ§Ã£o, marcaÃ§Ã£o, posicionamento, intensidade, tomada de decisÃ£o) tira 0,3. O treinador ainda pode ajustar de âˆ’1 a +1. Resultado entre 3 e 10.
- Cores: 8 ou mais (azul), 7 a 7,9 (verde), 6,5 a 6,9 (amarelo), 6 a 6,4 (laranja), abaixo de 6 (vermelho).

### Rede de cuidado (`lib/cuidado.ts`)

- Treino bom = nota 6,5 ou mais. TrÃªs treinos seguidos abaixo disso acendem o alerta.
- Dor mÃ©dia atÃ© 2,5 nos 3 Ãºltimos check-ins, ou treinos ruins com cansaÃ§o alto ou falha de intensidade: sugere fisioterapeuta.
- Sono ou estresse mÃ©dio atÃ© 2,5 nos 3 Ãºltimos check-ins: sugere psicÃ³logo do esporte. Treinos ruins sem sinal fÃ­sico tambÃ©m sugerem psicÃ³logo.
- A equipe pode **encaminhar** qualquer atleta da academia (painel ou ficha): escolhe o profissional, um horÃ¡rio nos prÃ³ximos 3 dias e o motivo. A consulta aparece no inÃ­cio do app do atleta e no painel da equipe, marcada como encaminhamento da comissÃ£o.

### Times

- Os jogadores presentes sÃ£o divididos por setor (goleiros, defesa, meio, ataque). Em cada setor, do maior para o menor overall, cada um vai para o time com menos jogadores daquele setor e, no empate, para o time com menor soma de overall. **Misturar de novo** embaralha jogadores de nota parecida e refaz a divisÃ£o.

### Jogos

- Gols dos jogadores nÃ£o podem passar do placar da academia, e o total de assistÃªncias nÃ£o pode passar do nÃºmero de gols. As estatÃ­sticas aparecem no perfil do atleta sÃ³ para atletas da academia e para a equipe.

### Abertura (preloader)

- `componentes/abertura/Abertura.tsx` e `abertura.css`. O logo Ã© "desenhado" como num editor vetorial (contornos e pontos de ancoragem), ganha o dourado, passa um brilho, mostra o slogan "Onde o legado entra em campo" e dÃ¡ um zoom para dentro da figura antes de revelar o app. Cerca de 4,6 s, com botÃ£o **Pular** (tambÃ©m por teclado), a cada abertura ou recarga da pÃ¡gina.
- Com "reduzir movimento" ligado no sistema, aparece sÃ³ o logo pronto por 1 s.
- O logo em vetor (`LogoPeleAcademia.ts`) foi redesenhado a partir de uma imagem pequena. Quando tiver o SVG oficial, troque os caminhos `d` de cada peÃ§a mantendo as chaves: a animaÃ§Ã£o continua igual.

### Entrar com Google e Apple (`lib/autenticacaoSocial.ts`)

- **Google:** usa o Google Identity Services (janela pop-up com o fluxo de token). Crie um ID de cliente OAuth "aplicativo da Web" no Google Cloud Console, cadastre `http://localhost:5173` e o endereÃ§o da Vercel em "Origens JavaScript autorizadas" e coloque o ID em `VITE_GOOGLE_CLIENT_ID`.
- **Apple:** usa o Sign in with Apple JS (pop-up). Exige conta paga no Apple Developer Program: crie um Services ID, cadastre o domÃ­nio e a URL de retorno e preencha `VITE_APPLE_CLIENT_ID` e `VITE_APPLE_REDIRECT_URI`.
- Copie `.env.example` para `.env` (o `.env` nÃ£o vai para o Git). Na Vercel, cadastre as mesmas variÃ¡veis em Settings > Environment Variables.
- Sem a chave de um provedor, o botÃ£o dele abre a escolha de conta de demonstraÃ§Ã£o. Com a chave, abre a janela real; se o e-mail jÃ¡ tem conta, entra; se nÃ£o tem, o atleta cai no cadastro com nome e e-mail preenchidos e sem campos de senha.
- Nesta versÃ£o o token Ã© lido no navegador. Em produÃ§Ã£o, valide o token no servidor antes de criar a sessÃ£o.

### CartÃ£o do jogador

- Desenhado em HTML e CSS (`componentes/dominio/CartaoJogador.tsx` e `cartao.css`), com a unidade `--u` = largura Ã· 250, para renderizar igual no Chrome, no Safari do iPhone e no Firefox: moldura em escudo (`clip-path`), faixa lateral com overall, posiÃ§Ã£o e bandeira, foto 3x4 (ou a marca-d'Ã¡gua PA quando nÃ£o hÃ¡ foto), apelido, os atributos da posiÃ§Ã£o e o escudo da academia na medalha.
- Moldura cor de areia atÃ© 59 de overall, dourada de 60 a 74 e dourada com brilho a partir de 75.

### Rotas atÃ© a peneira (`lib/mobilidade.ts`)

- SÃ£o links universais, sem chave de API: abrem o app se estiver instalado ou o site no navegador. Uber (`m.uber.com/ul`), Moovit (`moovit.com/?to=...&tll=lat_lng`), Waze (`waze.com/ul?ll=...&navigate=yes`) e Google Maps.
- **AtenÃ§Ã£o:** os endereÃ§os e coordenadas das peneiras nos dados de exemplo sÃ£o aproximados. Troque pelos endereÃ§os reais em `src/app/dados/exemplo.ts` antes da apresentaÃ§Ã£o.

## Acessibilidade

- Contraste AA nos temas claro e escuro, verificado com axe-core.
- Foco visÃ­vel em todos os elementos interativos e link "Pular para o conteÃºdo".
- Campos com rÃ³tulo, mensagens de erro ligadas ao campo (`aria-describedby`) e foco no primeiro erro.
- Abas navegÃ¡veis pelas setas do teclado, avisos anunciados por leitor de tela (`aria-live`).
- Ãrea de toque mÃ­nima de 44 px.

## ContribuiÃ§Ãµes

Cada integrante trabalhou em uma branch prÃ³pria, aberta a partir da `main`, e integrou por Pull Request revisado por outro integrante (veja [`docs/guia-github.md`](docs/guia-github.md)).

| Integrante | RM | Branch | PR | Telas / mÃ³dulos |
| --- | --- | --- | --- | --- |
| Guilherme de Paula Correia | RM572126 | `feature/entrada-e-cadastro` | #1 | Abertura animada, Entrar (login atleta/equipe, Google e Apple), Cadastro com validaÃ§Ã£o e LGPD, design system (`theme.css`) |
| JoÃ£o Vitor Barbosa Silva | RM570109 | `feature/area-do-atleta` | #2 | InÃ­cio do atleta, Peneiras e Como chegar (Uber, Moovit, Waze, Maps), Check-in, EvoluÃ§Ã£o e cartÃ£o do jogador, Talentos, Perfil com foto 3x4 |
| Lucas Rodrigues de Carvalho | RM573788 | `feature/area-da-equipe` | #3 | Painel da equipe, Avaliar treino, Times, Jogos, Peneiras e avaliaÃ§Ã£o de candidatos, Ficha do atleta e Encaminhar ao cuidado |

## Qualidade (Lighthouse e WCAG)

Auditoria com o Lighthouse 12 (modo celular, build de produÃ§Ã£o servido com compressÃ£o), relatÃ³rios em `docs/fed/lighthouse/`:

| Tela | Performance | Acessibilidade | Boas prÃ¡ticas | SEO |
| --- | --- | --- | --- | --- |
| Entrar (`#/entrar`) | 100 | 100 | 100 | 100 |
| Cadastro (`#/cadastro`) | 99 | 100 | 100 | 100 |
| InÃ­cio do atleta (`#/atleta`) | 99 | 100 | 100 | 100 |
| EvoluÃ§Ã£o (`#/atleta/evolucao`) | 99 | 100 | 100 | 100 |
| Peneiras (`#/atleta/peneiras`) | 99 | 100 | 100 | 100 |
| Painel da equipe (`#/equipe`) | 99 | 100 | 100 | 100 |
| Avaliar treino (`#/equipe/treino`) | 99 | 100 | 100 | 100 |

Para repetir: `npm run build`, sirva a pasta `dist` (ex.: `npx serve -s dist -l 4173`) e rode `npx lighthouse http://localhost:4173/#/entrar --view`. No deploy, rode direto na URL da Vercel.

Checklist WCAG 2.1 AA verificado: contraste mÃ­nimo 4,5:1 (1.4.3), redimensionamento atÃ© 200 % sem perda (1.4.4), teclado (2.1.1), sem armadilha de teclado (2.1.2), pular blocos (2.4.1), tÃ­tulo de pÃ¡gina por tela (2.4.2), ordem de foco (2.4.3), foco visÃ­vel (2.4.7), idioma da pÃ¡gina (3.1.1), rÃ³tulos e instruÃ§Ãµes (3.3.2), identificaÃ§Ã£o e sugestÃ£o de erro (3.3.1 e 3.3.3), nome/funÃ§Ã£o/valor (4.1.2), mensagens de status (4.1.3), alvos de toque de 44 px e respeito a `prefers-reduced-motion`.

## Desempenho

- As Ã¡reas do atleta e da equipe sÃ£o carregadas sob demanda (`React.lazy` em `App.tsx`): a tela de entrar baixa 89 KB de JavaScript comprimido.
- `index.html` pinta o fundo e o slogan antes do JavaScript, e o `favicon` Ã© um SVG embutido.
- Fontes auto-hospedadas em WOFF2, sÃ³ os pesos usados.

## Uso de IA

Os prompts usados estÃ£o em [PROMPTS.md](PROMPTS.md).

