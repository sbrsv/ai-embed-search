export type SearchItem = {
    id: string;
    text: string;
};

export type SearchResult = {
    id: string;
    text: string;
    score: number;
};

export type EmbedFn = (text: string) => Promise<number[]>;
export type VectorEntry = { id: string; text: string; vector: number[] };
