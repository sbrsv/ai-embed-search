import type { SearchResult } from '../types.js';

const cache = new Map<string, { expires: number; result: SearchResult[] }>();

export function getCached(query: string, maxItems: number): SearchResult[] | null {
    const key = `${query}:${maxItems}`;
    const cached = cache.get(key);
    return cached && cached.expires > Date.now() ? cached.result : null;
}

export function setCached(query: string, maxItems: number, seconds: number, result: SearchResult[]) {
    const key = `${query}:${maxItems}`;
    cache.set(key, {
        expires: Date.now() + seconds * 1000,
        result,
    });
}
