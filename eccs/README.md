# Pelé Academia · Monitor de condições do CT (ECCS · Sprint 3)

Sistema embarcado que mede **temperatura e umidade** do centro de treinamento com um **ESP32 + DHT22**, processa os dados localmente (média móvel, índice de calor e nível de alerta), mostra tudo em um **OLED** e envia as leituras por **Wi-Fi** para um canal público no **ThingSpeak**, onde viram gráficos históricos. Simulado no **Wokwi**.

**Grupo Zenyth** · FIAP · 1º Engenharia de Software (RJ)

| Integrante | RM |
| --- | --- |
| Guilherme de Paula Correia | RM572126 |
| João Vitor Barbosa Silva | RM570109 |
| Lucas Rodrigues de Carvalho | RM573788 |

| Link | URL |
| --- | --- |
| Simulação no Wokwi | https://wokwi.com/projects/SEU_ID_AQUI |
| Canal público no ThingSpeak | https://thingspeak.com/channels/SEU_CANAL_AQUI |
| Repositório | https://github.com/jjoaosilva7/peleacademy/tree/main/eccs |

## Por que isso importa para o treino

Treinar no calor sem controle é uma das causas mais comuns de mal-estar, queda de rendimento e lesão em atletas de base — exatamente o tipo de problema que faz um jogador bom abandonar a academia. O app Pelé Academia já cuida do atleta por dentro (check-in de bem-estar, carga de treino, encaminhamento à fisioterapia e psicologia); este módulo cuida do **ambiente**: ele diz à equipe técnica, em tempo real e com histórico, se o CT está em condição de treino.

O nível é calculado pelo **índice de calor** (sensação térmica que combina temperatura e umidade, porque com umidade alta o suor não evapora e o corpo não resfria):

| Nível | Índice de calor | Ação sugerida à equipe técnica | IHM |
| --- | --- | --- | --- |
| 0 · OK | < 27 °C | Treino normal | OLED normal |
| 1 · ATENÇÃO | 27 a 31,9 °C | Pausa para água a cada 15 min | OLED normal |
| 2 · ALERTA | 32 a 39,9 °C | Reduzir intensidade e duração | OLED invertido + LED aceso |
| 3 · SUSPENDER | ≥ 40 °C | Suspender o treino | OLED invertido + LED piscando |

Esses limiares seguem as faixas de risco térmico usadas em diretrizes de exercício no calor (ACSM, CBF). Na Sprint 4 o nível do CT entra no app: a tela de avaliação de treino mostra o índice do dia e o alerta de carga passa a considerar o calor.

## O que roda onde

| Operação | Onde | Por quê |
| --- | --- | --- |
| Leitura do DHT22 a cada 2 s | **Local (ESP32)** | Aquisição periódica direto no sensor; não depende de rede. |
| Média móvel das últimas 10 leituras | **Local** | Filtra ruído do sensor antes de decidir qualquer coisa; economiza envios. |
| Índice de calor e classificação em 4 níveis | **Local** | A decisão de alerta precisa funcionar mesmo sem internet (o CT pode ficar sem Wi-Fi). |
| IHM: OLED com leituras, médias, nível e ação; LED de alerta | **Local** | Quem está no campo vê o estado na hora, sem celular. |
| Envio a cada 20 s (temp, umidade, médias, índice, nível) | **Nuvem (ThingSpeak)** | Histórico, gráficos, acesso remoto pela coordenação e pelo app. |
| Gráficos, widgets e exportação CSV | **Nuvem** | Análise de tendência (dias/horários críticos) e evidência para a comissão técnica. |

Resumo: a **borda decide e mostra**; a **nuvem guarda e compara**. Se a rede cair, o monitor continua alertando; quando volta, os envios recomeçam.

## Hardware (Wokwi)

| Componente | Pino ESP32 | Observação |
| --- | --- | --- |
| DHT22 (VCC, GND, SDA) | 3V3, GND, GPIO 4 | Sensor de temperatura e umidade; no Wokwi dá para arrastar os valores com o mouse |
| OLED SSD1306 128×64 I2C (VCC, GND, SCL, SDA) | 3V3, GND, GPIO 22, GPIO 21 | Endereço 0x3C |
| LED vermelho + resistor 220 Ω | GPIO 15 → resistor → LED → GND | Alerta (aceso) e suspender (piscando) |

