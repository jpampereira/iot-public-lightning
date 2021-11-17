#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClient.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <Arduino.h>

const int LIGHT_ID = 1; 

// === Wi-Fi Credentials ===========================================================================================

const char* SSID          = "TGC-UFABC";
const char* WIFI_PASSWORD = "TGC-21026515";
WiFiServer server(1883); 
WiFiClient espClient;

// === MQTT Broker Credentials =====================================================================================

const char* MQTT_BROKER_HOST = "mqtt.eclipseprojects.io";
const int   MQTT_BROKER_PORT = 1883;
const char* MQTT_BROKER_ID   = "Tcc_setor02";
const char* SUBSCRIBE_TOPIC  = "MQTTtcciluminacaoEnvia_02";
const char* PUBLISH_TOPIC    = "MQTTtcciluminacaoRecebe_02";
PubSubClient MQTT(espClient);

// === NodeMCU Pins ================================================================================================

const int ANALOGIC_INPUT = A0; // ESP8266 Analog Pin ADC0 = A0
const int TENSAO         = D6; // Pino 13 do HCF4066
const int CORRENTE       = D2; // Pino 5 do HCF4066
const int LUMINOSIDADE   = D5; // Pino 5 do HCF4066
const int PROBE          = D0;
const int RELE           = D7;

//=== Other Variables/Constants ====================================================================================

const int  SAMPLES    = 200;
      char rele_state = '0';

// === Subroutines =================================================================================================

/* Realiza a conexao com a rede Wi-Fi que sera utilizada para o envio 
 * dos dados obtidos no monitoramento do refletor ao Broker MQTT.
 */
void connect_to_wifi() {
  Serial.printf("Conectando-se a rede %s.\n", SSID);
  
  WiFi.begin(SSID, WIFI_PASSWORD);
  
  Serial.print("Aguarde...");
  
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  
  Serial.println("\nConectado com sucesso!");
}

/* Essa funcao eh executada toda vez que uma nova informacao chega do
 * topico ao qual o dispositivo esta inscrito que envia comandos para
 * serem executados no refletor.
 */
void mqtt_broker_callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  digitalWrite(D1, !digitalRead(D1));
  
  for (int i = 0; i < length; i++) {
    char c = (char) payload[i];
    msg += c;
  }
  
  if (msg.equals("L")) {
    digitalWrite(RELE, HIGH);
    rele_state = '1';
  } else if (msg.equals("D")) {
    digitalWrite(RELE, LOW);
    rele_state = '0';
  }
}

/* Configura o Servidor Broker MQTT para o qual serao enviados os dados 
 * obtidos no monitoramento do refletor.
 */
void set_mqtt_broker_server() {
  Serial.printf("Configurando o Servidor Broker MQTT %s na porta %d.\n", MQTT_BROKER_HOST, MQTT_BROKER_PORT);
  
  MQTT.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
  MQTT.setCallback(mqtt_broker_callback);
}

/* Realiza a conexao com o Broker MQTT. Apos conectar, eh realizado o
 * subscribe no topico que envia os comandos que devem ser executados
 * no refletor.
 */
void connect_to_mqtt_broker() {
  Serial.printf("Conectando-se ao Broker MQTT %s.\n", MQTT_BROKER_ID);
  
  Serial.print("Aguarde...");
  
    while (!MQTT.connected()) {
    if (MQTT.connect(MQTT_BROKER_ID)) {
      Serial.printf("\nConectado com sucesso ao Broker MQTT %s!", MQTT_BROKER_ID);
      MQTT.subscribe(SUBSCRIBE_TOPIC);
      Serial.printf("Inscrito no tópico %s.\n", SUBSCRIBE_TOPIC);
    } else {
      Serial.print(".");
      delay(100);
    }
  }
}

/* Verifica a conectividade com a rede Wi-Fi e com o Broker MQTT. Caso uma 
 * das duas apresente falha, eh realizado o restabelecimento da conexao.
 */
void check_connections() {
  if (!MQTT.connected()) {
    connect_to_mqtt_broker();
  }
  
  if (WiFi.status() != WL_CONNECTED) {
    connect_to_wifi();
  }
}

/* Extrai informacoes do sensor selecionado */
void get_data(int* data) {
  for (int i = 0; i < SAMPLES; i++) {
    data[i] = analogRead(ANALOGIC_INPUT);
  }
}

void convert_to_signed(int* data) {
  for (int i = 0; i < SAMPLES; i++) {
    if (data[i] >= 512) { 
      data[i] = data[i] - 512;
    } else { 
      data[i] = data[i] | 0XFFFFFE00;
    } // Valor para transformar em signed (+511 @ 0 @ -512, 1023 @ 512 @ 0)                                  
  }
}

