extern crate gpiochip as gpio;
mod motor;
use crate::motor::Motor;
mod ws_server;
mod devices;

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
	
	let gpiochip3 = gpio::GpioChip::new("/dev/gpiochip3").unwrap();
	
	let steppers = HashMap::from([
		(1,Arc::new(Mutex::new(Motor::init(&gpiochip3, 31, 1.0)))),
		(2,Arc::new(Mutex::new(Motor::init(&gpiochip3, 27, 1.0)))),
	]);
	
	let state = ws_server::PeerMap::new(Mutex::new(HashMap::new()));
	
	let ws_server_task = task::spawn({
		let state = state.clone();
		async move {
			let mut ws = ws_server::WsServer::init(state, steppers);
			ws.spawn().await;
		}
	});
	
	
	match ws_server_task.await {
		Err(e) => println!("{:?}", e),
		_ => ()
	}
	
}
