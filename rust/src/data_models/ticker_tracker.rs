use js_sys::Date;
use once_cell::sync::Lazy;
use std::collections::{HashMap, VecDeque};
use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

use crate::types::TickerId;

pub static TICKER_TRACKER: Lazy<Mutex<TickerTracker>> =
    Lazy::new(|| Mutex::new(TickerTracker::new()));

pub struct TickerTracker {
    tickers: HashMap<TickerId, TickerData>,
    recent_views: VecDeque<TickerId>, // Tracks the order of recently viewed tickers
}

struct TickerData {
    ticker_id: TickerId,
    total_time_visible: f64, // Use f64 to store the total time in milliseconds
    visibility_start: Option<f64>, // Store the start time as a timestamp in milliseconds
    visibility_count: u32,
}

impl TickerData {
    fn new(ticker_id: TickerId) -> Self {
        web_sys::console::log_1(&JsValue::from(format!(
            "Initialize new hash entry for ticker {}.",
            ticker_id
        )));

        TickerData {
            ticker_id,
            total_time_visible: 0.0,
            visibility_start: None,
            visibility_count: 0,
        }
    }

    fn start_visibility(&mut self) {
        if self.visibility_start.is_none() {
            // This ticker was not visible and is now starting visibility, so increment the count
            self.visibility_start = Some(Date::now());
            self.visibility_count += 1;

            // Log for debugging
            web_sys::console::log_1(&JsValue::from(format!(
                "Starting visibility for ticker {}. Visibility Count: {}",
                self.ticker_id, self.visibility_count
            )));
        } else {
            // Log when already visible
            web_sys::console::log_1(&JsValue::from(format!(
                "Ticker {} is already visible.",
                self.ticker_id
            )));
        }
    }

    fn end_visibility(&mut self) {
        if let Some(start_time) = self.visibility_start {
            self.total_time_visible += Date::now() - start_time;
            self.visibility_start = None;

            // Log for debugging
            web_sys::console::log_1(&JsValue::from(format!(
                "Ending visibility for ticker {}.",
                self.ticker_id
            )));
        } else {
            // Log if trying to end visibility when not visible
            web_sys::console::log_1(&JsValue::from(format!(
                "Ticker {} was not visible.",
                self.ticker_id
            )));
        }
    }
}

impl TickerTracker {
    pub fn new() -> Self {
        web_sys::console::log_1(&JsValue::from("Initializing TickerTracker"));

        TickerTracker {
            tickers: HashMap::new(),
            recent_views: VecDeque::new(),
        }
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
            let ticker_data = self
                .tickers
                .entry(ticker_id)
                .or_insert_with(|| TickerData::new(ticker_id));
            ticker_data.start_visibility();

            // Remove the ticker from its current position in recent views if it exists
            if let Some(pos) = self.recent_views.iter().position(|&id| id == ticker_id) {
                self.recent_views.remove(pos);
            }

            // Push the ticker to the front (most recent)
            self.recent_views.push_front(ticker_id);
        }

        // Remove old tickers that are no longer tracked (optional, based on your needs)
        self.tickers
            .retain(|_, data| data.visibility_start.is_some());

        // Logging for debugging
        for (&ticker_id, data) in self.tickers.iter() {
            web_sys::console::log_1(&JsValue::from(format!(
                "Ticker ID: {}, Total Time Visible: {}ms, Visibility Count: {}",
                ticker_id, data.total_time_visible, data.visibility_count
            )));
        }
    }

    pub fn get_recently_viewed_tickers(&self) -> Vec<u32> {
        self.recent_views.iter().cloned().collect()
    }
}
