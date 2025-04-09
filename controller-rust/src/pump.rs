extern crate gpiochip as gpio;

use tokio::time::{sleep, Duration};
use tokio::sync::Mutex;
use std::sync::Arc;

pub struct Pump {
    pin: Arc<Mutex<gpio::GpioHandle>>,
    enable: Arc<Mutex<bool>>,
    moisture: Arc<Mutex<f64>>,
    from_interface: Arc<Mutex<f64>>,
    from_cultivation: Arc<Mutex<bool>>,
}

impl Pump {
    pub fn new(chip: &gpio::GpioChip, pin: u32) -> Pump {
        Pump {
            pin: Arc::new(Mutex::new(chip.request(format!("gpioL_{}",pin).as_str(), gpio::RequestFlags::OUTPUT,  pin, 0).unwrap())),
            enable: Arc::new(Mutex::new(false)),
            moisture: Arc::new(Mutex::new(0.0)),
            from_interface: Arc::new(Mutex::new(0.0)),
            from_cultivation: Arc::new(Mutex::new(true)),
        }
    }
    
    pub async fn set_moisture(&mut self, moisture: f64) {
        *self.moisture.lock().await = moisture;
        *self.from_cultivation.lock().await = true;
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
        if !(*self.enable.lock().await) {
            *self.enable.lock().await = true;
            println!("PUMP ON");
            
            tokio::spawn({
                let enable_clone = Arc::clone(&self.enable);
                let pin_clone = Arc::clone(&self.pin);
                let fi_clone = Arc::clone(&self.from_interface);
                let moisture_clone = Arc::clone(&self.moisture);
                let fc_clone = Arc::clone(&self.from_cultivation);

                async move {
                    let watchdog = async {
                        loop {
                            if *enable_clone.lock().await {
                                *fc_clone.lock().await = false;
                                sleep(Duration::from_secs(150)).await;
                                if !(*fc_clone.lock().await) {
                                    println!("SENSOR FAILURE");
                                    *enable_clone.lock().await = false;
                                    break;
                                }
                            } else {
                                println!("PUMP OFF");
                                break;
                            }
                        }
                    };
                    
                    let process = async {
                        loop {
                            if !(*enable_clone.lock().await) {
                                println!("PUMP OFF");
                                break;
                            }
                            if *moisture_clone.lock().await >= 0.0 && *fi_clone.lock().await > *moisture_clone.lock().await {
                                pin_clone.lock().await.set(255).unwrap();
                                println!("PUMP PUSH");
                                sleep(Duration::from_secs(5)).await;
                                pin_clone.lock().await.set(0).unwrap();
                                println!("PUMP STOP");
                            }
                            sleep(Duration::from_secs(300)).await;
                        }
                        
                    };
                    
                    tokio::join!(
                        process,
                        watchdog,
                    );
                    
                }
            });
        } else {
            println!("PUMP ALREADY IN USE");
            return;
        }
    }

    pub async fn unattended_start(&mut self) {
        if !(*self.enable.lock().await) {
            *self.enable.lock().await = true;
            println!("PUMP ON !UNATTENDED!");

            tokio::spawn({
                let enable_clone = Arc::clone(&self.enable);
                let pin_clone = Arc::clone(&self.pin);
                async move {
                    loop {
                        if !(*enable_clone.lock().await) {
                            pin_clone.lock().await.set(0).unwrap();
                            println!("PUMP OFF");
                            break;
                        } else {
                            pin_clone.lock().await.set(255).unwrap();
                            println!("PUMP PUSH !UNATTENDED!");
                        }
                        println!("!PUMP IN UNATTENDED MODE. REMEMBER TO DISABLE!");
                        sleep(Duration::from_millis(500)).await;
                    }
                }
            });

        } else {
            println!("PUMP ALREADY IN USE");
            return;
        }
    }
    
    pub async fn stop(&mut self) {
        if *self.enable.lock().await {
            *self.enable.lock().await = false;
        }
    }
}
