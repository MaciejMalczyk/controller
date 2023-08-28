use std::fs;
use serde_json;

pub fn read() -> serde_json::Value {
    let file = fs::File::open("src/config.json").unwrap();
    let json: serde_json::Value = serde_json::from_reader(file).unwrap();
    return json;
}
