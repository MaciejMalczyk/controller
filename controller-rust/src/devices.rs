use crate::motor::Motor;

use std::{
	collections::HashMap,
	sync::{Arc},
};

use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Devices {
	pub motors: HashMap<u8, Arc<Mutex<Motor>>>,
	pub stops: HashMap<u8, Arc<Mutex<bool>>>,
}
