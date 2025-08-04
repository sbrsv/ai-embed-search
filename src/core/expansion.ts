import { cosineSimilarity } from '../utils/cosine.ts';
import { vectorStore } from './vectorStore.ts';
import type { SearchResult, EmbedFn } from '../types.ts';

export async function searchWithExpansion(
    query: string,
    embedFn: EmbedFn,
    maxItems = 5,
    neighbors = 3
): Promise<SearchResult[]> {
    if (!embedFn) throw new Error('ai-search: embedder not initialized');
    if (vectorStore.length === 0) return [];

    const queryVec = await (embedFn as (text: string) => Promise<number[]>)(query);

    const similar = vectorStore
        .map(entry => ({
            ...entry,
            score: cosineSimilarity(entry.vector, queryVec),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, neighbors);

    const expandedVec = Array.from({ length: queryVec.length }, (_, i) => {
        const neighborSum = similar.reduce((acc, item) => acc + item.vector[i], 0);
        return (queryVec[i] + neighborSum) / (neighbors + 1);
    });

    const results = vectorStore.map(entry => ({
        id: entry.id,
        text: entry.text,
        score: cosineSimilarity(entry.vector, expandedVec),
        meta: entry.meta
    }));

    return results.sort((a, b) => b.score - a.score).slice(0, maxItems);
}
