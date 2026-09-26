// ECCS - Edge Computing aplicado ao ambiente de treinos
// Pelé Academia · Grupo Zenyth · Sprint 3
// Simulação: https://wokwi.com/projects/476175482957977601
// Canal: https://thingspeak.mathworks.com/channels/3509600
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <DHTesp.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

DHTesp dht;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
const int N = 5;
const float LIM_T = 30.0, LIM_U = 70.0; // limites didaticos
float ts[N] = {}, us[N] = {};
int pos = 0, quantidade = 0;
float temperatura, umidade, mediaT, mediaU;
bool alerta = false, valido = false;
String chave = ""; // digite a Write API Key no monitor serial, nunca publique aqui
String entrada;
String nuvem = "SEM CHAVE";
unsigned long ultimaLeitura = 0, ultimoEnvio = 0, ultimoWifi = 0;
QueueHandle_t fila;
struct Medicao { float t, u, mt, mu; int alerta; };

// A rede roda em outra tarefa para nao interromper as leituras locais.
void enviarNuvem(void*) {
  Medicao m;
  for (;;) {
    if (xQueueReceive(fila, &m, portMAX_DELAY) == pdTRUE) {
      if (WiFi.status() != WL_CONNECTED) continue;
      HTTPClient http;
      http.setConnectTimeout(3000);
      http.setTimeout(3000);
      http.begin("http://api.thingspeak.com/update");
      http.addHeader("Content-Type", "application/x-www-form-urlencoded");
      String corpo = "api_key=" + chave + "&field1=" + String(m.t, 1)
        + "&field2=" + String(m.u, 1) + "&field3=" + String(m.mt, 1)
        + "&field4=" + String(m.mu, 1) + "&field5=" + String(m.alerta);
      int status = http.POST(corpo);
      String resposta = status > 0 ? http.getString() : "";
      if (status == 200 && resposta.toInt() > 0)
        Serial.println("ThingSpeak: registro confirmado " + resposta);
      else Serial.println("ThingSpeak: falha HTTP " + String(status) + " (verifique chave/intervalo)");
      http.end();
    }
  }
}

void tela() {
  oled.clearDisplay(); oled.setCursor(0, 0);
  oled.println("ECCS | TREINOS");
  if (valido) {
    oled.printf("Atual: %.1fC %.1f%%\n", temperatura, umidade);
    oled.printf("Media: %.1fC %.1f%%\n", mediaT, mediaU);
    oled.printf("Janela: %d/%d\n", quantidade, N);
    oled.println(alerta ? "ESTADO: ALERTA" : "ESTADO: NORMAL");
  } else {
    oled.println("SENSOR: SEM DADOS");
    oled.println("Verifique o DHT22");
    oled.println(); oled.println();
  }
  oled.println(WiFi.status() == WL_CONNECTED ? "WiFi: CONECTADO" : "WiFi: OFFLINE");
  oled.println(chave.length() ? "TS: ver serial" : "TS: SEM CHAVE");
  oled.display();
}

void setup() {
  Serial.begin(115200);
  dht.setup(15, DHTesp::DHT22);
  Wire.begin(21, 22);
  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Falha no OLED"); while (true) delay(1000);
  }
  oled.setTextSize(1); oled.setTextColor(SSD1306_WHITE);
  WiFi.begin("Wokwi-GUEST", "", 6);
  fila = xQueueCreate(1, sizeof(Medicao));
  xTaskCreate(enviarNuvem, "ThingSpeak", 8192, nullptr, 1, nullptr);
  Serial.println("ECCS iniciado. Limites demonstrativos: T > 30C ou U > 70%.");
  Serial.println("Para enviar, digite a Write API Key do seu canal e Enter (nao sera exibida).");
  tela();
}

void loop() {
  // Aceita uma chave por execucao, mantendo-a apenas em RAM.
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      entrada.trim();
      if (entrada.length() && !chave.length()) {
        chave = entrada; Serial.println("Chave recebida em RAM.");
      }
      entrada = "";
    } else if (entrada.length() < 64) entrada += c;
  }
  unsigned long agora = millis();
  if (WiFi.status() != WL_CONNECTED && agora - ultimoWifi >= 10000) {
    ultimoWifi = agora; WiFi.reconnect();
  }
  if (agora - ultimaLeitura >= 2000) {
    ultimaLeitura = agora;
    TempAndHumidity v = dht.getTempAndHumidity();
    valido = !isnan(v.temperature) && !isnan(v.humidity);
    if (valido) {
      temperatura = v.temperature; umidade = v.humidity;
      ts[pos] = temperatura; us[pos] = umidade;
      pos = (pos + 1) % N; if (quantidade < N) quantidade++;
      mediaT = mediaU = 0;
      for (int i = 0; i < quantidade; i++) { mediaT += ts[i]; mediaU += us[i]; }
      mediaT /= quantidade; mediaU /= quantidade;
      // Alerta imediato ou persistente pela media: tudo decidido no ESP32.
      alerta = temperatura > LIM_T || umidade > LIM_U || mediaT > LIM_T || mediaU > LIM_U;
      Serial.printf("T=%.1fC U=%.1f%% | medias(%d)=%.1fC %.1f%% | %s\n",
        temperatura, umidade, quantidade, mediaT, mediaU, alerta ? "ALERTA" : "NORMAL");
    } else Serial.println("Falha no sensor: leitura descartada, envio suspenso.");
    tela();
  }
  if (agora - ultimoEnvio >= 20000) {
    ultimoEnvio = agora;
    if (valido && chave.length() && WiFi.status() == WL_CONNECTED) {
      Medicao m = {temperatura, umidade, mediaT, mediaU, alerta ? 1 : 0};
      xQueueOverwrite(fila, &m);
    }
  }
  delay(10);
}
