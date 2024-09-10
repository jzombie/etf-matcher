use crate::JsValue;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct PaginatedResults<T> {
    pub total_count: usize,
    pub results: Vec<T>,
}

// TODO: This should be able to sort by columns
impl<T> PaginatedResults<T> {
    pub fn paginate(
        data: Vec<T>,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<T>, JsValue> {
        let total_count = data.len();
        let paginated_results: Vec<T> = data
            .into_iter()
            .skip((page - 1) * page_size)
            .take(page_size)
            .collect();

        if paginated_results.is_empty() && total_count > 0 {
            Err(JsValue::from_str(&format!("Page {} out of range", page)))
        } else {
            Ok(PaginatedResults {
                total_count,
                results: paginated_results,
            })
        }
    }
}
