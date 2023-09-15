mod motor;
mod light;
mod pump;
mod ws_server;
mod devices;
mod config;

extern crate gpiochip as gpio;
use crate::motor::Motor;
use crate::light::Light;
use crate::pump::Pump;


use std::{
	collections::HashMap,
	sync::Arc,
};

use tokio::{
	task, 
	sync::Mutex,
};

//max freq when pulse/rev = 400 => 1000


#[tokio::main]
async fn main() {
	
	let gpiochip0 = gpio::GpioChip::new("/dev/gpiochip0").unwrap();
	
	let dev = devices::Devices {
		motors: HashMap::from([
			(0, devices::MotorInstance {
				handle: Arc::new(Mutex::new(Motor::init(&gpiochip0, 13, 0.0))),
				speed: Arc::new(Mutex::new(0.0)),
				stop: Arc::new(Mutex::new(gpiochip0.request("gpioS_0", gpio::RequestFlags::OUTPUT, 26, 1).unwrap())),
			}),
			(1, devices::MotorInstance {
				handle: Arc::new(Mutex::new(Motor::init(&gpiochip0, 16, 0.0))),
				speed: Arc::new(Mutex::new(0.0)),
				stop: Arc::new(Mutex::new(gpiochip0.request("gpioS_1", gpio::RequestFlags::OUTPUT, 21, 1).unwrap())),
			}),
		]),
		pumps: HashMap::from([
			(0, devices::PumpInstance {
				handle: Arc::new(Mutex::new(Pump::init(&gpiochip0, 15))),
			}),
		]),
		lights: HashMap::from([
			(0, devices::LightInstance {
				handle: Arc::new(Mutex::new(Light::init(&gpiochip0, 3, 10000))),
			}),
		]),
	};
	
	
	let state = ws_server::PeerMap::new(Mutex::new(HashMap::new()));
	
	let ws_server_task = task::spawn({
		let state = state.clone();
		async move {
			let mut ws = ws_server::WsServer::init(state, dev);
			ws.spawn().await;
		}
	});
	
	
	match ws_server_task.await {
		Err(e) => println!("{:?}", e),
		_ => ()
	}
	
}
