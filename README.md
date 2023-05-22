# Clinostate controller 
2 rot axis clinostate controller written in Rust and React.

Compatible with any stepper motor and driver that utilizes "step pin" as trigger to step a motor. Compatible with any SBC that uses newer linux kernel with libgpio driver enabled.

## Requirements

### Software
Rust and cargo: https://www.rust-lang.org/tools/install

Node.js: https://nodejs.org/en

### Hardware
Any SBC with libgpio kernel driver enabled. Any 2 stepper motors with any 2 stepper drivers that utilizes "step pin" for motor stepping.

## Build 
Go into controller-rust and run `cargo build` to build backend
Go into controller-react-frontend and run `npm install` to install frontend packages

Go into controller-node-tests and run `npm install` to install tests

## Start 
Run `cargo run` in controller-rust dir and `npm start` in controller-react-frontend dir

## Test
Go into controller-node-test and run `node frontend-listener.js` to see what frontend sends with websocket. Run `node rust_backend_test.js` to send test messages to rust backend.
