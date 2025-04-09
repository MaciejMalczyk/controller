use tokio::sync::Mutex;
use std::sync::Arc;

use rppal::pwm::{Channel, Polarity, Pwm};

pub struct Light {
    status: Arc<Mutex<bool>>,
    pwm: Arc<Mutex<Pwm>>,
    duty: Arc<Mutex<f64>>,
}

impl Light {
    pub fn new(freq: f64) -> Light {
        Light {
            status: Arc::new(Mutex::new(false)),
            pwm: Arc::new(Mutex::new(Pwm::with_frequency(Channel::Pwm0, freq, 0.0, Polarity::Normal, false).unwrap())),
            duty: Arc::new(Mutex::new(0.0)),
        }
    }
    
    pub async fn get_duty(&mut self) -> f64 {
        *self.duty.lock().await
    }
    
    pub async fn get_status(&mut self) -> bool {
        *self.status.lock().await
    }
    
    pub async fn pwm(&mut self, duty: f64) {
        *self.duty.lock().await = duty;
        if !(*self.status.lock().await) {
            tokio::spawn({
                let pwm_clone = Arc::clone(&self.pwm);
                let duty_clone = Arc::clone(&self.duty);
                let status_clone = Arc::clone(&self.status);
                async move {
                    pwm_clone.lock().await.set_duty_cycle(*duty_clone.lock().await/100.0).unwrap();
                    pwm_clone.lock().await.enable().unwrap();
                    *status_clone.lock().await = true;
                }
            });
        } else { }
    }
    pub async fn stop(&mut self) {
        if *self.status.lock().await {
            tokio::spawn({
                let pwm_clone = Arc::clone(&self.pwm);
                let status_clone = Arc::clone(&self.status);
                async move {
                    pwm_clone.lock().await.disable().unwrap();
                    *status_clone.lock().await = false;
                }
            });
        } else { }
    }
}
