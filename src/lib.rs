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
}

#[wasm_bindgen]
pub fn greet(json_str: &str) {
    match serde_json::from_str::<Vec<Person>>(json_str) {
        Ok(persons) => {
            let greetings: Vec<String> = persons.iter()
                .map(|person| format!("Hello, {}!", person.name))
                .collect();
            alert(&greetings.join(" and "));
        },
        Err(_) => alert("Failed to parse JSON"),
    }
}
