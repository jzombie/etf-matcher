use crate::data_models::{DataURL, PaginatedResults};
use serde::{Deserialize, Serialize};
use crate::utils::shard_ng::query_shard_for_value;
use crate::JsValue;
use crate::types::TickerId;


#[derive(Serialize, Deserialize, Debug)]
pub struct TickerETFHolder {
    pub ticker_id: TickerId,
    pub etf_ticker_ids_json: String,
}

impl TickerETFHolder {
    pub async fn get_ticker_etf_holders(
        ticker_id: TickerId,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<TickerId>, JsValue> {
        let url: &str = DataURL::TickerETFHoldersShardIndex.value();

        // TODO: Update `holder` to work with ticker IDs instead of symbols

        let holder =
            query_shard_for_value(url, &ticker_id, |detail: &TickerETFHolder| Some(&detail.ticker_id))
                .await?
                .ok_or_else(|| JsValue::from_str("Symbol not found"))?;

        let etf_ticker_ids: Vec<TickerId> = serde_json::from_str(&holder.etf_ticker_ids_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse etf_ticker_ids_json: {}", e)))?;

        PaginatedResults::paginate(etf_ticker_ids, page, page_size)

        // TODO: Convert to symbols and exchange_short_names
    }
}
