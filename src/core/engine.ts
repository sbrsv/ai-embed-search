import {cosineSimilarity} from '../utils/cosine.ts';
import {vectorStore} from './vectorStore.ts';
import {getCached, setCached} from './cache.ts';
import type {EmbedFn, SearchItem, SearchResult} from '../types.ts';

let embedFn: EmbedFn;

export function init(options: { embedder: EmbedFn }) {
    embedFn = options.embedder;
}

export async function embed(items: SearchItem[]) {
    if (!embedFn) throw new Error('searchwiz: embedder not initialized');

    for (const item of items) {
        const vector = await embedFn(item.text);
        vectorStore.push({
            id: item.id,
            text: item.text,
            vector,
            meta: item.meta,
        });
    }
}


export function search(query: string, maxItems = 5) {
    let filterFn: (result: SearchResult) => boolean = () => true;

    const runSearch = async (): Promise<SearchResult[]> => {
        if (!embedFn) throw new Error('searchwiz: embedder not initialized');

        const cached = getCached(query, maxItems);
        if (cached) return cached.filter(filterFn);

        const queryVec = await embedFn(query);

        return vectorStore
            .map((entry) => ({
                id: entry.id,
                text: entry.text,
                score: cosineSimilarity(entry.vector, queryVec),
                meta: entry.meta,
            }))
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
        },
    };
}
