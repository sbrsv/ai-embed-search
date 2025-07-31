import { createEmbedder } from '../src/embedder.js';

const run = async () => {
    const embed = await createEmbedder();
    const vec = await embed('iPhone 15');
    console.log(vec.slice(0, 5));
};

run();
