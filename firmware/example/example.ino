// make sure to select the ESP32C3 Dev Module board
#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>

#include <HTTPClient.h>

#define USE_SERIAL Serial

WiFiMulti wifiMulti;

void setup() {
  
    // set the baud rate
    USE_SERIAL.begin(115200);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    for(uint8_t t = 4; t > 0; t--) {
        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }

    wifiMulti.addAP("Dylan-iPhone", "Goanteaters!");

}

void loop() {
    // wait for WiFi connection
    if((wifiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;

        USE_SERIAL.print("[HTTP] begin...\n");

        // make the GET request first
        // configure traged server and url
        http.begin("https://ieee-icssc-iot-workshop.vercel.app/api/data"); //HTTP

        USE_SERIAL.print("[HTTP] GET...\n");
        // start connection and send HTTP header
        int httpCode = http.GET();
        

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                String payload = http.getString();
                USE_SERIAL.println(payload);
            }
        } else {
            USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        http.end();

        // add a 5 second delay between requests to read output
        delay(5000);

        // now, make the POST request
        HTTPClient postHTTP;

        USE_SERIAL.print("[HTTP] POST begin...\n");
        // configure traged server and url
        postHTTP.begin("https://ieee-icssc-iot-workshop.vercel.app/api/data"); //HTTP

        // build the POST request body
        // required: author and message field, non-empty
        // if either is missing, the POST request will fail
        String body = "{\"author\": \"Dylan Vu \", \"message\": \"Hello World!\"}";

        int postCode = postHTTP.POST(body);
        if (postCode > 0) {
          // HTTP header has been send and Server response header has been handled
          USE_SERIAL.printf("[HTTP] POST... code: %d\n", postCode);

          // file found at server
          if(postCode == HTTP_CODE_OK) {
              String payload = postHTTP.getString();
              USE_SERIAL.println(payload);
          } 
          
        } else {
            USE_SERIAL.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        postHTTP.end();
    } else {
        // print a message about the WiFi connection
        USE_SERIAL.println("WiFi not connected!");
    }

    // request only once every 5 seconds to avoid data rates
    delay(5000);
}
