# Pelé Academia · Monitor de condições de treino (ECCS · Sprint 3)

Sistema embarcado que mede **temperatura e umidade** do centro de treinamento com um **ESP32 + DHT22**, processa os dados localmente (média móvel das últimas 5 leituras e alerta por limiar), mostra tudo em um **OLED** e envia as leituras por **Wi-Fi** para um canal público no **ThingSpeak**, onde viram gráficos históricos. Simulado no **Wokwi**.

**Grupo Zenyth** · FIAP · 1º Engenharia de Software (RJ)

| Integrante | RM |
| --- | --- |
| Guilherme de Paula Correia | RM572126 |
| João Vitor Barbosa Silva | RM570109 |
| Lucas Rodrigues de Carvalho | RM573788 |

| Link | URL |
| --- | --- |
| Simulação no Wokwi | https://wokwi.com/projects/476175482957977601 |
| Canal público no ThingSpeak | https://thingspeak.mathworks.com/channels/3509600 |
| Repositório | https://github.com/jjoaosilva7/peleacademy/tree/main/eccs |

## Por que isso importa para o treino

Treinar no calor e na umidade alta sem controle é uma das causas mais comuns de mal-estar, queda de rendimento e lesão em atletas de base — exatamente o tipo de problema que faz um jogador bom abandonar a academia. O app Pelé Academia já cuida do atleta por dentro (check-in de bem-estar, carga de treino, encaminhamento à fisioterapia e psicologia); este módulo cuida do **ambiente**: ele diz à equipe técnica, em tempo real e com histórico, se o CT está em condição de treino.

| Estado | Condição | Ação sugerida à equipe técnica |
| --- | --- | --- |
| NORMAL | temperatura ≤ 30 °C e umidade ≤ 70 % (leitura atual e média) | Treino normal |
| ALERTA | temperatura > 30 °C **ou** umidade > 70 %, na leitura atual ou na média das últimas 5 | Pausas para hidratação, reduzir intensidade; se persistir, suspender |

Os limiares são didáticos (constantes `LIM_T` e `LIM_U` no código) e podem ser ajustados pela comissão técnica. Com umidade alta o suor não evapora e o corpo não resfria, por isso a umidade entra na regra junto com a temperatura. Na Sprint 4 o estado do CT entra no app: a tela de avaliação de treino passa a mostrar as condições do dia.

## O que roda onde

| Operação | Onde | Por quê |
| --- | --- | --- |
| Leitura do DHT22 a cada 2 s | **Local (ESP32)** | Aquisição periódica direto no sensor; não depende de rede. |
| Média móvel das últimas 5 leituras | **Local** | Filtra ruído e detecta condição persistente, não só um pico. |
| Decisão de ALERTA (limiar na leitura atual ou na média) | **Local** | O alerta precisa funcionar mesmo sem internet (o CT pode ficar sem Wi-Fi). |
| IHM: OLED com atual, média, janela, estado, Wi-Fi e nuvem | **Local** | Quem está no campo vê o estado na hora, sem celular. |
| Leitura inválida do sensor | **Local** | É descartada e o envio é suspenso: a nuvem só recebe dado válido. |
| Envio a cada 20 s (temperatura, umidade, médias, alerta) | **Nuvem (ThingSpeak)** | Histórico, gráficos e acesso remoto pela coordenação e pelo app. |
| Gráficos, widgets e exportação CSV/JSON | **Nuvem** | Análise de tendência (dias e horários críticos) e evidência para a comissão. |

O envio roda em uma **tarefa separada (FreeRTOS)** com fila: a comunicação com a nuvem nunca trava as leituras e a tela. Resumo: a **borda decide e mostra**; a **nuvem guarda e compara**. Se a rede cair, o monitor continua alertando e tenta reconectar a cada 10 s; quando volta, os envios recomeçam.

## Campos do canal ThingSpeak

| Campo | Conteúdo |
| --- | --- |
| field1 | Temperatura atual (°C) |
| field2 | Umidade atual (%) |
| field3 | Média das últimas 5 temperaturas (°C) |
| field4 | Média das últimas 5 umidades (%) |
| field5 | Alerta (0 = normal, 1 = alerta) |

## Hardware (Wokwi)

| Componente | Pino ESP32 | Observação |
| --- | --- | --- |
| DHT22 (VCC, GND, SDA) | 3V3, GND, GPIO 15 | Temperatura e umidade; no Wokwi dá para arrastar os valores com o mouse |
| OLED SSD1306 128×64 I2C (VCC, GND, SCL, SDA) | 3V3, GND, GPIO 22, GPIO 21 | Endereço 0x3C |

Tudo está descrito em `diagram.json`.

## Segurança da chave

A **Write API Key** do ThingSpeak **não fica no código**: ela é digitada no Monitor Serial depois que a simulação começa e fica só na RAM do ESP32. Assim o repositório pode ser público sem expor a chave do canal.

## Arquivos

```
eccs/
├── sketch.ino      # código do ESP32 (Arduino), o mesmo da simulação no Wokwi
├── diagram.json    # circuito do Wokwi
├── libraries.txt   # bibliotecas que o Wokwi instala sozinho (DHTesp, Adafruit GFX, Adafruit SSD1306)
├── wokwi.toml      # (opcional) extensão do VS Code
└── README.md       # este arquivo
```

## Como reproduzir

1. Abra a simulação: https://wokwi.com/projects/476175482957977601 (ou crie um projeto ESP32 no Wokwi e cole `sketch.ino`, `diagram.json` e `libraries.txt`).
2. **Start the simulation**. O OLED mostra "ECCS | TREINOS", as leituras e o estado; o Serial mostra uma linha a cada 2 s.
3. No Monitor Serial, digite a **Write API Key** do canal e Enter (ThingSpeak → canal → API Keys). A partir daí, a cada 20 s aparece "ThingSpeak: registro confirmado N".
4. Clique no DHT22 e arraste a temperatura acima de 30 °C ou a umidade acima de 70 %: o OLED muda para **ESTADO: ALERTA** e o campo 5 do canal vai para 1.
5. Veja os gráficos em https://thingspeak.mathworks.com/channels/3509600 (canal público, abre sem login).

## Referências

- Wokwi · ESP32 Wi-Fi e HTTP: https://docs.wokwi.com/guides/esp32-wifi
- ThingSpeak · Write Data (API): https://www.mathworks.com/help/thingspeak/writedata.html
- DHTesp (biblioteca do DHT22 para ESP32): https://github.com/beegee-tokyo/DHTesp
- ACSM. Exertional heat illness during training and competition. Med Sci Sports Exerc, 2007.
