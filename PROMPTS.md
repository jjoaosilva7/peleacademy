# Prompts de IA usados no projeto

Todos os prompts usados pelo Grupo Zenyth, na ordem, com a ferramenta e o que foi aproveitado. Os prompts estão como foram escritos (informais mesmo); o que a IA gerou foi revisado, testado e adaptado pelo grupo.

## Ferramenta: Claude (Anthropic)

### 1. Leitura dos requisitos
**Prompt:** lê o documento do Challenge (Sprints 3 e 4) e vê o que eu tenho que entregar de cada matéria (CTWP, WD, STED, DPS, ECCS e FED), com prazo, formato e critérios de avaliação.
**Uso no projeto:** lista de entregas por disciplina que virou o roteiro deste repositório (pastas `wd/`, `ctwp/`, `eccs/` e `docs/`).

### 2. Pesquisa de referências e definição de funcionalidades
**Prompt:** o app é da Pelé Academia (Resende, RJ). Pesquisa como funcionam peneiras e categorias de base, cartões de jogador estilo FIFA e apps de acompanhamento de atleta, e propõe as funcionalidades do MVP separando o que é do atleta e o que é da equipe técnica.
**Uso no projeto:** categorias por idade (Sub-11 a Sub-20), fluxo de peneira, cartão com overall por posição, check-in de bem-estar e a ideia central de captar e manter o atleta.

### 3. Reconstrução do app com login de atleta e equipe
**Prompt:** o app está com muita cara de IA, as cores não estão legais também, precisa ter uma parte do técnico da peneira que também vai entrar no app, então de começo no app tem que separar atleta de funcionário, tem que ter login e senha pra cada; na parte do funcionário ele tem que ter opções também de analisar tudo do atleta
**Uso no projeto:** nova estrutura de telas, design system com as cores do logo, regras de negócio e revisão de acessibilidade.

### 4. Paleta de cores
**Prompt:** usa as cores do logo da Pelé Academia como base do design system: Gamboge #EDA335, Blue #004E72 e Dun #E8D1BA. Quero versão clara e escura e que os textos passem no contraste AA.
**Uso no projeto:** tokens de cor do tema claro e escuro em `src/styles/theme.css`, ajustados para contraste AA (texto azul-escuro em vez de Blue sobre Gamboge).

### 5. Rotas, cartão do jogador, avaliação de treino, times, jogos e rede de cuidado
**Prompt:** Quero implementar integrações com uber e moovit e waze pro atleta ter uma base de como ir para o endereço da peneira. Quero mudar totalmente a ui ux do app. Quero que o app cheque o status do atleta tipo 3 dias que ele não faz um treino bom, psicólogo ou fisio. Tem que ter uma aba onde o olheiro avalie o treino de cada atleta de forma rápida e prática, avaliar no que o jogador está pecando, colocar estatísticas de cada jogador tipo sofascore e isso influencie na nota de treino. Preciso de uma aba onde o olheiro/treinador monte os times de acordo com cada posição e nota. Preciso de foto 3x4 de cada jogador. Cada jogador tem que ter uma aba de colocar o próprio apelido. Cada jogador novo começa com ataque 55, defesa 45, força 45 e habilidade 55 e só muda de acordo com a nota do treinador, com um card tipo fifa com foto, overall, país e estatísticas. Após cada jogo o técnico coloca gols, assistências e desarmes, que vão para o perfil do jogador.
**Uso no projeto:** redesenho da interface, módulos `desempenho.ts`, `cuidado.ts` e `mobilidade.ts`, telas Treino, Times e Jogos, cartão do jogador, editor de foto 3x4 e dados de exemplo.

### 6. Cartão, botão de rota e login social
**Prompt:** (imagem do cartão gerada no Gemini) aqui está o card. Eu não quero que mostre valor, eu quero que tenha um botão pra redirecionar o atleta para algum app. Na aba de login eu quero colocar login Google, login Apple.
**Uso no projeto:** cartão redesenhado em SVG a partir da imagem, botão único "Como chegar" com escolha do app, botões "Continuar com Google" e "Continuar com Apple".

### 7. Refinamento visual
**Prompt:** trabalhe em melhorias de UI/UX, está com muita cara de IA, preciso de cores e letras bonitas.
**Uso no projeto:** novas fontes (Big Shoulders Display e Instrument Sans), tema claro creme e tema escuro azul-marinho inspirados no cartão, placar escuro com números em ouro, vitrine com as linhas do campo, abas sublinhadas e cantos retos no lugar dos botões arredondados.

### 8. Estilo visual a partir de referência
**Prompt:** (imagem de referência de um app com azul-céu, cartões arredondados e barra flutuante) gostei dessa ideia de UI/UX, quero implementar no meu.
**Uso no projeto:** tema azul-céu, cartões brancos arredondados, painéis azuis com nuvens, blocos de estatística com anéis de progresso, números com decimais mais claros, barra de navegação flutuante escura só com ícones, cabeçalho com foto e saudação e tela de login no estilo de boas-vindas.

### 9. Abertura animada
**Prompt:** (vídeo de referência de uma abertura em que o logo é desenhado e depois dá zoom, e imagem do logo) como eu posso fazer esse preloader igual ao do vídeo, só que com a logo da Pelé Academia?
**Uso no projeto:** componente de abertura com o logo em vetor, animação em CSS, botão Pular e versão para quem prefere menos movimento.