/* Extrai e calcula a tensao media atual do refletor */
float get_tensao() {
  digitalWrite(LUMINOSIDADE, HIGH);
  digitalWrite(CORRENTE, HIGH);
  digitalWrite(TENSAO, LOW);

  int* data = (int*) malloc(SAMPLES * sizeof(int));

  digitalWrite(PROBE, HIGH);
  get_data(data);
  digitalWrite(PROBE, LOW);
  
  convert_to_signed(data);

  float sum = 0;
  for (int i = 0; i < SAMPLES; i++) {
    sum += data[i] * data[i];
  }

  float avg = sqrt(sum / SAMPLES) * 1.63;

  free(data);
  
  return avg;
}

/* Extrai e calcula a corrente media atual do refletor */
float get_corrente() {
  digitalWrite(LUMINOSIDADE, HIGH);
  digitalWrite(TENSAO, HIGH);
  digitalWrite(CORRENTE, LOW);
 
  float avg = 0;
 
  for (int i = 0; i < 5; i++) {
    int* data = (int*) malloc(SAMPLES * sizeof(int));

    digitalWrite(PROBE, HIGH);
    get_data(data);
    digitalWrite(PROBE, LOW);
    
    convert_to_signed(data);
    
    float sum = 0;
    for (int j = 0; j < SAMPLES; j++) {
      sum += data[j] * data[j];
    }
    
    sum = (sqrt(sum / SAMPLES) * 3.3 * 1.50) / 1023;   // O valor de 1.50 estava com 1.60, devido a razão da divisão do trimpot multivoltas. Achar a razão para os demais nodemcu's.
    avg += sum / 0.066;

    free(data);
  }
  
  avg /= 5;
  
  return avg;
}

/* Extrai e calcula a luminosidade media atual do refletor */
float get_luminosidade() {
  digitalWrite(TENSAO, HIGH);
  digitalWrite(CORRENTE, HIGH);
  digitalWrite(LUMINOSIDADE, LOW);

  int* data = (int*) malloc(SAMPLES * sizeof(int));
  
  get_data(data);

  float sum = 0;
  for (int i = 0; i < SAMPLES; i++) {
    sum += data[i];
  }
  
  float avg = sum / SAMPLES;

  free(data);
  
  return avg;
}

/* Envia ao Broker MQTT o estado atual do refletor. */
void send_to_mqtt_broker(float tensao, float corrente, float luminosidade) {
  char id_JSON[10] = "";
  char tensao_JSON[20] = "";
  char corrente_JSON[20] = "";
  char luminosidade_JSON[30] = "";
  char rele_state_JSON[20] = "";
  
  sprintf(id_JSON,           "\"id\": %d,",             LIGHT_ID);
  sprintf(tensao_JSON,       "\"tensao\": %0.f,",       tensao);
  sprintf(corrente_JSON,     "\"corrente\": %.1f,",     corrente);
  sprintf(luminosidade_JSON, "\"luminosidade\": %0.f,", luminosidade);
  sprintf(rele_state_JSON,   "\"rele_state\": \"%c\"",  rele_state);

  char json[200] = "";

  strcat(json, "{");
  strcat(json, id_JSON);
  strcat(json, tensao_JSON);
  strcat(json, corrente_JSON);
  strcat(json, luminosidade_JSON);
  strcat(json, rele_state_JSON);
  strcat(json, "}");
  
  MQTT.publish(PUBLISH_TOPIC, json);
}

// === Main ========================================================================================================

void setup() {
  Serial.begin(115200);
  
  pinMode(PROBE, OUTPUT);
  pinMode(TENSAO, OUTPUT);
  pinMode(CORRENTE, OUTPUT); 
  pinMode(LUMINOSIDADE, OUTPUT);
  pinMode(RELE, OUTPUT);
  pinMode(D1, OUTPUT);
  
  digitalWrite(RELE, LOW);
  digitalWrite(TENSAO, HIGH);
  digitalWrite(CORRENTE, HIGH);
  digitalWrite(LUMINOSIDADE, HIGH);
  
  connect_to_wifi();
  set_mqtt_broker_server();
}

void loop() {
  float tensao       = get_tensao();
  float corrente     = get_corrente();
  float luminosidade = get_luminosidade();

  check_connections();

  send_to_mqtt_broker(tensao, corrente, luminosidade);

  MQTT.loop(); // keep-alive da comunicacao com broker MQTT
  
  delay(500);
}
