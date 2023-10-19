use tokio::sync::{ Mutex };
use std::sync::Arc;

use rppal::pwm::{Channel, Polarity, Pwm};

pub struct Light {
    status: Arc<Mutex<bool>>,
    pwm: Arc<Mutex<Pwm>>,
    duty: Arc<Mutex<f64>>,
}

impl Light {
    pub fn init(freq: f64) -> Light {
        let l = Light {
            status: Arc::new(Mutex::new(false)),
            pwm: Arc::new(Mutex::new(Pwm::with_frequency(Channel::Pwm0, freq, 0.0, Polarity::Normal, false).unwrap())),
            duty: Arc::new(Mutex::new(0.0)),
        };
        l
    }
    
    pub async fn get_duty(&mut self) -> f64 {
        *self.duty.lock().await
    }
    
    pub async fn get_status(&mut self) -> bool {
        *self.status.lock().await
    }
    
    pub async fn pwm(&mut self, duty: f64) {
        *self.duty.lock().await = duty;
        tokio::spawn({
            let pwm_clone = Arc::clone(&self.pwm);
            let duty_clone = Arc::clone(&self.duty);
            let status_clone = Arc::clone(&self.status);
            async move {
                pwm_clone.lock().await.set_duty_cycle(*duty_clone.lock().await/100.0).unwrap();
                //println!("{}", *duty_clone.lock().await/100.0);
                pwm_clone.lock().await.enable().unwrap();
                *status_clone.lock().await = true;
            }
        });
    }
    pub async fn stop(&mut self) {
        tokio::spawn({
            let pwm_clone = Arc::clone(&self.pwm);
            let status_clone = Arc::clone(&self.status);
            async move {
                pwm_clone.lock().await.disable().unwrap();
                *status_clone.lock().await = false;
            }
        });
    }
}
