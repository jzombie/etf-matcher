include!("flatbuffers/financial_vectors.tenk_generated.rs"); // TODO: Rename to not be specific to `10-K` or `10-Q`
use crate::types::{TickerId, TickerSymbol};
use crate::utils;
use crate::utils::ticker_utils::{get_ticker_id, get_ticker_symbol};
use crate::DataURL;
use financial_vectors::ten_k::root_as_ticker_vectors;
use financial_vectors::ten_k::TickerVectors;
use futures::stream;
use futures::stream::StreamExt; // Provides async combinators
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct TickerDistance {
    pub ticker_id: TickerId,
    pub ticker_symbol: TickerSymbol,
    pub distance: f32,
    pub original_pca_coords: Vec<f32>,
    pub centered_pca_coords: Vec<f32>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CosineSimilarityResult {
    pub ticker_id: TickerId,
    pub ticker_symbol: TickerSymbol,
    pub similarity_score: f32,
}

// TODO: Extract into a common type to use with `get_weighted_ticker_10k_detail_by_ticker_ids`.
#[derive(Deserialize)]
pub struct TickerWithWeight {
    pub ticker_symbol: TickerSymbol,
    // Float is used to allow usage of fractional shares
    pub weight: f32,
}

pub struct OwnedTickerVectors {
    #[allow(dead_code)]
    // Holds the raw data to ensure that `ticker_vectors` has a valid reference.
    data: Vec<u8>,
    ticker_vectors: TickerVectors<'static>,
}

impl OwnedTickerVectors {
    pub async fn audit_missing_tickers(
        ticker_vector_config_key: &str,
        ticker_symbols: &[TickerSymbol],
    ) -> Result<Vec<TickerSymbol>, String> {
        let owned_ticker_vectors = Self::get_all_ticker_vectors(ticker_vector_config_key).await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let mut missing_tickers = Vec::new();

        for ticker_symbol in ticker_symbols {
            let ticker_id = get_ticker_id(ticker_symbol.clone()).await.map_err(|err| {
                format!(
                    "Could not locate ticker ID for ticker symbol: {}, {:?}",
                    ticker_symbol, err
                )
            })?;

            // Check if the ticker exists in the vector model
            let exists = ticker_vectors
                .vectors()
                .and_then(|vectors| {
                    vectors
                        .iter()
                        .any(|ticker_vector| ticker_vector.ticker_id() as TickerId == ticker_id)
                        .then(|| ())
                })
                .is_some();

            if !exists {
                missing_tickers.push(ticker_symbol.clone());
            }
        }

        Ok(missing_tickers)
    }

    async fn get_all_ticker_vectors(
        ticker_vector_config_key: &str,
    ) -> Result<OwnedTickerVectors, String> {
        let url = DataURL::TickerVectors(ticker_vector_config_key.to_string()).value();

        let file_content = utils::xhr_fetch_cached(url.to_string())
            .await
            .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

        // Move the data into a Box to keep it around after parsing
        let boxed_content = file_content.into_boxed_slice();

        // Parse the boxed buffer into TickerVectors using FlatBuffers
        let ticker_vectors = root_as_ticker_vectors(&boxed_content)
            .map_err(|err| format!("Failed to parse TickerVectors: {:?}", err))?;

        // Leak the Box to convert the slice into a 'static reference
        let ticker_vectors =
            unsafe { std::mem::transmute::<TickerVectors, TickerVectors<'static>>(ticker_vectors) };

        Ok(OwnedTickerVectors {
            data: boxed_content.into_vec(),
            ticker_vectors,
        })
    }
}

impl TickerDistance {
    // Base function that computes distances and similarities
    async fn find_closest_tickers_by_vector(
        target_vector: &[f32],
        target_pca_coords: &[f32],
        ticker_vectors: &TickerVectors<'_>,
        exclude_ticker_ids: Option<&[TickerId]>, // Optional list of ticker IDs to exclude
    ) -> Result<Vec<TickerDistance>, String> {
        let mut results: Vec<TickerDistance> = Vec::new();

        if let Some(vectors) = ticker_vectors.vectors() {
            for i in 0..vectors.len() {
                let ticker_vector = vectors.get(i);
                // Exclude tickers with IDs in exclude_ticker_ids if provided
                if exclude_ticker_ids.map_or(true, |ids| {
                    !ids.contains(&(ticker_vector.ticker_id() as TickerId))
                }) {
                    if let Some(other_vector) = ticker_vector.vector() {
                        let distance = Self::euclidean_distance(target_vector, &other_vector);

                        let original_pca_coords = ticker_vector
                            .pca_coordinates()
                            .map(|coords| coords.iter().collect::<Vec<f32>>())
                            .unwrap_or_default();

                        let centered_pca_coords = original_pca_coords
                            .iter()
                            .zip(target_pca_coords)
                            .map(|(c, &target_c)| c - target_c)
                            .collect::<Vec<f32>>();

                        let ticker_id = ticker_vector.ticker_id() as TickerId;

                        let ticker_symbol = get_ticker_symbol(ticker_id).await.or_else(|_| {
                            Err(format!(
                                "Could not locate ticker symbol for ticker ID: {}",
                                ticker_id
                            ))
                        })?;

                        results.push(TickerDistance {
                            ticker_id,
                            ticker_symbol,
                            distance,
                            original_pca_coords,
                            centered_pca_coords,
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
        Ok(results.into_iter().take(20).collect())
    }

    pub async fn get_euclidean_by_ticker(
        ticker_vector_config_key: &str,
        ticker_symbol: TickerSymbol,
    ) -> Result<Vec<TickerDistance>, String> {
        let owned_ticker_vectors =
            OwnedTickerVectors::get_all_ticker_vectors(ticker_vector_config_key).await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let ticker_id = get_ticker_id(ticker_symbol.clone()).await.map_err(|err| {
            format!(
                "Could not locate ticker ID for ticker symbol: {}, {:?}",
                ticker_symbol, err
            )
        })?;

        let (target_vector, target_pca_coords) =
            match get_ticker_vector_and_pca(&ticker_vectors, ticker_id) {
                Some(result) => result,
                None => {
                    return Err(format!(
                        "Ticker vector with symbol {} or PCA coordinates not found.",
                        ticker_symbol
                    )
                    .to_string());
                }
            };

        Self::find_closest_tickers_by_vector(
            &target_vector.iter().collect::<Vec<_>>(),
            &target_pca_coords,
            &ticker_vectors,
            Some(&[ticker_id]), // Ensure the current ticker is excluded
        )
        .await
    }

    pub async fn get_euclidean_by_ticker_bucket(
        ticker_vector_config_key: &str,
        tickers_with_weight: &Vec<TickerWithWeight>,
    ) -> Result<Vec<TickerDistance>, String> {
        // Generate the custom vector based on the quantities of the tickers
        let custom_vector =
            TickerWithWeight::generate_bucket_vector(ticker_vector_config_key, tickers_with_weight)
                .await?;

        // Triangulate the PCA coordinates for the custom vector
        let custom_pca_coords = TickerDistance::triangulate_pca_coordinates(
            ticker_vector_config_key,
            custom_vector.clone(),
        )
        .await?;

        // Call the base method directly with the custom vector and triangulated PCA coordinates
        let owned_ticker_vectors =
            OwnedTickerVectors::get_all_ticker_vectors(ticker_vector_config_key).await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        // Collect all ticker_ids in the input tickers_with_weight to exclude them
        let exclude_ticker_symbols: Vec<TickerSymbol> = tickers_with_weight
            .iter()
            .map(|ticker_with_weight| ticker_with_weight.ticker_symbol.clone())
            .collect();

        let exclude_ticker_ids: Vec<TickerId> = stream::iter(exclude_ticker_symbols)
            .then(|ticker_symbol| async move {
                match get_ticker_id(ticker_symbol.clone()).await {
                    Ok(ticker_id) => Some(ticker_id),
                    Err(err) => {
                        eprintln!(
                            "Failed to locate ticker ID for ticker symbol {}: {:?}",
                            ticker_symbol, err
                        );
                        None
                    }
                }
            })
            .filter_map(|ticker_id| async move {
                if ticker_id.is_some() {
                    ticker_id
                } else {
                    None
                }
            })
            .collect::<Vec<_>>()
            .await;

        Self::find_closest_tickers_by_vector(
            &custom_vector,
            &custom_pca_coords,
            &ticker_vectors,
            Some(&exclude_ticker_ids), // Pass the exclude_ticker_ids list
        )
        .await
    }

    pub async fn triangulate_pca_coordinates(
        ticker_vector_config_key: &str,
        user_vector: Vec<f32>,
    ) -> Result<Vec<f32>, String> {
        let owned_ticker_vectors =
            OwnedTickerVectors::get_all_ticker_vectors(ticker_vector_config_key).await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let mut weighted_pca_coords: Vec<f32> = Vec::new();
        let mut total_weight: f32 = 0.0;

        // Step 2: Compute Euclidean distance between the new vector and every known vector
        if let Some(vectors) = ticker_vectors.vectors() {
            for i in 0..vectors.len() {
                let ticker_vector = vectors.get(i);
                if let Some(other_vector) = ticker_vector.vector() {
                    let distance = Self::euclidean_distance(&user_vector, &other_vector);

                    if distance == 0.0 {
                        // If the distance is zero, return the PCA coordinates directly
                        if let Some(coords) = ticker_vector.pca_coordinates() {
                            return Ok(coords.iter().map(|c| c).collect());
                        } else {
                            return Err(
                                "PCA coordinates not found for the exact match.".to_string()
                            );
                        }
                    }

                    // Extract PCA coordinates for weighting
                    if let Some(pca_coords) = ticker_vector.pca_coordinates() {
                        let pca_coords_vec: Vec<f32> = pca_coords.iter().map(|c| c).collect();

                        // TODO: Determine if this epsilon value is actually needed
                        const EPSILON: f32 = 1e-9;

                        // Calculate weight as the inverse of the distance with stability adjustment
                        let weight = 1.0 / (distance + EPSILON);

                        // Accumulate the weighted PCA coordinates
                        if weighted_pca_coords.is_empty() {
                            weighted_pca_coords =
                                pca_coords_vec.iter().map(|&c| c * weight).collect();
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
}

impl CosineSimilarityResult {
    pub async fn get_cosine_by_ticker(
        ticker_vector_config_key: &str,
        ticker_symbol: TickerSymbol,
    ) -> Result<Vec<CosineSimilarityResult>, String> {
        let owned_ticker_vectors =
            OwnedTickerVectors::get_all_ticker_vectors(ticker_vector_config_key).await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let ticker_id = get_ticker_id(ticker_symbol.clone()).await.map_err(|err| {
            format!(
                "Could not locate ticker ID for ticker symbol: {}, {:?}",
                ticker_symbol, err
            )
        })?;

        let (target_vector, _target_pca_coords) =
            match get_ticker_vector_and_pca(&ticker_vectors, ticker_id) {
                Some(result) => result,
                None => {
                    return Err(format!(
                        "Ticker vector with symbol {} or PCA coordinates not found.",
                        ticker_symbol
                    )
                    .to_string())
                }
            };

        let mut results: Vec<CosineSimilarityResult> =
            futures::stream::iter(ticker_vectors.vectors().ok_or("No vectors found.")?.iter())
                .filter_map(|ticker_vector| {
                    let target_vector = target_vector.clone();
                    async move {
                        if ticker_vector.ticker_id() as TickerId != ticker_id {
                            if let Some(other_vector) = ticker_vector.vector() {
                                let similarity = Self::cosine_similarity(
                                    &target_vector.iter().collect::<Vec<_>>(),
                                    &other_vector.iter().collect::<Vec<_>>(),
                                );

                                let ticker_id = ticker_vector.ticker_id() as TickerId;

                                match get_ticker_symbol(ticker_id).await {
                                    Ok(ticker_symbol) => Some(CosineSimilarityResult {
                                        ticker_id,
                                        ticker_symbol,
                                        similarity_score: similarity,
                                    }),
                                    Err(_) => None, // Skip if fetching ticker symbol fails
                                }
                            } else {
                                None
                            }
                        } else {
                            None
                        }
                    }
                })
                .collect::<Vec<_>>() // Collect results into a Vec
                .await; // Await the completion of the asynchronous stream

        results.sort_by(|a, b| {
            b.similarity_score
                .partial_cmp(&a.similarity_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        Ok(results.into_iter().take(20).collect())
    }

    pub async fn get_cosine_by_ticker_bucket(
        ticker_vector_config_key: &str,
        tickers_with_weight: &Vec<TickerWithWeight>,
    ) -> Result<Vec<CosineSimilarityResult>, String> {
        // Generate the custom vector based on the quantities of the tickers
        let custom_vector =
            TickerWithWeight::generate_bucket_vector(ticker_vector_config_key, tickers_with_weight)
                .await?;

        // Get all ticker vectors
        let owned_ticker_vectors =
            OwnedTickerVectors::get_all_ticker_vectors(ticker_vector_config_key).await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let mut results: Vec<CosineSimilarityResult> =
            futures::stream::iter(ticker_vectors.vectors().ok_or("No vectors found.")?.iter())
                .filter_map(|ticker_vector| {
                    let custom_vector = custom_vector.clone();
                    async move {
                        if let Some(other_vector) = ticker_vector.vector() {
                            let similarity = Self::cosine_similarity(
                                &custom_vector,
                                &other_vector.iter().collect::<Vec<f32>>(),
                            );

                            let ticker_id = ticker_vector.ticker_id() as TickerId;

                            match get_ticker_symbol(ticker_id).await {
                                Ok(ticker_symbol) => Some(CosineSimilarityResult {
                                    ticker_id,
                                    ticker_symbol,
                                    similarity_score: similarity,
                                }),
                                Err(_) => None, // Skip if fetching ticker symbol fails
                            }
                        } else {
                            None
                        }
                    }
                })
                .collect::<Vec<_>>() // Collect results into a vector
                .await; // Await the completion of the asynchronous stream

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
}

impl TickerWithWeight {
    async fn generate_bucket_vector(
        ticker_vector_config_key: &str,
        tickers_with_weight: &Vec<TickerWithWeight>,
    ) -> Result<Vec<f32>, String> {
        // Initialize an empty vector to hold the aggregated result
        let mut aggregated_vector: Vec<f32> = Vec::new();

        // Loop through each ticker in the input list, along with its corresponding weight
        for ticker_with_weight in tickers_with_weight {
            // Validate weight
            if ticker_with_weight.weight <= 0.0 {
                return Err("Invalid weight: Must be a positive number.".to_string());
            }

            let ticker_id = get_ticker_id(ticker_with_weight.ticker_symbol.clone())
                .await
                .map_err(|_| {
                    format!(
                        "Could not locate ticker ID for ticker symbol: {}",
                        ticker_with_weight.ticker_symbol
                    )
                })?;

            // Fetch the vector associated with the current ticker_id asynchronously
            let ticker_vector = get_ticker_vector(ticker_vector_config_key, ticker_id).await?;

            // Check if the aggregated_vector is empty, which will only be true for the first ticker
            if aggregated_vector.is_empty() {
                // Initialize the aggregated_vector with the values from the first ticker's vector,
                // scaling each value by the weight associated with this ticker.
                aggregated_vector = ticker_vector
                    .iter()
                    .map(|&value| value * ticker_with_weight.weight as f32)
                    .collect();
            } else {
                // If this is not the first ticker, add the current ticker's vector to the
                // aggregated_vector. Each element of the vector is scaled by the weight
                // associated with this ticker and then added to the corresponding element in the
                // aggregated_vector.
                for (i, &value) in ticker_vector.iter().enumerate() {
                    aggregated_vector[i] += value * ticker_with_weight.weight as f32;
                }
            }
        }

        // Calculate the total weight by summing up the quantities of all tickers
        let total_weight: f32 = tickers_with_weight.iter().map(|t| t.weight).sum();

        // Check if the total weight is zero, which would mean that the function can't generate a valid vector
        if total_weight == 0.0 {
            return Err("Total weight is zero, cannot generate a valid vector.".to_string());
        }

        // Normalize the aggregated_vector by dividing each element by the total weight.
        // This step essentially computes the weighted average of the vectors.
        for value in &mut aggregated_vector {
            *value /= total_weight;
        }

        // Return the resulting aggregated and normalized vector
        Ok(aggregated_vector)
    }
}

async fn get_ticker_vector(
    ticker_vector_config_key: &str,
    ticker_id: TickerId,
) -> Result<Vec<f32>, String> {
    let owned_ticker_vectors =
        OwnedTickerVectors::get_all_ticker_vectors(ticker_vector_config_key).await?;
    let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

    // Get the vectors, which is an Option containing a flatbuffers::Vector
    if let Some(vectors) = ticker_vectors.vectors() {
        // Loop through each ticker vector in the Vector
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            // FIXME: Fix IDL so it doesn't have to cast
            if ticker_vector.ticker_id() as TickerId == ticker_id {
                // Convert the vector to a Rust Vec<f32> and return it
                if let Some(vector_data) = ticker_vector.vector() {
                    let vector: Vec<f32> = vector_data.iter().collect();
                    return Ok(vector);
                } else {
                    return Err(
                        format!("No vector data found for ticker ID {}", ticker_id).to_string()
                    );
                }
            }
        }
    }

    // If the ticker_id was not found, return an error
    Err(format!("Ticker ID {} not found", ticker_id).to_string())
}

fn get_ticker_vector_and_pca<'a>(
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
