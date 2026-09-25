# Pelé Academia · gêmeo lógico em Python (Sprint 3 · CTWP)

**Projeto:** app da Pelé Academia, "Onde o legado entra em campo": da peneira à formação do atleta, com treinos avaliados, cartão do jogador, rede de cuidado e rotas até a peneira.

**Grupo Zenyth · 1ESSRA-2026 · FIAP**

| Integrante | RM |
| --- | --- |
| Guilherme de Paula Correia | RM572126 |
| João Vitor Barbosa Silva | RM570109 |
| Lucas Rodrigues de Carvalho | RM573788 |

**MVP Visual (para comparar o código com as telas):** https://peleacademy.vercel.app *(o mesmo app está no repositório, na raiz; instruções de execução no README principal)*

## O que é este script

`pele_academia.py` é o **gêmeo lógico** do MVP Visual: um programa de terminal (menus com `while` + `input`) que percorre os mesmos fluxos das telas, pede os mesmos campos e aplica as mesmas regras de negócio. Não tem botões nem cores, mas processa os mesmos dados na mesma ordem em que o usuário clicaria no app.

## Como rodar

```bash
python pele_academia.py
```

Sem dependências externas (só a biblioteca padrão). Testado com Python 3.11.

Contas de demonstração (senha `pele2026`):

| Conta | Perfil | O que mostra |
| --- | --- | --- |
| kaua@exemplo.com | Candidato | peneiras, inscrição, "Como chegar" e cartão inicial (overall 52) |
| joao@exemplo.com | Atleta da academia | check-in, evolução, cartão e temporada |
| lucas@exemplo.com | Atleta em alerta | aviso "Vamos cuidar de você" e agendamento com fisio/psicólogo |
| tecnico@peleacademia.com.br | Equipe técnica | painel, avaliar treino, times, jogos, avaliar candidato, encaminhar |

## Espelhamento de fluxos (tela do app → função do script)

| Tela do MVP Visual | Função no Python | Regras aplicadas |
| --- | --- | --- |
| Entrar | `fluxo_entrar` | tipo de acesso separado (atleta / equipe), e-mail e senha |
| Criar conta de atleta | `fluxo_cadastro` + `validar_cadastro` | idade de 7 a 20, categoria pela idade, altura/peso, e-mail único, senha com letras e números, responsável e consentimento (LGPD) para menores de 18 |
| Peneiras | `fluxo_peneiras` + `verificar_inscricao` | inscrição só na própria categoria, com vagas e antes da data; sem inscrição repetida |
| Como chegar | `opcoes_de_rota` | links do Uber, Moovit, Waze e Google Maps com o destino da peneira |
| Check-in do dia | `fluxo_checkin` | índice de bem-estar (4 a 20), carga sRPE (esforço × minutos), razão aguda/crônica |
| Início / Evolução / Cartão | `fluxo_evolucao`, `mostrar_cartao`, `atributos_atuais`, `calcular_overall` | atributos iniciais 55/45/45/55 (goleiro 45/55/50), recalculados só pelas notas do treinador; overall ponderado por posição; moldura areia/dourada/elite |
| Vamos cuidar de você | `fluxo_cuidado` + `verificar_cuidado` | 3 treinos seguidos abaixo de 6,5 e sinais dos check-ins → fisioterapeuta e/ou psicólogo; agendamento em horários do CT |
| Painel da equipe | `fluxo_painel` | indicadores do dia e **matriz** atleta × últimos treinos com sugestões de encaminhamento |
| Avaliar treino | `fluxo_avaliar_treino` + `calcular_nota_treino` | nota base 6,5 + estatísticas ponderadas − 0,3 por ponto a melhorar + ajuste (−1 a +1), limitada entre 3 e 10 |
| Montar times | `fluxo_montar_times` + `montar_times` | distribuição setor por setor (GOL, DEF, MEI, ATA) equilibrando o overall |
| Registrar jogo | `fluxo_registrar_jogo` + `validar_jogo` | gols dos jogadores ≤ placar; assistências ≤ gols |
| Avaliar candidato | `fluxo_avaliar_candidato` + `calcular_nota_final` | média dos 6 critérios; 7 ou mais sugere aprovação; aprovado vira atleta da academia |
| Encaminhar | `fluxo_encaminhar` | comissão marca fisio/psicólogo com dia, horário e motivo |

## Estruturas de dados

- **Listas:** `atletas`, `peneiras`, `inscricoes`, `treinos`, `jogos`, `consultas`, `usuarios`.
- **Dicionários:** cada atleta, peneira, check-in, registro de treino e jogo; tabelas de regras (`PESOS`, `STATS`, `STATS_POR_POSICAO`, `FALHAS`, `ATRIBUTOS_INICIAIS`).
- **Matrizes:** `montar_times` devolve uma lista de times (cada time é uma lista de jogadores); o painel imprime a matriz atleta × últimos 5 treinos; a tabela de atributos é uma matriz atleta × atributos.

## Modularização

Cada ação principal é uma função com parâmetros e retorno: regras puras (`calcular_nota_treino`, `aplicar_treino`, `calcular_overall`, `verificar_cuidado`, `montar_times`, `validar_jogo`, `validar_cadastro`...) separadas dos fluxos de tela (`fluxo_*`) e das funções de leitura do terminal (`ler_inteiro`, `ler_opcao`, `ler_data`...). As mesmas regras estão implementadas em TypeScript no app (`src/app/lib/regras.ts`, `desempenho.ts`, `cuidado.ts`, `mobilidade.ts`).

## Uso de IA generativa

Todos os prompts usados nesta sprint estão em `PROMPTS.txt` (nesta pasta) e no `PROMPTS.md` da raiz do repositório.
