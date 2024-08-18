include!("flatbuffers/financial_vectors.tenk_generated.rs");
use crate::types::TickerId;
use crate::utils;
use crate::DataURL;
use financial_vectors::ten_k::root_as_ticker_vectors;

pub async fn get_ticker_vector(ticker_id: TickerId) -> Result<Vec<f32>, String> {
    // TODO: Don't hardcode the URL here
    // Fetch the ticker vectors binary data using `xhr_fetch`
    let url: &str = DataURL::FinancialVectors10K.value();

    let file_content = utils::xhr_fetch_cached(url.to_string())
        .await
        .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

    // Use the FlatBuffers `root_as_ticker_vectors` function to parse the buffer
    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| format!("Failed to parse TickerVectors: {:?}", err))?;

    // Get the vectors, which is an Option containing a flatbuffers::Vector
    if let Some(vectors) = ticker_vectors.vectors() {
        // Loop through each ticker vector in the Vector
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            // TODO: Fix IDL so it doesn't have to cast
            if ticker_vector.ticker_id() as TickerId == ticker_id {
                // Convert the vector to a Rust Vec<f32> and return it
                if let Some(vector_data) = ticker_vector.vector() {
                    let vector: Vec<f32> = vector_data.iter().collect();
                    return Ok(vector);
                } else {
                    return Err("No vector data found for the given Ticker ID".to_string());
                }
            }
        }
    }

    // If the ticker_id was not found, return an error
    Err("Ticker ID not found".to_string())
}

// TODO: Rename accordingly
// TODO: Use f32 for vectors
// TODO: Refactor so that custom vectors can be triangulated against known vectors
// using their PCA coordinates to determine the relative position in the PCA space.
pub async fn find_closest_ticker_ids(
    ticker_id: TickerId,
) -> Result<Vec<(TickerId, f64, Vec<f64>, Vec<f64>)>, String> {
    // Fetch the ticker vectors binary data using `xhr_fetch`
    let url: &str = DataURL::FinancialVectors10K.value();

    let file_content = utils::xhr_fetch_cached(url.to_string())
        .await
        .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

    // Use the FlatBuffers `root_as_ticker_vectors` function to parse the buffer
    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| format!("Failed to parse TickerVectors: {:?}", err))?;

    // Find the target vector and PCA coordinates corresponding to the given ticker_id
    let mut target_vector: Option<flatbuffers::Vector<'_, f32>> = None;
    let mut target_pca_coordinates: Option<flatbuffers::Vector<'_, f32>> = None;

    if let Some(vectors) = ticker_vectors.vectors() {
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            // TODO: Fix IDL so it doesn't have to cast
            if ticker_vector.ticker_id() as TickerId == ticker_id {
                target_vector = ticker_vector.vector();
                target_pca_coordinates = ticker_vector.pca_coordinates();
                break;
            }
        }
    }

    let target_vector = match target_vector {
        Some(vector) => vector,
        None => return Err("Ticker ID not found".to_string()),
    };

    let target_pca_coordinates = match target_pca_coordinates {
        Some(coords) => coords,
        None => return Err("PCA coordinates not found for the given Ticker ID".to_string()),
    };

    // Convert target PCA coordinates to Vec<f64> for arithmetic operations
    let target_pca_coords: Vec<f64> = target_pca_coordinates.iter().map(|c| c as f64).collect();

    // Compute Euclidean distance with every other vector and capture PCA coordinates
    let mut results: Vec<(TickerId, f64, Vec<f64>, Vec<f64>)> = Vec::new();
    if let Some(vectors) = ticker_vectors.vectors() {
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            // TODO: Fix IDL so it doesn't have to cast
            if ticker_vector.ticker_id() as TickerId != ticker_id {
                if let Some(other_vector) = ticker_vector.vector() {
                    let distance = euclidean_distance(&target_vector, &other_vector);

                    // Extract non-translated PCA coordinates
                    let original_pca_coords = ticker_vector
                        .pca_coordinates()
                        .map(|coords| coords.iter().map(|c| c as f64).collect::<Vec<f64>>())
                        .unwrap_or_default();

                    // Compute translated PCA coordinates
                    let translated_pca_coords = ticker_vector
                        .pca_coordinates()
                        .map(|coords| {
                            coords
                                .iter()
                                .zip(&target_pca_coords)
                                .map(|(c, &target_c)| c as f64 - target_c)
                                .collect::<Vec<f64>>()
                        })
                        .unwrap_or_default();

                    results.push((
                        // TODO: Fix IDL so it doesn't have to cast
                        ticker_vector.ticker_id() as TickerId,
                        distance,
                        original_pca_coords,
                        translated_pca_coords,
                    ));
                }
            }
        }
    }

    // Sort by Euclidean distance in ascending order and take the top 20
    results.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
    let top_20 = results.into_iter().take(20).collect::<Vec<_>>();

    Ok(top_20)
}

// Helper function to compute Euclidean distance between two vectors
fn euclidean_distance(
    vector1: &flatbuffers::Vector<'_, f32>,
    vector2: &flatbuffers::Vector<'_, f32>,
) -> f64 {
    vector1
        .iter()
        .zip(vector2.iter())
        // TODO: Why the cast to f64?
        .map(|(a, b)| (a as f64 - b as f64).powi(2))
        .sum::<f64>()
        .sqrt()
}
