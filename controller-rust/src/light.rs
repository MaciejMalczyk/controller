extern crate gpiochip as gpio;

use std::{
    thread::sleep,
    time::Duration,
};

pub struct Light {
    freq: u64,
    duty: u64,
    pin: gpio::GpioHandle,
    state: bool,
}

impl Light {
    pub fn init(chip: &gpio::GpioChip, pin_num: u32, freq: u64, duty: u64) -> Light {
        let mut l = Light {
            pin: chip.request(format!("gpioM_{}",pin_num).as_str(), gpio::RequestFlags::OUTPUT,  pin_num, 0).unwrap(),
            freq: freq,
            duty: duty,
            state: false,
        };
        l
    }
    pub fn enable(&mut self) {
        self.state = false
    }
    pub fn disable(&mut self) {
        self.state = true;
    }
    pub async fn pwm(&mut self) -> bool {
        if self.state == false {
            println!("A");
            sleep(Duration::from_millis(300));
            println!("b");
            sleep(Duration::from_millis(300));
            return false;
            
        } else {
            return true;
        }
    }
}