### 10. Slogan e nova tela de entrar
**Prompt:** precisa colocar no preloader o slogan "Onde o legado entra em campo"; não estou achando legal a página de login.
**Uso no projeto:** slogan na abertura e na tela de entrar; login refeito em fundo escuro com o logo, cartão branco centralizado, campos com ícone, botão dourado, Google/Apple lado a lado e contas de demonstração em fichas.

### 11. Ajustes do painel e encaminhamento
**Prompt:** o painel após o login tem muita informação; o cartão do jogador está com os atributos tortos; ficou faltando a implementação de como ir (Uber, Moovit); no celular os textos ficaram fora do box; não tem opção de encaminhar para a fisio nem para a psicóloga.
**Uso no projeto:** início do atleta enxuto, atributos do cartão em colunas iguais, "Como chegar" em toda peneira, etiquetas que quebram linha no celular e ação "Encaminhar" da equipe com profissional, horário e motivo.

### 12. Cartão do goleiro
**Prompt:** precisa ter card de goleiro também, com chute, elasticidade e posicionamento.
**Uso no projeto:** atributos próprios do goleiro no cartão, no overall, na evolução e nas regras de treino e avaliação.

### 13. API de login do Google e da Apple
**Prompt:** aqui precisa ter a API de login do Google e do iPhone também.
**Uso no projeto:** integração com Google Identity Services e Sign in with Apple JS, chaves em variáveis de ambiente, cadastro pré-preenchido pelo provedor e modo de demonstração quando não há chave.

### 14. Cartão refeito e ajustes de celular
**Prompt:** o site está sem renderização para celular e o erro do cartão continua; melhor fazer o cartão do zero.
**Uso no projeto:** cartão do jogador refeito em HTML e CSS (sem texto em SVG), gráficos responsivos e correção da rolagem lateral nas telas do atleta.

### 15. Nova pegada visual (site esportivo)
**Prompt:** (imagem de referência de um site esportivo com títulos condensados em caixa alta, blocos azul-marinho e vitrines de produto) consegue refazer todo o site e deixar ele numa pegada mais assim?
**Uso no projeto:** títulos em Big Shoulders em caixa alta, blocos azul-marinho com as linhas do campo, barra de navegação superior em pílula, atletas em blocos estilo vitrine com canto recortado e seta, tela de entrar em azul-marinho.

### 16. Apresentação e textos
**Prompt:** preciso de textos e um slide em HTML mostrando as funcionalidades do meu app, com efeito 3D ao passar os slides, para 5 minutos de pitch e 5 de protótipo. Coloca o nome do grupo (Grupo Zenyth), a logo no primeiro slide, e explica que a ideia não é só captar atletas mas manter também, e a integração com Uber, Moovit e Waze.
**Uso no projeto:** apresentação em HTML com cenas 3D (`docs/apresentacao/`), roteiro do pitch e texto explicativo do projeto.

### 17. Telas para o Figma
**Prompt:** me manda o index.html do app para eu importar no Figma, porque lá não está aceitando o arquivo todo.
**Uso no projeto:** versão leve do app em um arquivo e 22 telas estáticas exportadas para o plugin html.to.design; protótipo no Figma montado a partir delas.

### 18. Entregas das outras disciplinas
**Prompt:** acredito que você consegue fazer todos (CTWP, WD, STED, DPS e ECCS), só não sei o de ECCS.
**Uso no projeto:** gêmeo lógico em Python (`ctwp/`), camada Vanilla JS (`wd/`), diagramas de casos de uso e documento Word (`docs/sted/`), apresentação de cálculo (`docs/dps/`) e projeto ESP32 + ThingSpeak (`eccs/`). Tudo revisado e testado pelo grupo antes da entrega.

### 19. Desempenho e acessibilidade
**Prompt:** roda o Lighthouse nas telas principais, corrige o que estiver abaixo de 90 e gera os prints em celular, tablet e desktop e o vídeo de até 3 minutos com um trecho só por teclado.
**Uso no projeto:** carregamento sob demanda das áreas (`React.lazy`), primeira pintura no `index.html`, `robots.txt`, slogan da abertura sem transição de opacidade (contraste), relatórios em `docs/fed/lighthouse/`, prints e vídeo em `docs/fed/`.

## Ferramenta: Gemini
**Prompt:** gera a imagem de um cartão de jogador de futebol estilo FIFA nas cores azul-marinho e dourado, com foto 3x4, overall, posição, bandeira do Brasil e os atributos ataque, defesa, força e habilidade.
**Uso no projeto:** referência visual do cartão do jogador (o cartão final foi feito em HTML e CSS).

## Ferramenta: Figma Make / Claude Design
**Prompt:** monta as telas do app Pelé Academia no estilo de site esportivo (títulos condensados em caixa alta, blocos azul-marinho, cartões brancos arredondados e ouro como destaque) a partir das telas exportadas do MVP.
**Uso no projeto:** exploração visual; a versão final continuou sendo a do MVP em React, com ajustes de espaçamento inspirados no resultado.
