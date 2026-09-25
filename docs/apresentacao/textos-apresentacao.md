# Pelé Academia: textos da apresentação

## Slide 1: O app da Pelé Academia

**Na tela:**

- Onde o legado entra em campo
- O app da Pelé Academia
- Da peneira à formação: peneiras, treinos avaliados, cartão do jogador e cuidado com o atleta
- Challenge FIAP 2026 · Engenharia de Software · Sprint 3

**Fala:** Boa tarde. Vamos apresentar o app da Pelé Academia, a academia de formação de jovens jogadores do Pelé, em Resende. A ideia em uma frase: acompanhar o atleta da peneira até a formação, com dados que a comissão técnica realmente usa no dia a dia.

## Slide 2: O que a academia precisava resolver

**Na tela:**

- O que a academia precisava resolver
- Peneiras espalhadas pelo país com inscrição e avaliação no papel.
- Avaliação subjetiva: a nota do treino ficava na cabeça do olheiro.
- Sinais de cansaço e dor passavam despercebidos até virarem lesão.
- O atleta não via a própria evolução nem por que foi ou não aprovado.
- Resposta: um app com dois lados, o do atleta e o da equipe técnica, que transforma cada treino em dado.

**Fala:** A Pelé Academia atende crianças de 7 a 13 anos no futsal e jovens de 14 a 20 no campo, com parceria do Resende FC e do Villarreal. Conversando com o desafio, quatro dores apareceram: as peneiras espalhadas, a avaliação subjetiva, os sinais de sobrecarga que ninguém registra e o atleta sem visibilidade da própria evolução. O app responde a cada uma delas.

## Slide 3: Dois perfis, um app

**Na tela:**

- Dois perfis, um app
- Atleta
- Entra como candidato: procura peneiras, se inscreve e acompanha o resultado. Quando é aprovado, o menu muda e ele vira atleta da academia: check-in, evolução, cartão e rede de talentos.
- Equipe técnica
- Técnicos e olheiros: painel do dia, avaliação rápida de treino, montagem de times, registro de jogos, ficha de cada atleta e avaliação das peneiras.
- Login separado por perfil, com e-mail e senha ou Google e Apple.

**Fala:** O app tem dois perfis com login separado. O atleta começa como candidato e, quando é aprovado numa peneira, o próprio menu dele muda para o de atleta da academia. A equipe técnica tem as ferramentas de trabalho: painel, treino, times, jogos e as fichas. O login aceita e-mail e senha, Google e Apple.

## Slide 4: Identidade: abertura e cartão do jogador

**Na tela:**

- Identidade: abertura e cartão do jogador
- A abertura desenha o logo da academia como num editor vetorial, mostra o slogan e dá um zoom para dentro do app.
- O cartão do jogador é o elemento que o atleta quer mostrar: overall, posição, país, foto 3x4, apelido e quatro atributos, num escudo azul-marinho e dourado.

**Fala:** Cuidamos da identidade porque o app precisa dar orgulho ao atleta. A abertura desenha o logo e entra no app. E o cartão do jogador, inspirado nos cartões dos jogos de futebol, mostra overall, posição, país, foto 3x4, apelido e os quatro atributos. A moldura muda de cor conforme o nível: areia, dourada e dourada com brilho.

## Slide 5: Peneiras: da busca ao caminho até o campo

**Na tela:**

- Peneiras: da busca ao caminho até o campo
- Busca por categoria, cidade e data. As regras de idade e categoria valem no cadastro e na inscrição.
- Vagas em tempo real e status da inscrição: inscrito, em avaliação, aprovado ou reprovado, com o parecer do olheiro.
- Como chegar: um botão abre Uber, Moovit, Waze ou Google Maps já com o endereço da peneira marcado.

**Fala:** Para o candidato, a jornada começa nas peneiras. Ele filtra por categoria e cidade, vê as vagas e se inscreve; as regras de idade e categoria são as mesmas do regulamento da academia. Depois acompanha o status e, quando for aprovado ou reprovado, lê o parecer do olheiro. O detalhe que mais gostamos: o botão Como chegar abre o Uber, o Moovit, o Waze ou o Google Maps já com o endereço da peneira.

## Slide 6: Cartão do jogador: números que só o treinador move

**Na tela:**

- Cartão do jogador: números que só o treinador move
- Todo atleta novo começa com ataque 55, defesa 45, força 45 e habilidade 55. Os atributos não são digitados: o app os recalcula a partir do histórico de notas do treinador.
- Avaliação técnica puxa cada atributo 25% em direção à nota do critério.
- Treino avaliado soma bônus por estatística (gol, desarme, defesa) e tira 0,5 do atributo ligado a cada ponto a melhorar.
- Overall é a média ponderada pela posição: o atacante pesa ataque, o zagueiro pesa defesa.
- Níveis da moldura: areia até 59, dourada de 60 a 74, dourada com brilho a partir de 75.

