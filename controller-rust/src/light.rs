extern crate gpiochip as gpio;

use tokio::time::{sleep, Duration};
use tokio::sync::{ Mutex };
use std::sync::Arc;

pub struct Light {
    switch: Arc<Mutex<bool>>,
    pin: Arc<Mutex<gpio::GpioHandle>>,
    freq: u64,
}

impl Light {
    pub fn init(chip: &gpio::GpioChip, pin: u32, freq: u64) -> Light {
        let l = Light {
            switch: Arc::new(Mutex::new(true)),
            pin: Arc::new(Mutex::new(chip.request(format!("gpioL_{}",pin).as_str(), gpio::RequestFlags::OUTPUT,  pin, 0).unwrap())),
            freq: freq,
        };
        l
    }
    pub async fn pwm(&mut self, duty: u64) {
        *self.switch.lock().await = true;
        tokio::spawn({
            let sw_clone = Arc::clone(&self.switch);
            let f = self.freq;
            let d = duty*100;
            let pin_clone = Arc::clone(&self.pin);
            async move {
                while *sw_clone.lock().await {
                    pin_clone.lock().await.set(255).unwrap();
                    sleep(Duration::from_micros(d)).await;
                    pin_clone.lock().await.set(0).unwrap();
                    sleep(Duration::from_micros(f - d)).await;
                }
            }
        });
    }
    pub async fn stop(&mut self) {
        *self.switch.lock().await = false;
    }
}
