// src/types.ts
export type Meta = Record<string, any>;

export interface SearchItem {
    id: string;
    text: string;
    meta?: Meta;
}

export interface VectorEntry {
    id: string;
    text: string;
    vector: number[];
    meta?: Meta;
}

export interface SearchResult {
    id: string;
    text: string;
    score: number; // similarity
    meta?: Meta;
}

export interface SoftmaxSearchResult extends SearchResult {
    probability: number;
    confidence: number;
}

// NEW: embed fn now supports string or string[] and returns aligned output.
export type EmbedFn =
    ((text: string) => Promise<number[]>) &
    ((texts: string[]) => Promise<number[][]>);

// ---- options for the new search API
export type SearchStrategy = 'cosine' | 'softmax' | 'mmr';

export interface SearchOptions {
    maxItems?: number;
    strategy?: SearchStrategy;
    temperature?: number; // for softmax
    mmrLambda?: number;   // 0..1, for MMR tradeoff (relevance vs diversity)
    filter?: (r: SearchResult) => boolean;
}
