import {cosineSimilarity} from './utils/cosine';

export type SearchItem = {
    id: string;
    text: string;
};

export type SearchResult = {
    id: string;
    text: string;
    score: number;
};

type EmbedFn = (text: string) => Promise<number[]>;

let embedFn: EmbedFn;
let vectorStore: { id: string; text: string; vector: number[] }[] = [];

/**
 * Initialize embedding engine
 */
export function init(options: { embedder: EmbedFn }) {
    embedFn = options.embedder;
}

/**
 * Embed and store multiple items
 */
export async function embed(items: SearchItem[]) {
    if (!embedFn) throw new Error('searchwiz: embedder not initialized');

    for (const item of items) {
        const vector = await embedFn(item.text);
        vectorStore.push({ id: item.id, text: item.text, vector });
    }
}

/**
 * Semantic search
 */
export async function search(query: string, maxItems = 5): Promise<SearchResult[]> {
    if (!embedFn) throw new Error('searchwiz: embedder not initialized');

    const queryVec = await embedFn(query);

    return vectorStore
        .map((entry) => ({
            id: entry.id,
            text: entry.text,
            score: cosineSimilarity(entry.vector, queryVec),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems);
}
