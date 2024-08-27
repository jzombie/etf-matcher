include!("flatbuffers/financial_vectors.tenk_generated.rs");
use crate::types::TickerId;
use crate::utils;
use crate::DataURL;
use financial_vectors::ten_k::root_as_ticker_vectors;
use financial_vectors::ten_k::TickerVectors;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct TickerDistance {
    pub ticker_id: TickerId,
    pub distance: f32,
    pub original_pca_coords: Vec<f32>,
    pub translated_pca_coords: Vec<f32>,
}

#[derive(Debug, Clone)]
pub struct CosineSimilarityResult {
    pub ticker_id: TickerId,
    pub similarity_score: f32,
}

#[derive(Deserialize)]
pub struct TickerWithQuantity {
    pub ticker_id: TickerId,
    // Float is used to allow usage of fractional shares
    pub quantity: f32,
}

pub struct OwnedTickerVectors {
    #[allow(dead_code)]
    /// Holds the raw data to ensure that `ticker_vectors` has a valid reference.
    data: Vec<u8>,
    ticker_vectors: TickerVectors<'static>,
}

impl OwnedTickerVectors {
    async fn get_all_ticker_vectors() -> Result<OwnedTickerVectors, String> {
        let url = DataURL::FinancialVectors10K.value();
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

                        let translated_pca_coords = original_pca_coords
                            .iter()
                            .zip(target_pca_coords)
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
        Ok(results.into_iter().take(20).collect())
    }

    // TODO: Rename (subsequent PR)
    // Wrapper function for finding closest tickers by `ticker_id`
    pub async fn find_closest_tickers(ticker_id: TickerId) -> Result<Vec<TickerDistance>, String> {
        let owned_ticker_vectors = OwnedTickerVectors::get_all_ticker_vectors().await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let (target_vector, target_pca_coords) =
            match find_target_vector_and_pca(&ticker_vectors, ticker_id) {
                Some(result) => result,
                None => return Err("Ticker ID or PCA coordinates not found.".to_string()),
            };

        Self::find_closest_tickers_by_vector(
            &target_vector.iter().collect::<Vec<_>>(),
            &target_pca_coords,
            &ticker_vectors,
            Some(&[ticker_id]), // Ensure the current ticker is excluded
        )
        .await
    }

    pub async fn triangulate_pca_coordinates(user_vector: Vec<f32>) -> Result<Vec<f32>, String> {
        let owned_ticker_vectors = OwnedTickerVectors::get_all_ticker_vectors().await?;
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

                        // TODO: Determine if this epsilon value is actually needed (subsequent PR)
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
    // TODO: Rename (subsequent PR)
    pub async fn rank_tickers_by_cosine_similarity(
        ticker_id: TickerId,
    ) -> Result<Vec<CosineSimilarityResult>, String> {
        let owned_ticker_vectors = OwnedTickerVectors::get_all_ticker_vectors().await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let (target_vector, _target_pca_coords) =
            match find_target_vector_and_pca(&ticker_vectors, ticker_id) {
                Some(result) => result,
                None => return Err("Ticker ID or PCA coordinates not found.".to_string()),
            };

        let mut results: Vec<CosineSimilarityResult> = ticker_vectors
            .vectors()
            .ok_or("No vectors found.")?
            .iter()
            .filter_map(|ticker_vector| {
                // Exclude the current ticker ID
                if ticker_vector.ticker_id() as TickerId != ticker_id {
                    ticker_vector.vector().map(|other_vector| {
                        let similarity = CosineSimilarityResult::cosine_similarity(
                            &target_vector.iter().collect::<Vec<_>>(),
                            &other_vector.iter().collect::<Vec<_>>(),
                        );

                        CosineSimilarityResult {
                            ticker_id: ticker_vector.ticker_id() as TickerId,
                            similarity_score: similarity,
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

    // TODO: Rename (subsequent PR)
    pub async fn rank_tickers_by_custom_vector_cosine_similarity(
        custom_vector: Vec<f32>,
    ) -> Result<Vec<CosineSimilarityResult>, String> {
        let owned_ticker_vectors = OwnedTickerVectors::get_all_ticker_vectors().await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        let mut results: Vec<CosineSimilarityResult> = ticker_vectors
            .vectors()
            .ok_or("No vectors found.")?
            .iter()
            .filter_map(|ticker_vector| {
                ticker_vector.vector().map(|other_vector| {
                    let similarity = Self::cosine_similarity(
                        &custom_vector,
                        &other_vector.iter().collect::<Vec<f32>>()[..],
                    );

                    CosineSimilarityResult {
                        ticker_id: ticker_vector.ticker_id() as TickerId,
                        similarity_score: similarity,
                    }
                })
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
}

impl TickerWithQuantity {
    // TODO: Rename (subsequent PR)
    pub async fn find_closest_tickers_by_quantity(
        tickers_with_quantity: &Vec<TickerWithQuantity>,
    ) -> Result<Vec<TickerDistance>, String> {
        // Generate the custom vector based on the quantities of the tickers
        let custom_vector = Self::generate_bucket_vector(tickers_with_quantity).await?;

        // Triangulate the PCA coordinates for the custom vector
        let custom_pca_coords =
            TickerDistance::triangulate_pca_coordinates(custom_vector.clone()).await?;

        // Call the base method directly with the custom vector and triangulated PCA coordinates
        let owned_ticker_vectors = OwnedTickerVectors::get_all_ticker_vectors().await?;
        let ticker_vectors = &owned_ticker_vectors.ticker_vectors;

        // Collect all ticker_ids in the input tickers_with_quantity to exclude them
        let exclude_ticker_ids: Vec<TickerId> = tickers_with_quantity
            .iter()
            .map(|ticker_with_quantity| ticker_with_quantity.ticker_id)
            .collect();

        TickerDistance::find_closest_tickers_by_vector(
            &custom_vector,
            &custom_pca_coords,
            &ticker_vectors,
            Some(&exclude_ticker_ids), // Pass the exclude_ticker_ids list
        )
        .await
    }

    async fn generate_bucket_vector(
        tickers_with_quantity: &Vec<TickerWithQuantity>,
    ) -> Result<Vec<f32>, String> {
        // Initialize an empty vector to hold the aggregated result
        let mut aggregated_vector: Vec<f32> = Vec::new();

        // Loop through each ticker in the input list, along with its corresponding quantity
        for ticker_with_quantity in tickers_with_quantity {
            // Validate quantity
            if ticker_with_quantity.quantity <= 0.0 {
                return Err("Invalid quantity: Must be a positive number.".to_string());
            }

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
        let total_quantity: f32 = tickers_with_quantity.iter().map(|t| t.quantity).sum();

        // Check if the total quantity is zero, which would mean that the function can't generate a valid vector
        if total_quantity == 0.0 {
            return Err("Total quantity is zero, cannot generate a valid vector.".to_string());
        }

        // Normalize the aggregated_vector by dividing each element by the total quantity.
        // This step essentially computes the weighted average of the vectors.
        for value in &mut aggregated_vector {
            *value /= total_quantity;
        }

        // Return the resulting aggregated and normalized vector
        Ok(aggregated_vector)
    }
}

// TODO: Use consistent naming for `get` and `find` (there's another method called `find_closest_tickers`)
async fn get_ticker_vector(ticker_id: TickerId) -> Result<Vec<f32>, String> {
    let owned_ticker_vectors = OwnedTickerVectors::get_all_ticker_vectors().await?;
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
                    return Err("No vector data found for the given Ticker ID".to_string());
                }
            }
        }
    }

    // If the ticker_id was not found, return an error
    Err("Ticker ID not found".to_string())
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
