#include <AccelStepper.h>
#include <ArduinoJson.h>

StaticJsonDocument<50> doc;


//Pin and variable definitions
String motor[2] = {"0","1"};

//AccelStepper(DRIVER, stepPin, dirPin)
//Speed = step/s; move = step


AccelStepper stepper_matrix[3] = {AccelStepper(1, 12, 11), AccelStepper(1, 10, 9)};

//Motor move funtion definition
void motorMove() {
  if (Serial.available() > 0) {
    String line = Serial.readStringUntil('\r');
    DeserializationError error = deserializeJson(doc, line);
    //if json object is malformed print error
    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
    }
  }
  for(int i=0; i<2; i++) {
    if (int(doc[motor[i]]) != stepper_matrix[i].speed()) {
      stepper_matrix[i].setSpeed(int(doc[motor[i]]));
    }
    stepper_matrix[i].runSpeed();
  }
  //String motors_position = "{ 0: "+String(stepper_matrix[0].speed(), DEC)+", 1: "+String(stepper_matrix[1].speed(), DEC)+"}";
  //Serial.println(motors_position);
}

void setup() {
   
   for(int i=0; i<2; i++) {
    stepper_matrix[i].setAcceleration(100);
    stepper_matrix[i].setMaxSpeed(1200);
    stepper_matrix[i].setSpeed(0);
  }
  //Serial setup. serial timeout set to minimum to avoid problems in movement
  Serial.begin(2000000);
  Serial.setTimeout(1);
}


void loop() {
  motorMove();
}
