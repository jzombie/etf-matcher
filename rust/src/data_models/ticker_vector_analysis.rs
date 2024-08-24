include!("flatbuffers/financial_vectors.tenk_generated.rs");
use crate::types::TickerId;
use crate::utils;
use crate::DataURL;
use financial_vectors::ten_k::root_as_ticker_vectors;
use serde::Deserialize;
use wasm_bindgen::JsValue;

#[derive(Debug, Clone)]
pub struct TickerDistance {
    pub ticker_id: TickerId,
    pub distance: f32,
    pub original_pca_coords: Vec<f32>,
    pub translated_pca_coords: Vec<f32>,
}

#[derive(Deserialize)]
pub struct TickerWithQuantity {
    pub ticker_id: TickerId,
    pub quantity: u32,
}

pub async fn get_ticker_vector(ticker_id: TickerId) -> Result<Vec<f32>, String> {
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

// TODO: Refactor
pub async fn proto_analyze_tickers_with_quantity(tickers_with_quantity: Vec<TickerWithQuantity>) {
    // Log the start of the analysis
    web_sys::console::log_1(&"Starting analysis of tickers with quantities".into());

    for ticker_with_quantity in tickers_with_quantity.iter() {
        let message = format!(
            "Ticker ID: {}, Quantity: {}",
            ticker_with_quantity.ticker_id, ticker_with_quantity.quantity
        );
        web_sys::console::log_1(&message.into());
    }

    // Await the custom_vector future
    let custom_vector_result = generate_vector(&tickers_with_quantity).await;

    match custom_vector_result {
        Ok(custom_vector) => {
            web_sys::console::log_1(&JsValue::from_str(&format!(
                "Custom vector: {:?}",
                custom_vector
            )));
        }
        Err(err) => {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error generating vector: {}",
                err
            )));
        }
    }

    let triangulated_pca_result = triangulate_pca_coordinates(&tickers_with_quantity).await;

    match triangulated_pca_result {
        Ok(triangulated_pca) => {
            web_sys::console::log_1(&JsValue::from_str(&format!(
                "Triangulated PCA: {:?}",
                triangulated_pca
            )));
        }
        Err(err) => {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error generating triangulated PCA: {}",
                err
            )));
        }
    }

    // Log the end of the analysis
    web_sys::console::log_1(&"Analysis completed.".into());
}

fn find_target_vector_and_pca<'a>(
    ticker_vectors: &'a financial_vectors::ten_k::TickerVectors<'a>,
    ticker_id: TickerId,
) -> Option<(flatbuffers::Vector<'a, f32>, Vec<f32>)> {
    ticker_vectors.vectors()?.iter().find_map(|ticker_vector| {
        if ticker_vector.ticker_id() as TickerId == ticker_id {
            Some((
                ticker_vector.vector()?,
                ticker_vector
                    .pca_coordinates()
                    .map(|coords| coords.iter().collect::<Vec<f32>>())
                    .unwrap_or_default(),
            ))
        } else {
            None
        }
    })
}

pub async fn generate_vector(
    tickers_with_quantity: &Vec<TickerWithQuantity>,
) -> Result<Vec<f32>, String> {
    // Initialize an empty vector to hold the aggregated result
    let mut aggregated_vector: Vec<f32> = Vec::new();

    // Loop through each ticker in the input list, along with its corresponding quantity
    for ticker_with_quantity in tickers_with_quantity {
        // Fetch the vector associated with the current ticker_id asynchronously
        let ticker_vector = get_ticker_vector(ticker_with_quantity.ticker_id).await?;

        // Check if the aggregated_vector is empty, which will only be true for the first ticker
        if aggregated_vector.is_empty() {
            // Initialize the aggregated_vector with the values from the first ticker's vector,
            // scaling each value by the quantity associated with this ticker.
            aggregated_vector = ticker_vector
                .iter()
                .map(|&value| value * ticker_with_quantity.quantity as f32)
                .collect();
        } else {
            // If this is not the first ticker, add the current ticker's vector to the
            // aggregated_vector. Each element of the vector is scaled by the quantity
            // associated with this ticker and then added to the corresponding element in the
            // aggregated_vector.
            for (i, &value) in ticker_vector.iter().enumerate() {
                aggregated_vector[i] += value * ticker_with_quantity.quantity as f32;
            }
        }
    }

    // Calculate the total quantity by summing up the quantities of all tickers
    let total_quantity: u32 = tickers_with_quantity.iter().map(|t| t.quantity).sum();

    // Check if the total quantity is zero, which would mean that the function can't generate a valid vector
    if total_quantity == 0 {
        return Err("Total quantity is zero, cannot generate a valid vector.".to_string());
    }

    // Normalize the aggregated_vector by dividing each element by the total quantity.
    // This step essentially computes the weighted average of the vectors.
    for value in &mut aggregated_vector {
        *value /= total_quantity as f32;
    }

    // Return the resulting aggregated and normalized vector
    Ok(aggregated_vector)
}

