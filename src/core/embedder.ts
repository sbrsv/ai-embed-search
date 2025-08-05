import {EmbedFn} from "../types.ts";

interface EmbedderOptions {
    provider?: 'xenova' | 'openai';
    model?: string;
    openaiApiKey?: string;
}

export async function createEmbedder({
        provider = 'xenova',
        model = 'Xenova/all-MiniLM-L6-v2',
        openaiApiKey,
    }: EmbedderOptions = {}
): Promise<EmbedFn> {

    if (provider === 'xenova') {
        // @ts-ignore
        const { pipeline } = await import('@xenova/transformers/src/transformers.js');
        const embedder = await pipeline('feature-extraction', model);

        return async (text: string): Promise<number[]> => {
            const result = await embedder(text, {
                pooling: 'mean',
                normalize: true,
            });
            return Array.from(result.data);
        };
    }

    if (provider === 'openai') {
        if (!openaiApiKey) throw new Error('Missing OpenAI API key');

        const endpoint = 'https://api.openai.com/v1/embeddings';
        const modelName = model || 'text-embedding-3-small';

        return async (text: string): Promise<number[]> => {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`,
                },
                body: JSON.stringify({
                    input: text,
                    model: modelName,
                }),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(`OpenAI error: ${JSON.stringify(json)}`);
            }

            return json.data[0].embedding;
        };
    }

    throw new Error(`Unknown provider: ${provider}`);
}
