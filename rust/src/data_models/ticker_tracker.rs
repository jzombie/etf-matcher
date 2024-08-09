use js_sys::Date;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use serde_json;
use std::collections::{HashMap, VecDeque};
use std::sync::Mutex;
use wasm_bindgen::JsValue;

use crate::types::TickerId;

pub static TICKER_TRACKER: Lazy<Mutex<TickerTracker>> = Lazy::new(|| {
    web_sys::console::log_1(&JsValue::from("Initializing TickerTracker in Lazy."));
    Mutex::new(TickerTracker::new())
});

#[derive(Serialize, Deserialize)]
pub struct TickerTracker {
    tickers: HashMap<TickerId, TickerData>,
    recent_views: VecDeque<TickerId>, // Tracks the order of recently viewed tickers
}

#[derive(Serialize, Deserialize)]
struct TickerData {
    ticker_id: TickerId,
    total_time_visible: u64,
    #[serde(skip_serializing)] // Skip this field when serializing
    visibility_start: Option<u64>,
    visibility_count: u32,
}

impl TickerData {
    fn new(ticker_id: TickerId) -> Self {
        web_sys::console::log_1(&JsValue::from(format!(
            "Initialize new hash entry for ticker {:?}.",
            ticker_id
        )));

        TickerData {
            ticker_id,
            total_time_visible: 0,
            visibility_start: None,
            visibility_count: 0,
        }
    }

    fn start_visibility(&mut self) {
        if self.visibility_start.is_none() {
            // This ticker was not visible and is now starting visibility, so increment the count
            self.visibility_start = Some(Date::now() as u64);
            self.visibility_count += 1;

            // Log for debugging
            web_sys::console::log_1(&JsValue::from(format!(
                "Starting visibility for ticker {:?}. Visibility Count: {}",
                self.ticker_id, self.visibility_count
            )));
        } else {
            // Log when already visible
            web_sys::console::log_1(&JsValue::from(format!(
                "Ticker {:?} is already visible.",
                self.ticker_id
            )));
        }
    }

    fn end_visibility(&mut self) {
        if let Some(start_time) = self.visibility_start {
            self.total_time_visible += (Date::now() as u64) - start_time;
            self.visibility_start = None;

            // Log for debugging
            web_sys::console::log_1(&JsValue::from(format!(
                "Ending visibility for ticker {:?}.",
                self.ticker_id
            )));
        } else {
            // Log if trying to end visibility when not visible
            web_sys::console::log_1(&JsValue::from(format!(
                "Ticker {:?} was not visible.",
                self.ticker_id
            )));
        }
    }
}

impl TickerTracker {
    pub fn new() -> Self {
        web_sys::console::log_1(&JsValue::from("Creating a new TickerTracker instance."));
        TickerTracker {
            tickers: HashMap::new(),
            recent_views: VecDeque::new(),
        }
    }

    fn get_or_insert_ticker_with_id(&mut self, ticker_id: TickerId) -> &mut TickerData {
        // Perform the mutable borrow to insert or access the TickerData
        let ticker_data = self.tickers.entry(ticker_id).or_insert_with(|| {
            web_sys::console::log_1(&JsValue::from(format!(
                "Inserting new ticker entry for {:?}.",
                ticker_id
            )));
            TickerData::new(ticker_id)
        });

        // Return the mutable reference immediately
        ticker_data
    }

    pub fn register_visible_ticker_ids(&mut self, visible_ticker_ids: Vec<TickerId>) {
        // Track which tickers are no longer visible and end their visibility
        for (&ticker_id, data) in self.tickers.iter_mut() {
            if !visible_ticker_ids.contains(&ticker_id) {
                data.end_visibility();
            }
        }

        // Track visibility for currently visible tickers
        for &ticker_id in &visible_ticker_ids {
            let ticker_data = self.get_or_insert_ticker_with_id(ticker_id);
            ticker_data.start_visibility();

            // Remove the ticker from its current position in recent views if it exists
            if let Some(pos) = self.recent_views.iter().position(|&id| id == ticker_id) {
                self.recent_views.remove(pos);
            }

            // Push the ticker to the front (most recent)
            self.recent_views.push_front(ticker_id);
        }

        // Log the updated keys after all mutable operations are done
        let updated_keys: Vec<String> = self
            .tickers
            .keys()
            .map(|key| format!("{:?}", key))
            .collect();
        web_sys::console::log_1(&JsValue::from(format!(
            "Updated Ticker IDs after insertion: {:?}",
            updated_keys
        )));
    }

    /// Exports the current state of TickerTracker as a JSON string
    pub fn export_state(&self) -> Result<String, JsValue> {
        match serde_json::to_string(&self) {
            Ok(serialized) => Ok(serialized),
            Err(err) => {
                web_sys::console::log_1(&JsValue::from(format!(
                    "Failed to serialize TickerTracker: {:?}",
                    err
                )));
                Err(JsValue::from_str("Failed to serialize TickerTracker"))
            }
        }
    }

    /// Imports the state into TickerTracker from a JSON string
    pub fn import_state(serialized: &str) -> Result<Self, JsValue> {
        match serde_json::from_str(serialized) {
            Ok(tracker) => Ok(tracker),
            Err(err) => {
                web_sys::console::log_1(&JsValue::from(format!(
                    "Failed to deserialize TickerTracker: {:?}",
                    err
                )));
                Err(JsValue::from_str("Failed to deserialize TickerTracker"))
            }
        }
    }
}
