use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Result;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[derive(Serialize, Deserialize)]
struct Person {
    name: String,
    age: u32,
    address: String,
}

#[wasm_bindgen]
pub fn greet() {
    let json_str = include_str!("../data.json");
    match serde_json::from_str::<Vec<Person>>(json_str) {
        Ok(persons) => {
            let greetings: Vec<String> = persons.iter()
                .map(|person| format!("Hello, {} from {}!", person.name, person.address))
                .collect();
            alert(&greetings.join(" and "));
        },
        Err(_) => alert("Failed to parse JSON"),
    }
}
