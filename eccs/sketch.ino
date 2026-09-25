/*
 * Pelé Academia · Monitor de condições do CT
 * ECCS · Sprint 3 · Grupo Zenyth (Guilherme de Paula, João Vitor Barbosa Silva, Lucas Rodrigues)
 *
 * Hardware (Wokwi): ESP32 DevKit C + DHT22 (temperatura/umidade) + OLED SSD1306 128x64 (I2C) + LED de alerta.
 *
 * O que roda LOCALMENTE no ESP32 (borda):
 *   1. Aquisição periódica do DHT22 (a cada 2 s).
 *   2. Média móvel das últimas 10 leituras (filtra ruído do sensor).
 *   3. Índice de calor (sensação térmica) e classificação em 4 níveis com limiares de alerta.
 *   4. IHM: OLED mostra leituras, médias, nível e estado da nuvem; LED acende no alerta.
 * O que vai para a NUVEM (ThingSpeak, a cada 20 s):
 *   temperatura, umidade, médias, índice de calor e nível → gráficos históricos do canal público.
 */
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHT.h"

// ---------------- configuração ----------------
const char* WIFI_SSID  = "Wokwi-GUEST";               // rede simulada do Wokwi (sem senha)
const char* WIFI_SENHA = "";
const char* THINGSPEAK_KEY = "COLE_AQUI_SUA_WRITE_API_KEY";  // ThingSpeak > canal > API Keys > Write API Key

const unsigned long INTERVALO_LEITURA_MS = 2000;   // lê o sensor a cada 2 s
const unsigned long INTERVALO_ENVIO_MS   = 20000;  // envia à nuvem a cada 20 s (plano grátis aceita 1 envio a cada 15 s)
const int JANELA = 10;                              // média móvel das últimas 10 leituras (= 20 s)

#define PINO_DHT        4
#define TIPO_DHT        DHT22
#define PINO_LED_ALERTA 15
#define LARGURA_OLED    128
#define ALTURA_OLED     64

// Limiares do índice de calor (°C) para treino ao ar livre.
// Referência: escalas de risco térmico usadas em diretrizes de exercício no calor (ACSM/CBF).
const float LIMIAR_ATENCAO   = 27.0;  // hidratação a cada 15 min
const float LIMIAR_ALERTA    = 32.0;  // reduzir intensidade e duração
const float LIMIAR_SUSPENDER = 40.0;  // suspender treino

// ---------------- objetos ----------------
DHT dht(PINO_DHT, TIPO_DHT);
Adafruit_SSD1306 oled(LARGURA_OLED, ALTURA_OLED, &Wire, -1);

// ---------------- estado ----------------
float bufTemp[JANELA];
float bufUmid[JANELA];
int   indice = 0;
int   preenchidos = 0;

float temperatura = NAN, umidade = NAN;
float mediaTemp = NAN, mediaUmid = NAN, indiceCalor = NAN;
int   nivel = 0;                 // 0 OK · 1 ATENÇÃO · 2 ALERTA · 3 SUSPENDER
int   ultimoCodigoHttp = 0;
unsigned long ultimaLeitura = 0, ultimoEnvio = 0;
unsigned long enviosOk = 0;

const char* NOMES_NIVEL[] = {"OK", "ATENCAO", "ALERTA", "SUSPENDER"};
const char* ACOES_NIVEL[] = {"Treino normal", "Agua a cada 15min", "Reduzir intensidade", "Suspender treino"};

// ---------------- processamento local ----------------
void registrarLeitura(float t, float h) {
  bufTemp[indice] = t;
  bufUmid[indice] = h;
  indice = (indice + 1) % JANELA;
  if (preenchidos < JANELA) preenchidos++;
}

float mediaDe(const float* buf) {
  float soma = 0;
  for (int i = 0; i < preenchidos; i++) soma += buf[i];
  return preenchidos ? soma / preenchidos : NAN;
}

int classificar(float ic) {
  if (ic >= LIMIAR_SUSPENDER) return 3;
  if (ic >= LIMIAR_ALERTA)    return 2;
  if (ic >= LIMIAR_ATENCAO)   return 1;
  return 0;
}

void processar() {
  mediaTemp = mediaDe(bufTemp);
  mediaUmid = mediaDe(bufUmid);
  // índice de calor calculado sobre as médias (mais estável que a leitura instantânea)
  indiceCalor = dht.computeHeatIndex(mediaTemp, mediaUmid, false);
  nivel = classificar(indiceCalor);
}

