pub fn levenshtein_distance(a: &str, b: &str) -> usize {
    let mut costs = vec![0; b.len() + 1];

    for j in 0..=b.len() {
        costs[j] = j;
    }

    for (i, ca) in a.chars().enumerate() {
        let mut last_cost = i;
        costs[0] = i + 1;

        for (j, cb) in b.chars().enumerate() {
            let new_cost = if ca == cb { last_cost } else { last_cost + 1 };

            last_cost = costs[j + 1];
            costs[j + 1] = std::cmp::min(std::cmp::min(costs[j] + 1, costs[j + 1] + 1), new_cost);
        }
    }

    costs[b.len()]
}
