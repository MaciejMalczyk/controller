extern crate gpiochip as gpio;

// use tokio::{
//     time::{sleep, Duration},
// };
use std::{
    thread::sleep,
    time::Duration,
};

pub struct Motor {
    pub disable: bool,
    pin: gpio::GpioHandle,
    u_s: Duration,
    launch_interval: f32,
    interval: f32,
    sleep: Duration,
    freq: f32,
    second: f32,
    steps_per_rot: f32,
    
    
}

impl Motor {
    pub fn init(chip: &gpio::GpioChip, pin_num: u32, rot_per_s: f32) -> Motor {
        let mut m = Motor { 
            disable: false,
            pin: chip.request(format!("gpioM_{}",pin_num).as_str(), gpio::RequestFlags::OUTPUT,  pin_num, 0).unwrap(),
            u_s: Duration::from_micros(1),
            launch_interval: 0.0,
            interval: 0.0,
            sleep: Duration::from_micros(0),
            freq: 0.0,
            second: 1000000.0,
            steps_per_rot: 400.0,
        };
        m.set_speed(rot_per_s);
        m
    }
    
    pub fn set_speed(&mut self, rot_per_s: f32) {
        self.freq = self.steps_per_rot*rot_per_s; 
        self.launch_interval = (self.second/(self.steps_per_rot*rot_per_s))*5.0;
        self.interval = self.second/(self.steps_per_rot*rot_per_s);
    }
    
    async fn launch(&mut self) {
        self.pin.set(255).unwrap();
        sleep(self.sleep/2);
        self.pin.set(0).unwrap();
        sleep(self.sleep/2);
        if self.sleep*990/1000 > ((self.second/self.freq) as u32)*self.u_s {
            self.sleep = self.sleep*990/1000;
        } else {
            self.sleep = ((self.second/self.freq) as u32)*self.u_s;
        }
    }
    pub async fn step(&mut self) -> bool {
        if self.sleep == Duration::from_micros(0) {
            self.sleep = ((self.launch_interval) as u32)*self.u_s;
        }
        if self.disable == false {
            if self.sleep > (self.interval as u32)*self.u_s {
                self.launch().await;
                return false;
            } else {
                self.pin.set(255).unwrap();
                sleep(self.sleep/2);
                self.pin.set(0).unwrap();
                sleep(self.sleep/2);
                return false;
            }
        } else {
            self.stop().await;
            return true;
        }
        
    }
    async fn stop(&mut self) {
        while self.sleep <= (self.launch_interval as u32)*self.u_s {
            self.pin.set(255).unwrap();
            sleep(self.sleep/2);
            self.pin.set(0).unwrap();
            sleep(self.sleep/2);
            self.sleep = self.sleep*1001/1000;
        }
    }
    pub fn disable(&mut self) {
        self.disable = true;
    }
    
    pub fn enable(&mut self) {
        self.disable = false;
    }
} 