**Fala:** Aqui está a regra que dá sentido ao cartão. Todo atleta novo começa com 55, 45, 45 e 55. Ninguém digita atributo: o app recalcula tudo a partir do histórico de notas do treinador, na ordem das datas. Uma avaliação técnica puxa o atributo em direção à nota. Um treino avaliado soma bônus por estatística e desconta pelos pontos a melhorar. O overall é ponderado pela posição. Essa mesma regra está espelhada no script Python da disciplina de programação.

## Slide 7: Avaliação rápida de treino, no estilo Sofascore

**Na tela:**

- Avaliação rápida de treino, no estilo Sofascore
- O olheiro toca no atleta e marca estatísticas com botões de mais e menos: as quatro mais importantes da posição aparecem primeiro.
- Marca onde o jogador está pecando: passe, finalização, marcação, posicionamento, intensidade ou tomada de decisão.
- A nota começa em 6,5 e muda na hora. Gol vale 1, assistência 0,7, desarme 0,3, cada falha tira 0,3. O treinador ainda ajusta de −1 a +1.
- "Próximo atleta" e uma barra fixa de salvar deixam o fluxo rápido na beira do campo.

**Fala:** Esta é a tela mais importante da equipe. O olheiro toca no atleta e marca as estatísticas com botões de mais e menos; as quatro principais da posição vêm primeiro, como gols e finalizações para o atacante ou desarmes para o volante. Ele marca onde o jogador está pecando, e a nota, que começa em 6,5, muda na hora, no estilo do Sofascore. Ao salvar, o app mostra quantos atletas subiram ou caíram de overall.

## Slide 8: Rede de cuidado: o app percebe antes da lesão

**Na tela:**

- Rede de cuidado: o app percebe antes da lesão
- Check-in diário de sono, dor, cansaço, estresse, minutos e esforço, em menos de um minuto.
- Três treinos seguidos abaixo de 6,5 acendem o alerta "Vamos cuidar de você".
- Dor e cansaço nos check-ins sugerem o fisioterapeuta; sono ruim e estresse sugerem o psicólogo do esporte.
- O atleta agenda o horário no próprio app e a consulta aparece no painel da equipe.

**Fala:** O app também cuida do atleta. Todo dia ele responde um check-in rápido de sono, dor, cansaço e estresse. Se ele tem três treinos seguidos abaixo de 6,5, aparece o aviso Vamos cuidar de você. Os sinais do check-in definem quem é sugerido: dor e cansaço levam ao fisioterapeuta, sono e estresse ao psicólogo do esporte. O atleta agenda o horário ali mesmo e a consulta aparece para a comissão.

## Slide 9: Montar times equilibrados em um toque

**Na tela:**

- Montar times equilibrados em um toque
- O treinador marca quem está presente e escolhe de 2 a 4 times.
- O app distribui setor por setor (goleiros, defesa, meio, ataque): o melhor disponível vai para o time com menos jogadores daquele setor e, no empate, para o time mais fraco.
- Mostra o overall médio de cada time e a diferença entre eles. "Misturar de novo" gera outra combinação; qualquer jogador pode ser movido.

**Fala:** Para o treino coletivo, o treinador marca os presentes e escolhe quantos times quer. O app distribui setor por setor, para os times ficarem mesclados por posição e equilibrados por overall, e mostra a diferença entre o time mais forte e o mais fraco. Dá para misturar de novo ou mover um jogador na mão.

## Slide 10: Jogos e estatísticas da temporada

**Na tela:**

- Jogos e estatísticas da temporada
- Depois de cada jogo o técnico lança adversário, mando, placar e, por jogador, gols, assistências e desarmes (defesas para o goleiro).
- O app valida: os gols dos jogadores não podem passar do placar, nem as assistências do número de gols.
- Os números vão para o perfil do atleta e só atletas da academia e a equipe conseguem ver.

**Fala:** Depois de cada jogo, o técnico registra o placar e, por jogador, gols, assistências e desarmes. O app valida o lançamento: não dá para somar mais gols do que o placar. As estatísticas vão para o perfil do atleta, visíveis para os atletas da academia e para a comissão; um candidato vê um cadeado.

## Slide 11: Painel da equipe e ficha do atleta

**Na tela:**

