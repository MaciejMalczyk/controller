extern crate gpiochip as gpio;

use tokio::time::{sleep, Duration};
use tokio::sync::{ Mutex };
use std::sync::Arc;

pub struct Light {
    switch: Arc<Mutex<bool>>,
    pin: Arc<Mutex<gpio::GpioHandle>>,
    freq: u64,
    duty: u64,
}

impl Light {
    pub fn init(chip: &gpio::GpioChip, pin: u32, freq: u64, duty: u64) -> Light {
        let l = Light {
            switch: Arc::new(Mutex::new(true)),
            pin: Arc::new(Mutex::new(chip.request(format!("gpioL_{}",pin).as_str(), gpio::RequestFlags::OUTPUT,  pin, 0).unwrap())),
            freq: freq,
            duty: duty,
        };
        l
    }
    pub async fn pwm(&mut self) {
        *self.switch.lock().await = true;
        tokio::spawn({
            let sw_clone = Arc::clone(&self.switch);
            let l = 1000000/self.freq;
            let d = self.duty;
            let pin_clone = Arc::clone(&self.pin);
            async move {
                while *sw_clone.lock().await {
                    match pin_clone.lock().await.set(255) {
                        Ok(()) => { println!("ok 255"); },
                        Err(e) => { println!("{:?}", e); },
                    }
                    sleep(Duration::from_micros((d*l)/100)).await;
                    match pin_clone.lock().await.set(0) {
                        Ok(()) => { println!("ok 0"); },
                        Err(e) => { println!("{:?}", e); },
                    }
                    sleep(Duration::from_micros(l - (d*l)/100)).await;
                }
            }
        });
    }
    pub async fn stop(&mut self) {
        *self.switch.lock().await = false;
    }
}