// ---------------- IHM ----------------
void atualizarLed() {
  if (nivel >= 3) {
    digitalWrite(PINO_LED_ALERTA, (millis() / 250) % 2);   // pisca rápido: suspender
  } else {
    digitalWrite(PINO_LED_ALERTA, nivel >= 2 ? HIGH : LOW);
  }
}

void desenharTela() {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);

  oled.setCursor(0, 0);
  oled.print("PELE ACADEMIA  CT");
  oled.setCursor(104, 0);
  oled.print(WiFi.status() == WL_CONNECTED ? "WiFi" : "----");
  oled.drawLine(0, 9, 127, 9, SSD1306_WHITE);

  oled.setCursor(0, 13);
  oled.printf("T %.1fC  UR %.0f%%", temperatura, umidade);
  oled.setCursor(0, 24);
  oled.printf("Med %.1fC  %.0f%%", mediaTemp, mediaUmid);
  oled.setCursor(0, 35);
  oled.printf("Ind.calor %.1fC", indiceCalor);

  // faixa do nível (invertida quando há alerta)
  if (nivel >= 2) {
    oled.fillRect(0, 46, 128, 18, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
  } else {
    oled.drawRect(0, 46, 128, 18, SSD1306_WHITE);
  }
  oled.setCursor(3, 48);
  oled.print(NOMES_NIVEL[nivel]);
  oled.setCursor(3, 56);
  oled.print(ACOES_NIVEL[nivel]);
  oled.setTextColor(SSD1306_WHITE);

  oled.setCursor(92, 48);
  oled.printf("up%lu", enviosOk);
  oled.display();
}

// ---------------- nuvem ----------------
void conectarWifi() {
  Serial.printf("Conectando ao Wi-Fi %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_SENHA, 6);   // canal 6 acelera a conexão no Wokwi
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.printf("\nConectado. IP: %s\n", WiFi.localIP().toString().c_str());
}

void enviarThingSpeak() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sem Wi-Fi: envio adiado.");
    return;
  }
  HTTPClient http;
  String url = "http://api.thingspeak.com/update?api_key=" + String(THINGSPEAK_KEY)
             + "&field1=" + String(temperatura, 1)
             + "&field2=" + String(umidade, 1)
             + "&field3=" + String(mediaTemp, 1)
             + "&field4=" + String(mediaUmid, 1)
             + "&field5=" + String(indiceCalor, 1)
             + "&field6=" + String(nivel)
             + "&status=" + String(NOMES_NIVEL[nivel]);
  http.begin(url);
  ultimoCodigoHttp = http.GET();
  String resposta = http.getString();   // ThingSpeak devolve o número da entrada (0 = recusado)
  http.end();
  if (ultimoCodigoHttp == 200 && resposta.toInt() > 0) {
    enviosOk++;
    Serial.printf("ThingSpeak OK · entrada %s\n", resposta.c_str());
  } else {
    Serial.printf("ThingSpeak falhou · HTTP %d · resposta %s\n", ultimoCodigoHttp, resposta.c_str());
  }
}

// ---------------- ciclo ----------------
void setup() {
  Serial.begin(115200);
  pinMode(PINO_LED_ALERTA, OUTPUT);
  dht.begin();
  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED nao encontrado");
  }
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(10, 20);
  oled.print("PELE");
  oled.setCursor(10, 40);
  oled.print("ACADEMIA");
  oled.display();
  conectarWifi();
  Serial.println("tempo_s,temp,umid,media_temp,media_umid,indice_calor,nivel");
}

void loop() {
  unsigned long agora = millis();

  if (agora - ultimaLeitura >= INTERVALO_LEITURA_MS) {
    ultimaLeitura = agora;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (isnan(t) || isnan(h)) {
      Serial.println("Falha ao ler o DHT22");
    } else {
      temperatura = t;
      umidade = h;
      registrarLeitura(t, h);
      processar();
      Serial.printf("%lu,%.1f,%.1f,%.1f,%.1f,%.1f,%d\n", agora / 1000, t, h, mediaTemp, mediaUmid, indiceCalor, nivel);
    }
    desenharTela();
  }

  if (preenchidos > 0 && agora - ultimoEnvio >= INTERVALO_ENVIO_MS) {
    ultimoEnvio = agora;
    enviarThingSpeak();
    desenharTela();
  }

  atualizarLed();
  delay(20);
}
