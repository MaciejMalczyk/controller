use std::fs;

pub fn read() -> serde_json::Value {
    let file = fs::File::open("config.json").unwrap();
    serde_json::from_reader(file).unwrap()
}
