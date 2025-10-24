extern crate gpiochip as gpio;

use std::{
    thread::sleep,
    time::Duration,
};

use tokio::sync::Mutex;
use std::sync::Arc;

pub struct Motor {
    enable: Arc<Mutex<bool>>,
    pin: Arc<Mutex<gpio::GpioHandle>>,
    stop: Arc<Mutex<gpio::GpioHandle>>,
    divider: Arc<Mutex<f64>>,
    slope: Arc<Mutex<f64>>,
    velocity: Arc<Mutex<f64>>,
    
    
}

impl Motor {
    pub fn new(chip: &gpio::GpioChip, step_pin: u32, stop_pin: u32) -> Motor {
        Motor { 
            enable: Arc::new(Mutex::new(false)),
            pin: Arc::new(Mutex::new(chip.request(format!("gpioM_{}",step_pin).as_str(), gpio::RequestFlags::OUTPUT,  step_pin, 0).unwrap())),
            stop: Arc::new(Mutex::new(chip.request(format!("gpioS_{}",stop_pin).as_str(), gpio::RequestFlags::OUTPUT,  stop_pin, 1).unwrap())),
            divider: Arc::new(Mutex::new(0.0)),
            slope: Arc::new(Mutex::new(0.0)),
            velocity: Arc::new(Mutex::new(0.0)),
        }
    }
    
    pub async fn set_velocity(&mut self, vel: f64) {
        //2400 = 2 [half of cycle] * 1200 [steps to full frame rot]
        //1200 = 400 [steps setuped on driver] * 3 [timing pulley multiplier]
        *self.velocity.lock().await = vel;
        *self.divider.lock().await = 2400.0*vel;
        *self.slope.lock().await = 2400.0*(vel/8.0);
    }
    
    pub async fn get_velocity(&mut self) -> f64 {
        *self.velocity.lock().await
    }
    
    pub async fn get_enable(&mut self) -> bool {
        *self.enable.lock().await
    }
    
    pub async fn start(&mut self) {
        if !(*self.enable.lock().await) {
            *self.enable.lock().await = true;
            tokio::spawn({
                let pin_clone = Arc::clone(&self.pin);
                let enable_clone = Arc::clone(&self.enable);
                let divider_clone = Arc::clone(&self.divider);
                let slope_clone = Arc::clone(&self.slope);
                let stop_clone = Arc::clone(&self.stop);
                async move {
                    //add slope for start and stop
                    let mut divider = *slope_clone.lock().await;
                    let mut interval = Duration::from_micros(1000000/(divider as u64));
                    stop_clone.lock().await.set(0).unwrap();
                    loop {
                        if *enable_clone.lock().await {
                            if *divider_clone.lock().await >= divider {
                                pin_clone.lock().await.set(255).unwrap();
                                sleep(interval);
                                pin_clone.lock().await.set(0).unwrap();
                                sleep(interval);
                                divider *= 1.01;
                                interval = Duration::from_micros(1000000/(divider as u64));
                            } else {
                                pin_clone.lock().await.set(255).unwrap();
                                sleep(interval);
                                pin_clone.lock().await.set(0).unwrap();
                                sleep(interval);
                            }
                        } else {
                            if divider >= *slope_clone.lock().await {
                                pin_clone.lock().await.set(255).unwrap();
                                sleep(interval);
                                pin_clone.lock().await.set(0).unwrap();
                                sleep(interval);
                                divider *= 0.99;
                                interval = Duration::from_micros(1000000/(divider as u64));
                            } else {
                                stop_clone.lock().await.set(1).unwrap();
                                break;
                            }
                        }
                    }
                }
            });
        } else { }
    }
    pub async fn stop(&mut self) {
        if *self.enable.lock().await {
            *self.enable.lock().await = false;
        } else { }
    }
} 