// TODO: Perhaps instead of using `tickers_with_quantity` as the arg, supply the vector itself
pub async fn triangulate_pca_coordinates(
    tickers_with_quantity: &Vec<TickerWithQuantity>,
) -> Result<Vec<f32>, String> {
    // Step 1: Generate the new vector based on the given tickers and their quantities
    let new_vector = generate_vector(tickers_with_quantity).await?;

    // Fetch the ticker vectors binary data using `xhr_fetch`
    let url: &str = DataURL::FinancialVectors10K.value();

    let file_content = utils::xhr_fetch_cached(url.to_string())
        .await
        .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

    // Use the FlatBuffers `root_as_ticker_vectors` function to parse the buffer
    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| format!("Failed to parse TickerVectors: {:?}", err))?;

    let mut weighted_pca_coords: Vec<f32> = Vec::new();
    let mut total_weight: f32 = 0.0;

    // Step 2: Compute Euclidean distance between the new vector and every known vector
    if let Some(vectors) = ticker_vectors.vectors() {
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            if let Some(other_vector) = ticker_vector.vector() {
                let distance = euclidean_distance(&new_vector, &other_vector);

                if distance == 0.0 {
                    // If the distance is zero, return the PCA coordinates directly
                    if let Some(coords) = ticker_vector.pca_coordinates() {
                        return Ok(coords.iter().map(|c| c).collect());
                    } else {
                        return Err("PCA coordinates not found for the exact match.".to_string());
                    }
                }

                // Extract PCA coordinates for weighting
                if let Some(pca_coords) = ticker_vector.pca_coordinates() {
                    let pca_coords_vec: Vec<f32> = pca_coords.iter().map(|c| c).collect();

                    // Calculate weight as the inverse of the distance with stability adjustment
                    let weight = 1.0 / (distance + 1e-9);

                    // Accumulate the weighted PCA coordinates
                    if weighted_pca_coords.is_empty() {
                        weighted_pca_coords = pca_coords_vec.iter().map(|&c| c * weight).collect();
                    } else {
                        for (j, &coord) in pca_coords_vec.iter().enumerate() {
                            weighted_pca_coords[j] += coord * weight;
                        }
                    }

                    total_weight += weight;
                }
            }
        }
    }

    if total_weight == 0.0 {
        return Err("No valid PCA coordinates found to triangulate.".to_string());
    }

    // Step 3: Normalize the weighted PCA coordinates
    for coord in &mut weighted_pca_coords {
        *coord /= total_weight;
    }

    Ok(weighted_pca_coords)
}

