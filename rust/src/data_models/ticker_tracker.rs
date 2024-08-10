use js_sys::Date;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use serde_json;
use std::collections::{HashMap, VecDeque};
use std::sync::Mutex;
use wasm_bindgen::JsValue;

use crate::types::TickerId;

pub static TICKER_TRACKER: Lazy<Mutex<TickerTracker>> = Lazy::new(|| {
    web_sys::console::debug_1(&JsValue::from("Initializing TickerTracker in Lazy."));
    Mutex::new(TickerTracker::new())
});

#[derive(Serialize, Deserialize)]
pub struct TickerTracker {
    tickers: HashMap<TickerId, TickerTrackerVisibility>,
    recent_views: VecDeque<TickerId>, // Tracks the order of recently viewed tickers
    #[serde(skip_serializing_if = "Option::is_none", default)] // Skip if None
    ordered_by_time_visible: Option<VecDeque<TickerId>>, // Tracks tickers ordered by total time visible
}

#[derive(Serialize, Deserialize)]
struct TickerTrackerVisibility {
    ticker_id: TickerId,
    total_time_visible: u64,
    #[serde(skip_serializing)] // Skip this field when serializing
    visibility_start: Option<u64>,
    visibility_count: u32,
}

impl TickerTrackerVisibility {
    fn new(ticker_id: TickerId) -> Self {
        web_sys::console::debug_1(&JsValue::from(format!(
            "Initialize new hash entry for ticker {:?}.",
            ticker_id
        )));

        TickerTrackerVisibility {
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

            web_sys::console::debug_1(&JsValue::from(format!(
                "Starting visibility for ticker {:?}. Visibility Count: {}",
                self.ticker_id, self.visibility_count
            )));
        } else {
            web_sys::console::debug_1(&JsValue::from(format!(
                "Ticker {:?} is already visible.",
                self.ticker_id
            )));
        }
    }

    fn end_visibility(&mut self) {
        if let Some(start_time) = self.visibility_start {
            let elapsed_time = (Date::now() as u64) - start_time;
            self.total_time_visible += elapsed_time;
            self.visibility_start = None;

            web_sys::console::debug_1(&JsValue::from(format!(
                "Ending visibility for ticker {:?}. Total Time Visible: {}",
                self.ticker_id, self.total_time_visible
            )));
        } else {
            web_sys::console::debug_1(&JsValue::from(format!(
                "Ticker {:?} was not visible.",
                self.ticker_id
            )));
        }
    }
}

impl TickerTracker {
    pub fn new() -> Self {
        web_sys::console::debug_1(&JsValue::from("Creating a new TickerTracker instance."));
        TickerTracker {
            tickers: HashMap::new(),
            recent_views: VecDeque::new(),
            ordered_by_time_visible: None,
        }
    }

    fn get_or_insert_ticker_with_id(&mut self, ticker_id: TickerId) -> &mut TickerTrackerVisibility {
        let ticker_data = self.tickers.entry(ticker_id).or_insert_with(|| {
            web_sys::console::debug_1(&JsValue::from(format!(
                "Inserting new ticker entry for {:?}.",
                ticker_id
            )));
            TickerTrackerVisibility::new(ticker_id)
        });

        ticker_data
    }

    pub fn register_visible_ticker_ids(&mut self, visible_ticker_ids: Vec<TickerId>) {
        for (&ticker_id, data) in self.tickers.iter_mut() {
            if !visible_ticker_ids.contains(&ticker_id) {
                data.end_visibility();
            }
        }

        for &ticker_id in &visible_ticker_ids {
            let ticker_data = self.get_or_insert_ticker_with_id(ticker_id);
            ticker_data.start_visibility();

            if let Some(pos) = self.recent_views.iter().position(|&id| id == ticker_id) {
                self.recent_views.remove(pos);
            }

            self.recent_views.push_front(ticker_id);
        }

        self.update_ordered_by_time_visible();
    }

    fn update_ordered_by_time_visible(&mut self) {
        let all_ticker_ids: Vec<TickerId> = self.tickers.keys().copied().collect();
    
        if self.ordered_by_time_visible.is_none() {
            self.ordered_by_time_visible = Some(VecDeque::new());
        }
    
        let mut new_ordered_by_time_visible = VecDeque::new();
    
        for &ticker_id in &all_ticker_ids {
            let total_time_visible = self.tickers[&ticker_id].total_time_visible;
    
            let pos = new_ordered_by_time_visible
                .iter()
                .position(|&id| {
                    let ticker_data = &self.tickers[&id];
                    ticker_data.total_time_visible < total_time_visible
                })
                .unwrap_or_else(|| new_ordered_by_time_visible.len());
    
            new_ordered_by_time_visible.insert(pos, ticker_id);
        }
    
        self.ordered_by_time_visible = Some(new_ordered_by_time_visible);
    
        let ordered_tickers: Vec<String> = self
            .ordered_by_time_visible
            .as_ref()
            .unwrap()
            .iter()
            .map(|&id| {
                let total_time_visible = self.tickers[&id].total_time_visible;
                format!("{:?} (Total Time Visible: {})", id, total_time_visible)
            })
            .collect();

        web_sys::console::debug_1(&JsValue::from(format!(
            "Tickers ordered by time visible: {:?}",
            ordered_tickers
        )));
    }

    pub fn export_state(&self) -> Result<String, JsValue> {
        match serde_json::to_string(&self) {
            Ok(serialized) => Ok(serialized),
            Err(err) => {
                web_sys::console::debug_1(&JsValue::from(format!(
                    "Failed to serialize TickerTracker: {:?}",
                    err
                )));
                Err(JsValue::from_str("Failed to serialize TickerTracker"))
            }
        }
    }

    pub fn import_state(serialized: &str) -> Result<Self, JsValue> {
        match serde_json::from_str::<TickerTracker>(serialized) {
            Ok(mut tracker) => {
                if tracker.ordered_by_time_visible.is_none() {
                    tracker.update_ordered_by_time_visible();
                }
                Ok(tracker)
            }
            Err(err) => {
                web_sys::console::debug_1(&JsValue::from(format!(
                    "Failed to deserialize TickerTracker: {:?}",
                    err
                )));
                Err(JsValue::from_str("Failed to deserialize TickerTracker"))
            }
        }
    }
}
