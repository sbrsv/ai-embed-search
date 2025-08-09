import { createEmbedder } from '../../src/index.ts';
import { initEmbedder, embed, searchV2 } from '../../src/index.ts';

const embedder = await createEmbedder({ provider: 'xenova' });

initEmbedder({ embedder });

await embed([
    { id: '1', text: 'The Eiffel Tower is in Paris.' },
    { id: '2', text: 'Mount Fuji is in Japan.' },
    { id: '3', text: 'The Louvre is a famous museum.' },
]);

const top = await searchV2('famous museum in Paris');
const topProb = await searchV2('famous museum in Paris', { strategy: 'softmax', temperature: 0.5 });
const diverse = await searchV2('travel landmarks', { strategy: 'mmr', mmrLambda: 0.7, maxItems: 8 });

console.log('Top results:', top);
console.log('Top results with probabilities:', topProb);
console.log('Diverse results:', diverse);
