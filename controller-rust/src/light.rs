extern crate gpiochip as gpio;

use std::{
    thread::sleep,
    time::Duration,
};

pub struct Light {
    pub disable: bool,
    pin: gpio::GpioHandle,
    freq: u64,
    duty: u64,
    
    
}

impl Light {
    pub fn init(chip: &gpio::GpioChip, pin_num: u32, freq: u64, duty: u64) -> Light {
        let mut l = Light { 
            disable: false,
            pin: chip.request(format!("gpioM_{}",pin_num).as_str(), gpio::RequestFlags::OUTPUT,  pin_num, 0).unwrap(),
            freq: freq,
            duty: duty,
            
        };
        l
    }
    
    pub async fn step(&mut self) -> bool {
        
        if self.disable == false {
                println!("A");
                sleep(Duration::from_millis((1000*self.duty)/self.freq));
                println!("B");
                sleep(Duration::from_millis(1000 - (1000*self.duty)/self.freq));
                return false;
        } else {
            return true;
        }
        
    }
    
    pub fn disable(&mut self) {
        self.disable = true;
        println!("Disabling");
    }
    
    pub fn enable(&mut self) {
        self.disable = false;
    }
} 
