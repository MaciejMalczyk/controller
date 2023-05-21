use crate::motor::Motor;

use std::{
	collections::HashMap,
	sync::{Arc},
};

use tokio::sync::Mutex;

pub type Motors = HashMap<u8, Arc<Mutex<Motor>>>;
