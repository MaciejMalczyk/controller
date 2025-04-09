extern crate gpiochip as gpio;
use crate::motor::Motor;
use crate::light::Light;
use crate::pump::Pump;

use std::{
	collections::HashMap,
	sync::Arc,
};

use tokio::sync::Mutex;

#[derive(Clone)]
pub struct MotorInstance {
	pub handle: Arc<Mutex<Motor>>,
}

#[derive(Clone)]
pub struct PumpInstance {
	pub handle: Arc<Mutex<Pump>>,
}

#[derive(Clone)]
pub struct LightInstance {
	pub handle: Arc<Mutex<Light>>,
}

#[derive(Clone)]
pub struct Devices {
	pub motors: HashMap<u8, MotorInstance>,
	pub pumps: HashMap<u8, PumpInstance>,
	pub lights: HashMap<u8, LightInstance>,
}
