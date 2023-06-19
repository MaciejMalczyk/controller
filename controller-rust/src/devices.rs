extern crate gpiochip as gpio;
use crate::motor::Motor;

use std::{
	collections::HashMap,
	sync::{Arc},
};

use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Devices {
	pub motors: HashMap<u8, Arc<Mutex<Motor>>>,
	pub stops: HashMap<u8, Arc<Mutex<gpio::GpioHandle>>>,
	pub speed: HashMap<u8, Arc<Mutex<f64>>>,
	pub status: HashMap<u8, Arc<Mutex<bool>>>,
	pub pumps: i8,
	pub lights: i8,
}
