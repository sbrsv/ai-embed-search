import {cosineSimilarity} from '../utils/cosine.ts';
import {clearVectors, vectorStore} from './vectorStore.ts';
import {getCached, setCached} from './cache.ts';
import {EmbedFn, SearchItem, SearchResult, SoftmaxSearchResult, VectorEntry} from '../types.ts';
import {softmax} from "./softmax.ts";
import {entropy} from "./entropy.ts";
import { searchWithExpansion as _searchWithExpansion } from './expansion.ts';
import path from "path";
import fs from "fs/promises";

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

    const existingIds = new Set(items.map(item => item.id));

    for (let i = vectorStore.length - 1; i >= 0; i--) {
        if (existingIds.has(vectorStore[i].id)) {
            vectorStore.splice(i, 1);
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

export async function replaceAllItems(items: SearchItem[]): Promise<void> {
    clearVectors();
    await embed(items);
}

export async function loadItemsFromFile(filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const items: SearchItem[] = JSON.parse(content);
    await replaceAllItems(items);
}

export async function loadEmbeds(filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const items: VectorEntry[] = JSON.parse(content);
    clearVectors();
    for (const item of items) {
        if (!item.vector || !Array.isArray(item.vector)) {
            throw new Error(`Item with id ${item.id} is missing a valid vector`);
        }
        vectorStore.push(item);
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

export async function searchWithSoftmax(query: string, maxItems = 5, temperature = 1): Promise<(SoftmaxSearchResult)[]> {
    if (!embedFn) throw new Error('ai-search: embedder not initialized');

    const queryVec = await (embedFn as (text: string) => Promise<number[]>)(query);

    const rawResults = vectorStore.map(entry => ({
        id: entry.id,
        text: entry.text,
        score: cosineSimilarity(entry.vector, queryVec),
        meta: entry.meta
    }));

    const scores = rawResults.map(r => r.score);
    const probs = softmax(scores, temperature);

    const H = entropy(probs);
    const maxEntropy = Math.log(probs.length);
    const confidence = 1 - H / maxEntropy;

    return rawResults
        .map((res, i) => ({
            ...res,
            probability: probs[i],
            confidence
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, maxItems);
}

export function searchWithExpansion(query: string, maxItems = 5, neighbors = 3) {
    return _searchWithExpansion(query, embedFn, maxItems, neighbors);
}