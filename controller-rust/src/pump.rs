extern crate gpiochip as gpio;

use tokio::time::{sleep, Duration};
use tokio::sync::{ Mutex };
use std::sync::Arc;

pub struct Pump {
    switch: Arc<Mutex<bool>>,
    pin: Arc<Mutex<gpio::GpioHandle>>,
}

impl Pump {
    pub fn init(chip: &gpio::GpioChip, pin: u32) -> Pump {
        let p = Pump {
            switch: Arc::new(Mutex::new(true)),
            pin: Arc::new(Mutex::new(chip.request(format!("gpioL_{}",pin).as_str(), gpio::RequestFlags::OUTPUT,  pin, 0).unwrap())),
        };
        p
    }
    pub async fn pwm(&mut self, ton: u64, toff: u64) {
        *self.switch.lock().await = true;
        tokio::spawn({
            let sw_clone = Arc::clone(&self.switch);
            let on = ton;
            let off = toff;
            let pin_clone = Arc::clone(&self.pin);
            async move {
                while *sw_clone.lock().await {
                    pin_clone.lock().await.set(255).unwrap();
                    sleep(Duration::from_secs(on)).await;
                    pin_clone.lock().await.set(0).unwrap();
                    sleep(Duration::from_secs(off)).await;
                }
            }
        });
    }
    pub async fn stop(&mut self) {
        *self.switch.lock().await = false;
    }
}
