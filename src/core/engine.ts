import {cosineSimilarity} from '../utils/cosine.ts';
import {vectorStore} from './vectorStore.ts';
import {getCached, setCached} from './cache.ts';
import {EmbedFn, SearchItem, SearchResult, SoftmaxSearchResult} from '../types.ts';
import {softmax} from "./softmax.ts";

let embedFn: EmbedFn;

export function initEmbedder(options: { embedder: EmbedFn }) {
    embedFn = options.embedder;
}

export async function embed(items: SearchItem[]): Promise<void> {
    if (!embedFn) throw new Error('ai-search: embedder not initialized');

    const texts = items.map(item => item.text);

    let vectors: number[][];

    try {
        const batchResult = await (embedFn as any)(texts);

        if (Array.isArray(batchResult) && Array.isArray(batchResult[0])) {
            vectors = batchResult as number[][];
        } else {
            throw new Error('Embed function did not return batch output');
        }
    } catch {
        vectors = [];
        for (const text of texts) {
            const vector = await (embedFn as (text: string) => Promise<number[]>)(text);
            vectors.push(vector);
        }
    }

    for (let i = 0; i < items.length; i++) {
        vectorStore.push({
            id: items[i].id,
            text: items[i].text,
            vector: vectors[i],
            meta: items[i].meta
        });
    }
}


export function search(query: string, maxItems = 5) {
    let filterFn: (result: SearchResult) => boolean = () => true;

    const runSearch = async (): Promise<SearchResult[]> => {
        if (!embedFn) throw new Error('ai-search: embedder not initialized');

        const cached = getCached(query, maxItems);
        if (cached) return cached.filter(filterFn);

        const queryVec = await (embedFn as (text: string) => Promise<number[]>)(query);

        const results = vectorStore.map(entry => ({
            id: entry.id,
            text: entry.text,
            score: cosineSimilarity(entry.vector, queryVec),
            meta: entry.meta
        }));

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, maxItems)
            .filter(filterFn);
    };

    return {
        filter(fn: (result: SearchResult) => boolean) {
            filterFn = fn;
            return this;
        },
        exec: async () => await runSearch(),
        cacheFor: async (seconds: number) => {
            const result = await runSearch();
            setCached(query, maxItems, seconds, result);
            return result;
        }
    };
}

export async function getSimilarItems(id: string, maxItems = 5): Promise<SearchResult[]> {
    const target = vectorStore.find(item => item.id === id);
    if (!target) throw new Error(`Item with id ${id} not found`);

    const results = vectorStore
        .filter(entry => entry.id !== id)
        .map(entry => ({
            id: entry.id,
            text: entry.text,
            score: cosineSimilarity(entry.vector, target.vector),
            meta: entry.meta
        }));

    return results.sort((a, b) => b.score - a.score).slice(0, maxItems);
}

export async function searchWithSoftmax(query: string, maxItems = 5, temperature = 1): Promise<SoftmaxSearchResult[]> {
    if (!embedFn) throw new Error('ai-search: embedder not initialized');

    const queryVec = await (embedFn as (text: string) => Promise<number[]>)(query);

    const rawResults = vectorStore.map(entry => ({
        id: entry.id,
        text: entry.text,
        score: cosineSimilarity(entry.vector, queryVec),
        meta: entry.meta
    }));

    const scores = rawResults.map(r => r.score);
    const probabilities = softmax(scores, temperature);

    return rawResults
        .map((res, i) => ({
            ...res,
            probability: probabilities[i]
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, maxItems);
}