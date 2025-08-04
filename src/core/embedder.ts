import { pipeline } from '@xenova/transformers/src/transformers.js';

export async function createEmbedder() {
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    return async (text: string): Promise<number[]> => {
        const result = await embedder(text, {
            pooling: 'mean',
            normalize: true,
        });

        return Array.from(result.data);
    };
}
