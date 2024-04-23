// make sure to select the Lolin C3 Mini board
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println("Ready");
}

void loop() {
  // put your main code here, to run repeatedly:
  Serial.println("Hello");
  delay(1000);
}
