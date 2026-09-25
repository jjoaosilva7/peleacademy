# PelÃ© Academia Â· gÃªmeo lÃ³gico em Python (Sprint 3 Â· CTWP)

**Projeto:** app da PelÃ© Academia, "Onde o legado entra em campo": da peneira Ã  formaÃ§Ã£o do atleta, com treinos avaliados, cartÃ£o do jogador, rede de cuidado e rotas atÃ© a peneira.

**Grupo Zenyth Â· 1ESSRA-2026 Â· FIAP**

| Integrante | RM |
| --- | --- |
| Guilherme de Paula Correia | RM572126 |
| JoÃ£o Vitor Barbosa Silva | RM570109 |
| Lucas Rodrigues de Carvalho | RM573788 |

**MVP Visual (para comparar o cÃ³digo com as telas):** https://peleacademy.vercel.app *(o mesmo app estÃ¡ no repositÃ³rio, na raiz; instruÃ§Ãµes de execuÃ§Ã£o no README principal)*

## O que Ã© este script

`pele_academia.py` Ã© o **gÃªmeo lÃ³gico** do MVP Visual: um programa de terminal (menus com `while` + `input`) que percorre os mesmos fluxos das telas, pede os mesmos campos e aplica as mesmas regras de negÃ³cio. NÃ£o tem botÃµes nem cores, mas processa os mesmos dados na mesma ordem em que o usuÃ¡rio clicaria no app.

## Como rodar

```bash
python pele_academia.py
```

Sem dependÃªncias externas (sÃ³ a biblioteca padrÃ£o). Testado com Python 3.11.

Contas de demonstraÃ§Ã£o (senha `pele2026`):

| Conta | Perfil | O que mostra |
| --- | --- | --- |
| kaua@exemplo.com | Candidato | peneiras, inscriÃ§Ã£o, "Como chegar" e cartÃ£o inicial (overall 52) |
| joao@exemplo.com | Atleta da academia | check-in, evoluÃ§Ã£o, cartÃ£o e temporada |
| lucas@exemplo.com | Atleta em alerta | aviso "Vamos cuidar de vocÃª" e agendamento com fisio/psicÃ³logo |
| tecnico@peleacademia.com.br | Equipe tÃ©cnica | painel, avaliar treino, times, jogos, avaliar candidato, encaminhar |

## Espelhamento de fluxos (tela do app â†’ funÃ§Ã£o do script)

| Tela do MVP Visual | FunÃ§Ã£o no Python | Regras aplicadas |
| --- | --- | --- |
| Entrar | `fluxo_entrar` | tipo de acesso separado (atleta / equipe), e-mail e senha |
| Criar conta de atleta | `fluxo_cadastro` + `validar_cadastro` | idade de 7 a 20, categoria pela idade, altura/peso, e-mail Ãºnico, senha com letras e nÃºmeros, responsÃ¡vel e consentimento (LGPD) para menores de 18 |
| Peneiras | `fluxo_peneiras` + `verificar_inscricao` | inscriÃ§Ã£o sÃ³ na prÃ³pria categoria, com vagas e antes da data; sem inscriÃ§Ã£o repetida |
| Como chegar | `opcoes_de_rota` | links do Uber, Moovit, Waze e Google Maps com o destino da peneira |
| Check-in do dia | `fluxo_checkin` | Ã­ndice de bem-estar (4 a 20), carga sRPE (esforÃ§o Ã— minutos), razÃ£o aguda/crÃ´nica |
| InÃ­cio / EvoluÃ§Ã£o / CartÃ£o | `fluxo_evolucao`, `mostrar_cartao`, `atributos_atuais`, `calcular_overall` | atributos iniciais 55/45/45/55 (goleiro 45/55/50), recalculados sÃ³ pelas notas do treinador; overall ponderado por posiÃ§Ã£o; moldura areia/dourada/elite |
| Vamos cuidar de vocÃª | `fluxo_cuidado` + `verificar_cuidado` | 3 treinos seguidos abaixo de 6,5 e sinais dos check-ins â†’ fisioterapeuta e/ou psicÃ³logo; agendamento em horÃ¡rios do CT |
| Painel da equipe | `fluxo_painel` | indicadores do dia e **matriz** atleta Ã— Ãºltimos treinos com sugestÃµes de encaminhamento |
| Avaliar treino | `fluxo_avaliar_treino` + `calcular_nota_treino` | nota base 6,5 + estatÃ­sticas ponderadas âˆ’ 0,3 por ponto a melhorar + ajuste (âˆ’1 a +1), limitada entre 3 e 10 |
| Montar times | `fluxo_montar_times` + `montar_times` | distribuiÃ§Ã£o setor por setor (GOL, DEF, MEI, ATA) equilibrando o overall |
| Registrar jogo | `fluxo_registrar_jogo` + `validar_jogo` | gols dos jogadores â‰¤ placar; assistÃªncias â‰¤ gols |
| Avaliar candidato | `fluxo_avaliar_candidato` + `calcular_nota_final` | mÃ©dia dos 6 critÃ©rios; 7 ou mais sugere aprovaÃ§Ã£o; aprovado vira atleta da academia |
| Encaminhar | `fluxo_encaminhar` | comissÃ£o marca fisio/psicÃ³logo com dia, horÃ¡rio e motivo |

## Estruturas de dados

- **Listas:** `atletas`, `peneiras`, `inscricoes`, `treinos`, `jogos`, `consultas`, `usuarios`.
- **DicionÃ¡rios:** cada atleta, peneira, check-in, registro de treino e jogo; tabelas de regras (`PESOS`, `STATS`, `STATS_POR_POSICAO`, `FALHAS`, `ATRIBUTOS_INICIAIS`).
- **Matrizes:** `montar_times` devolve uma lista de times (cada time Ã© uma lista de jogadores); o painel imprime a matriz atleta Ã— Ãºltimos 5 treinos; a tabela de atributos Ã© uma matriz atleta Ã— atributos.

## ModularizaÃ§Ã£o

Cada aÃ§Ã£o principal Ã© uma funÃ§Ã£o com parÃ¢metros e retorno: regras puras (`calcular_nota_treino`, `aplicar_treino`, `calcular_overall`, `verificar_cuidado`, `montar_times`, `validar_jogo`, `validar_cadastro`...) separadas dos fluxos de tela (`fluxo_*`) e das funÃ§Ãµes de leitura do terminal (`ler_inteiro`, `ler_opcao`, `ler_data`...). As mesmas regras estÃ£o implementadas em TypeScript no app (`src/app/lib/regras.ts`, `desempenho.ts`, `cuidado.ts`, `mobilidade.ts`).

## Uso de IA generativa

Todos os prompts usados nesta sprint estÃ£o em `PROMPTS.txt` (nesta pasta) e no `PROMPTS.md` da raiz do repositÃ³rio.

