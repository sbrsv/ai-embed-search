import {EmbedFn} from "../types.ts";

function l2norm(vec: number[]): number[] {
    const eps = 1e-12;
    let s = 0;
    for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
    s = Math.sqrt(s) + eps;
    const out = new Array(vec.length);
    for (let i = 0; i < vec.length; i++) out[i] = vec[i] / s;
    return out;
}

interface EmbedderOptions {
    provider?: 'xenova' | 'openai';
    model?: string;
    openaiApiKey?: string;
}

export async function createEmbedder({
                                         provider = 'xenova',
                                         model = 'Xenova/all-MiniLM-L6-v2',
                                         openaiApiKey,
                                     }: EmbedderOptions = {}): Promise<EmbedFn> {

    if (provider === 'xenova') {
        // @ts-ignore
        const { pipeline } = await import('@xenova/transformers/src/transformers.js');
        const embedder = await pipeline('feature-extraction', model);

        return (async (input: string | string[]): Promise<number[] | number[][]> => {
            const res = await embedder(input, {pooling: 'mean', normalize: false});
            const data: number[] = Array.from(res.data);
            const dims: number[] = Array.isArray(res.dims) ? res.dims : [res.dims]; // safety

            if (Array.isArray(input)) {
                const batch = dims.length === 2 ? dims[0] : 1;
                const dim = dims.length === 2 ? dims[1] : dims[0];
                const out: number[][] = new Array(batch);
                for (let i = 0; i < batch; i++) {
                    const start = i * dim;
                    const row = data.slice(start, start + dim);
                    out[i] = l2norm(row);
                }
                return out;
            } else {
                return l2norm(data);
            }
        }) as EmbedFn;
    }

    if (provider === 'openai') {
        if (!openaiApiKey) throw new Error('Missing OpenAI API key');
        const endpoint = 'https://api.openai.com/v1/embeddings';
        const modelName = model || 'text-embedding-3-small';

        return (async (input: string | string[]): Promise<number[] | number[][]> => {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`,
                },
                body: JSON.stringify({input, model: modelName}),
            });
            const json = await response.json();
            if (!response.ok) throw new Error(`OpenAI error: ${JSON.stringify(json)}`);

            const list = (json.data as Array<{ embedding: number[] }>).map(d => l2norm(d.embedding));
            return Array.isArray(input) ? list : list[0];
        }) as EmbedFn;
    }

    throw new Error(`Unknown provider: ${provider}`);
}
