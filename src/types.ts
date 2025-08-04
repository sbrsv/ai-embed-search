export type SearchItem = {
    id: string;
    text: string;
    meta?: Record<string, any>;
};

export type SearchResult = {
    id: string;
    text: string;
    score: number;
    meta?: Record<string, any>;
};

export interface SoftmaxSearchResult extends SearchResult {
    probability: number;
    confidence: number;
}

export type EmbedFn = ((text: string) => Promise<number[]>) |
    ((texts: string[]) => Promise<number[][]>);


export type VectorEntry = {
    id: string;
    text: string;
    vector: number[];
    meta?: Record<string, any>;
};