- Painel da equipe e ficha do atleta
- Indicadores do dia e quem precisa de atenção, com encaminhamentos primeiro.
- Ficha com cartão, treinos, jogos, avaliações técnicas e carga da semana.
- Foto 3x4 com moldura de recorte para o treinador reconhecer cada um.

**Fala:** O painel resume o dia: quantos fizeram check-in, quem precisa de atenção, candidatos esperando avaliação e consultas marcadas. A ficha do atleta reúne tudo: o cartão, os treinos com as notas, os jogos, as avaliações técnicas e a carga da semana. E como o treinador precisa reconhecer quem é quem, cada atleta envia uma foto 3x4 com uma moldura de recorte.

## Slide 12: O que o atleta vê da própria evolução

**Na tela:**

- O que o atleta vê da própria evolução
- Overall ao longo do tempo, notas de cada treino e onde está pecando.
- Rede de talentos: seguir atletas e confirmar pontos fortes.
- Apelido, país e foto no perfil.

**Fala:** Do lado do atleta, a transparência é o ponto. Ele vê o overall subindo ou caindo no tempo, a nota de cada treino e o que o treinador marcou como ponto a melhorar. Na rede de talentos, segue outros atletas e confirma pontos fortes. No perfil, define apelido, país e a foto do cartão.

## Slide 13: Como foi construído

**Na tela:**

- Como foi construído
- Front-end
- React, Vite e Tailwind v4 com tokens de design (cores, fontes, raios).
- Tema claro e escuro; interface em português.
- Acessibilidade WCAG AA: auditoria automatizada sem violações em todas as telas, foco visível, alvos de 44 px, navegação por teclado.
- Dados de exemplo gerados a partir da data do dia, salvos no navegador.
- Regras de negócio
- Um módulo por assunto: cadastro e peneira, desempenho, cuidado, mobilidade.
- As mesmas regras espelhadas no gêmeo lógico em Python.
- README com as regras e PROMPTS.md com todos os prompts usados.
- Trabalho por branch de integrante e pull request, deploy na Vercel.

**Fala:** Sobre a construção: React, Vite e Tailwind v4 com tokens de design, tema claro e escuro. Acessibilidade foi tratada como requisito: a auditoria automatizada não aponta violação em nenhuma tela. As regras de negócio ficam em módulos separados e são espelhadas no gêmeo lógico em Python. O README documenta cada regra, e o PROMPTS.md registra os prompts usados com IA, como o desafio pede. O trabalho foi feito por branches, com pull request e deploy na Vercel.

## Slide 14: A demonstração em números

**Na tela:**

- A demonstração em números
- 17atletas na academia
- 14no elenco Sub-17
- 15treinos avaliados
- 4jogos registrados
- 8peneiras cadastradas
- 4contas de demonstração
- Roteiro: Kauã abre "Como chegar" · Carla avalia o treino e o overall do Joãozinho sobe · Lucas recebe o aviso de cuidado e agenda o fisio · João envia a foto e vê o cartão mudar.

**Fala:** Para a demonstração, os dados de exemplo são gerados a partir da data de hoje: 17 atletas, um elenco Sub-17 completo, 15 treinos avaliados, 4 jogos e 8 peneiras. Temos quatro contas prontas. O roteiro é curto: o Kauã abre o Como chegar; a Carla avalia o treino e o overall do Joãozinho sobe; o Lucas recebe o aviso de cuidado e agenda o fisioterapeuta; o João envia a foto e vê o cartão mudar.

## Slide 15: Próximos passos (Sprint 4)

**Na tela:**

- Próximos passos (Sprint 4)
- Login com Google e Apple de verdade, com o Firebase Authentication.
- Endereços reais das peneiras e o logo oficial em vetor.
- Integração do check-in com o sensor no CT e envio dos dados para a nuvem.
- Banco de dados no lugar do armazenamento local, para atletas e equipe verem os mesmos dados.
- Testes com atletas e treinadores da academia para ajustar a avaliação rápida.

**Fala:** Para a Sprint 4: ligar o login social ao Firebase, colocar os endereços reais e o logo oficial, integrar o check-in com o sensor do CT, trocar o armazenamento local por um banco de dados e, principalmente, testar com atletas e treinadores de verdade para ajustar a avaliação rápida.

## Slide 16: Obrigado

**Na tela:**

- Obrigado
- Contas de demonstração (senha pele2026): kaua@exemplo.com · joao@exemplo.com · lucas@exemplo.com · tecnico@peleacademia.com.br
- Onde o legado entra em campo

**Fala:** Obrigado. Ficamos à disposição para perguntas e para mostrar o app ao vivo com as contas de demonstração.

