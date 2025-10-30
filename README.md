# Clinostate controller
2 rot axis clinostate controller written in Rust and React.

Compatible with any stepper motor and driver that utilizes "step pin" as a trigger to step a motor. Compatible with Raspberry Pi with PWM generator.

## Requirements

### Hostname
The hostname of the device is used as a database name in MongoDB. If you want to have multiple instances of clinostats, you will need to change the hostname of each device. In example deployment, with 3 clinostats, you can name them "clinostat-0", "clinostat-1", and "clinostat-2", and those will be your hostnames. Keep track of those names, because later this will be important when you set up cultivations.

### Software
Rust and cargo: https://www.rust-lang.org/tools/install

Node.js: https://nodejs.org/en

### Hardware
Raspberry Pi with built-in PWM generator (needs to be enabled with dtoverlay=pwm-2chan in /boot/config.txt).

Any 2 stepper motors with any 2 stepper drivers that utilize "step pin" for motor stepping. 

## Build 
Go into controller-rust and run `cargo build` to build the backend

Go into controller-react-frontend and run `npm install` to install frontend packages.

Go into controller-node-tests and run `npm install` to install tests.

## Start 

Run `cargo run` in controller-rust dir and `npm start` in controller-react-frontend dir.

## Test
Go into controller-node-test and run `node frontend-listener.js` to see what frontend sends with the websocket. Run `node rust_backend_test.js` to send test messages to the Rust backend.
To test pump unattended mode, use `unattended_watering.js`.
`automation.js` example shows how api of the backend can be used to pump water with a time interval and create a day and night cycle.

## Misc
Contains a systemd service file. It resets with a 5s timeout after backend failure.
Put it in `/etc/systemd/system` dir and then do `sudo systemctl enable controller.service` and `sudo systemctl start controller.service` to install, enable, and start.
