// src/core/utils/mmr.ts
// Maximal Marginal Relevance selection
// refs: Carbonell & Goldstein, 1998
import { SearchResult } from "../../types.ts";

// expects all vectors normalized so cosine == dot product
export function mmr(
    candidates: (SearchResult & { vector?: number[] })[],
    queryVec: number[],
    k: number,
    lambda = 0.5
): SearchResult[] {
    const chosen: (SearchResult & { vector?: number[] })[] = [];
    const pool = candidates.slice();

    const sim = (a?: number[], b?: number[]) => {
        if (!a || !b) return -Infinity;
        let s = 0;
        for (let i = 0; i < a.length && i < b.length; i++) s += a[i] * b[i];
        return s;
    };

    while (chosen.length < k && pool.length > 0) {
        let bestIdx = 0;
        let bestScore = -Infinity;

        for (let i = 0; i < pool.length; i++) {
            const c = pool[i];
            const relevance = sim((c as any).vector, queryVec);
            let diversityPenalty = 0;

            if (chosen.length > 0) {
                let maxSim = -Infinity;
                for (const ch of chosen) {
                    const s = sim((c as any).vector, (ch as any).vector);
                    if (s > maxSim) maxSim = s;
                }
                diversityPenalty = maxSim;
            }

            const mmrScore = lambda * relevance - (1 - lambda) * diversityPenalty;
            if (mmrScore > bestScore) {
                bestScore = mmrScore;
                bestIdx = i;
            }
        }

        chosen.push(pool.splice(bestIdx, 1)[0]);
    }

    // return without vectors
    return chosen.map(({ vector, ...rest }) => rest);
}