Tudo está descrito em `diagram.json`; basta colar no Wokwi.

## Arquivos

```
eccs/
├── sketch.ino      # código do ESP32 (Arduino)
├── diagram.json    # circuito do Wokwi
├── libraries.txt   # bibliotecas que o Wokwi instala sozinho
├── wokwi.toml      # (opcional) extensão do VS Code
└── README.md       # este arquivo
```

## Passo a passo · Wokwi

1. Entre em https://wokwi.com e faça login (conta gratuita com Google/GitHub).
2. **New Project → ESP32**.
3. Na aba `sketch.ino`, apague o conteúdo e cole o `sketch.ino` deste repositório.
4. Na aba `diagram.json`, apague o conteúdo e cole o `diagram.json` daqui. O DHT22, o OLED e o LED aparecem já ligados.
5. Clique no **+** ao lado das abas → **Library Manager** → adicione `DHT sensor library`, `Adafruit Unified Sensor`, `Adafruit GFX Library` e `Adafruit SSD1306` (ou crie a aba `libraries.txt` e cole o conteúdo do arquivo).
6. Cole sua **Write API Key** do ThingSpeak no lugar de `COLE_AQUI_SUA_WRITE_API_KEY` (veja a próxima seção).
7. **Start the simulation** (botão verde). No Serial Monitor aparece a conexão ao Wi-Fi `Wokwi-GUEST` e depois uma linha CSV a cada 2 s; a cada 20 s, `ThingSpeak OK · entrada N`.
8. Clique no **DHT22** e arraste os controles de temperatura e umidade: com 30 °C e 70 % o índice passa de 32 °C e o LED acende (ALERTA); com 38 °C e 60 % passa de 40 °C e o LED pisca (SUSPENDER).
9. Salve o projeto (**Save**) e copie o link `https://wokwi.com/projects/...` para o README e para a entrega.

## Passo a passo · ThingSpeak

1. Crie a conta gratuita em https://thingspeak.com (é uma conta MathWorks).
2. **Channels → My Channels → New Channel**. Nome: `Pelé Academia · CT`. Marque e nomeie os campos:
   - Field 1 `Temperatura (°C)` · Field 2 `Umidade (%)` · Field 3 `Média temp (°C)` · Field 4 `Média umidade (%)` · Field 5 `Índice de calor (°C)` · Field 6 `Nível (0-3)`.
3. **Save Channel**.
4. Aba **Sharing → Make Public** (o link público é o que vai na entrega).
5. Aba **API Keys → Write API Key**: copie e cole no `sketch.ino`.
6. Rode a simulação no Wokwi. Em 20 s o primeiro ponto aparece nos gráficos da aba **Public View**.
7. Para deixar o canal mais claro: **Add Widgets → Gauge** para o índice de calor (faixas 27 / 32 / 40) e **Numeric Display** para o nível. Os gráficos de cada campo já são criados automaticamente; em cada um dá para clicar no lápis e ajustar título, cor e período.
8. Copie o link `https://thingspeak.com/channels/<id>` para o README.

## Como validar (checklist da entrega)

- [ ] Serial Monitor mostra leituras a cada 2 s e `ThingSpeak OK` a cada 20 s.
- [ ] OLED muda de nível ao mexer no DHT22; LED acende em ALERTA e pisca em SUSPENDER.
- [ ] Canal do ThingSpeak público, com os 6 campos recebendo dados e gráficos visíveis sem login (testar em aba anônima).
- [ ] Prints: circuito no Wokwi, OLED em ALERTA, Serial Monitor, gráficos do ThingSpeak (salvar em `eccs/prints/`).
- [ ] README com os três links preenchidos.

## Referências

- Wokwi · ESP32 Wi-Fi e HTTP: https://docs.wokwi.com/guides/esp32-wifi
- ThingSpeak · Write Data (API): https://www.mathworks.com/help/thingspeak/writedata.html
- Adafruit DHT sensor library (`computeHeatIndex`): https://github.com/adafruit/DHT-sensor-library
- ACSM. Exertional heat illness during training and competition. Med Sci Sports Exerc, 2007 (faixas de risco térmico).
