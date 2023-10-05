//FIXME WORK IN PROGRESS

extern crate gpiochip as gpio;

use tokio::sync::{ Mutex };
use std::sync::Arc;

use rppal::pwm::{Channel, Polarity, Pwm};

pub struct Light {
    pub switch: Arc<Mutex<bool>>,
    pwm: Pwm,
    pub duty: u64,
}

impl Light {
    pub fn init(freq: u64) -> Light {
        let l = Light {
            switch: Arc::new(Mutex::new(false)),
            pwm: Pwm::with_frequency(Channel::Pwm0, freq as f64, 0.0, Polarity::Normal, false).unwrap(),
            duty: 0,
        };
        l
    }
    pub async fn pwm(&mut self, duty: u64) {
        self.pwm.set_duty_cycle((duty/100) as f64).unwrap();
        self.pwm.enable().unwrap();
        thread::sleep(Duration::from_secs(10));
        println!("Enabled");
    }
    pub async fn stop(&mut self) {
        self.pwm.disable().unwrap();
        println!("Disabled");
    }
}