// TODO: Refactor so that custom vectors can be triangulated against known vectors
// using their PCA coordinates to determine the relative position in the PCA space.
pub async fn find_closest_tickers(ticker_id: TickerId) -> Result<Vec<TickerDistance>, String> {
    let url: &str = DataURL::FinancialVectors10K.value();
    let file_content = utils::xhr_fetch_cached(url.to_string())
        .await
        .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| format!("Failed to parse TickerVectors: {:?}", err))?;

    // Use the helper function to find the target vector and PCA coordinates
    let (target_vector, target_pca_coords) =
        match find_target_vector_and_pca(&ticker_vectors, ticker_id) {
            Some(result) => result,
            None => return Err("Ticker ID or PCA coordinates not found.".to_string()),
        };

    let mut results: Vec<TickerDistance> = Vec::new();
    if let Some(vectors) = ticker_vectors.vectors() {
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            if ticker_vector.ticker_id() as TickerId != ticker_id {
                if let Some(other_vector) = ticker_vector.vector() {
                    let distance =
                        euclidean_distance(&target_vector.iter().collect::<Vec<_>>(), other_vector);

                    let original_pca_coords = ticker_vector
                        .pca_coordinates()
                        .map(|coords| coords.iter().collect::<Vec<f32>>())
                        .unwrap_or_default();

                    let translated_pca_coords = original_pca_coords
                        .iter()
                        .zip(&target_pca_coords)
                        .map(|(c, &target_c)| c - target_c)
                        .collect::<Vec<f32>>();

                    results.push(TickerDistance {
                        ticker_id: ticker_vector.ticker_id() as TickerId,
                        distance,
                        original_pca_coords,
                        translated_pca_coords,
                    });
                }
            }
        }
    }

    results.sort_by(|a, b| {
        a.distance
            .partial_cmp(&b.distance)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    let top_20 = results.into_iter().take(20).collect();

    Ok(top_20)
}

// Helper function to compute Euclidean distance between two vectors
fn euclidean_distance<T>(vector1: &[f32], vector2: T) -> f32
where
    T: IntoIterator<Item = f32>,
{
    vector1
        .iter()
        .zip(vector2)
        .map(|(a, b)| (a - b).powi(2))
        .sum::<f32>()
        .sqrt()
}

#[derive(Debug, Clone)]
pub struct CosineSimilarityResult {
    pub ticker_id: TickerId,
    pub similarity_score: f32,
    // TODO: Are `PCA coords`` even relevant here?
    pub original_pca_coords: Option<Vec<f32>>,
    pub translated_pca_coords: Option<Vec<f32>>,
}

pub async fn rank_tickers_by_cosine_similarity(
    ticker_id: TickerId,
) -> Result<Vec<CosineSimilarityResult>, String> {
    let url = DataURL::FinancialVectors10K.value();
    let file_content = utils::xhr_fetch_cached(url.to_string())
        .await
        .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| format!("Failed to parse TickerVectors: {:?}", err))?;

    let (target_vector, target_pca_coords) =
        match find_target_vector_and_pca(&ticker_vectors, ticker_id) {
            Some(result) => result,
            None => return Err("Ticker ID or PCA coordinates not found.".to_string()),
        };

    let mut results: Vec<CosineSimilarityResult> = ticker_vectors
        .vectors()
        .ok_or("No vectors found.")?
        .iter()
        .filter_map(|ticker_vector| {
            if ticker_vector.ticker_id() as TickerId != ticker_id {
                ticker_vector.vector().map(|other_vector| {
                    let similarity = cosine_similarity(
                        &target_vector.iter().collect::<Vec<_>>(),
                        &other_vector.iter().collect::<Vec<_>>(),
                    );

                    let original_pca_coords = ticker_vector
                        .pca_coordinates()
                        .map(|coords| coords.iter().collect::<Vec<f32>>());

                    let translated_pca_coords = original_pca_coords.as_ref().map(|coords| {
                        coords
                            .iter()
                            .zip(&target_pca_coords)
                            .map(|(c, &target_c)| c - target_c)
                            .collect::<Vec<f32>>()
                    });

                    CosineSimilarityResult {
                        ticker_id: ticker_vector.ticker_id() as TickerId,
                        similarity_score: similarity,
                        original_pca_coords,
                        translated_pca_coords,
                    }
                })
            } else {
                None
            }
        })
        .collect();

    results.sort_by(|a, b| {
        b.similarity_score
            .partial_cmp(&a.similarity_score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    Ok(results.into_iter().take(20).collect())
}

fn cosine_similarity(vector1: &[f32], vector2: &[f32]) -> f32 {
    let dot_product: f32 = vector1.iter().zip(vector2).map(|(a, b)| a * b).sum();
    let magnitude1: f32 = vector1.iter().map(|v| v * v).sum::<f32>().sqrt();
    let magnitude2: f32 = vector2.iter().map(|v| v * v).sum::<f32>().sqrt();
    dot_product / (magnitude1 * magnitude2)
}
