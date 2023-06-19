extern crate gpiochip as gpio;
use crate::motor::Motor;

use std::{
	collections::HashMap,
	sync::{Arc},
};

use tokio::sync::Mutex;

#[derive(Clone)]
pub struct MotorInstance {
	pub handle: Arc<Mutex<Motor>>,
	pub speed: Arc<Mutex<f32>>,
	pub enabled: Arc<Mutex<bool>>,
	pub stop: Arc<Mutex<gpio::GpioHandle>>,
}

#[derive(Clone)]
pub struct PumpInstance {
	pub id: i8,
}

#[derive(Clone)]
pub struct LightsInstance {
	pub id: i8,
}

#[derive(Clone)]
pub struct Devices {
	pub motors: HashMap<u8, MotorInstance>,
	pub pumps: i8,
	pub lights: i8,
}
