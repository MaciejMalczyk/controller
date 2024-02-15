extern crate gpiochip as gpio;

use tokio::time::{sleep, Duration};
use tokio::sync::{ Mutex };
use std::sync::Arc;

pub struct Pump {
    pin: Arc<Mutex<gpio::GpioHandle>>,
    enable: Arc<Mutex<bool>>,
    moisture: Arc<Mutex<f64>>,
    from_interface: Arc<Mutex<f64>>,
}

impl Pump {
    pub fn init(chip: &gpio::GpioChip, pin: u32) -> Pump {
        let p = Pump {
            pin: Arc::new(Mutex::new(chip.request(format!("gpioL_{}",pin).as_str(), gpio::RequestFlags::OUTPUT,  pin, 0).unwrap())),
            enable: Arc::new(Mutex::new(false)),
            moisture: Arc::new(Mutex::new(0.0)),
            from_interface: Arc::new(Mutex::new(0.0)),
        };
        p
    }
    
    pub async fn set_moisture(&mut self, moisture: f64) {
        *self.moisture.lock().await = moisture;
    }
    
    pub async fn set_from_interface(&mut self, val: f64) {
        *self.from_interface.lock().await = val;
    }
    
    pub async fn get_moisture(&mut self) -> f64 {
        *self.moisture.lock().await
    }
    
    pub async fn get_from_interface(&mut self) -> f64 {
        *self.from_interface.lock().await
    }
    
    pub async fn get_enable(&mut self) -> bool {
        *self.enable.lock().await
    }
    
    pub async fn start(&mut self) {
        *self.enable.lock().await = true;
        
        tokio::spawn({
            let pin_clone = Arc::clone(&self.pin);
            let fi = Arc::clone(&self.from_interface);
            let m = Arc::clone(&self.moisture);
            let enable_clone = Arc::clone(&self.enable);
            async move {
                let mut old_moisture = 0.0;
                loop {
                    if *enable_clone.lock().await == false {
                        println!("PUMP OFF");
                        break;
                    }
                    if old_moisture == *fi.lock().await {
                        println!("MOISTURE SENSOR ERROR");
                        break;
                    }
                    if *m.lock().await >= 0.0 && *fi.lock().await > *m.lock().await {
                        pin_clone.lock().await.set(255).unwrap();
                        println!("PUMP ON");
                        sleep(Duration::from_secs(2)).await;
                        old_moisture = *fi.lock().await;
                        pin_clone.lock().await.set(0).unwrap();
                    }
                    sleep(Duration::from_secs(120)).await;
                }
            }
        });
    }
    
    pub async fn stop(&mut self) {
       *self.enable.lock().await = false; 
    }
}
