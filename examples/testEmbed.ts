import {
    initEmbedder,
    embed,
    saveVectors,
    loadVectors,
    search,
    _vectorStore,
    createEmbedder,
    getSimilarItems,
    searchWithSoftmax,
} from '../src/index.ts';
import fs from 'fs/promises';
import path from 'path';

const VECTORS_PATH = path.resolve('examples/vectors.json');

const items = [
    { id: '1', text: 'iPhone 15 Pro Max with titanium frame and A17 chip', meta: { brand: 'Apple', type: 'phone' } },
    { id: '2', text: 'Samsung Galaxy Z Fold 6 foldable smartphone', meta: { brand: 'Samsung', type: 'phone' } },
    { id: '3', text: 'Apple Vision Pro spatial computer headset', meta: { brand: 'Apple', type: 'headset' } },
    { id: '4', text: 'Framework Laptop 16 modular notebook', meta: { brand: 'Framework', type: 'laptop' } },
    { id: '5', text: 'Steam Deck OLED handheld gaming console', meta: { brand: 'Valve', type: 'console' } },
    { id: '6', text: 'Google Pixel 9 Pro smartphone with AI camera', meta: { brand: 'Google', type: 'phone' } },
    { id: '7', text: 'Bose QuietComfort Ultra noise-cancelling headphones', meta: { brand: 'Bose', type: 'audio' } },
    { id: '8', text: 'Lenovo ThinkPad X1 Carbon Gen 11 business ultrabook', meta: { brand: 'Lenovo', type: 'laptop' } },
    { id: '9', text: 'Apple Watch Ultra 2 with rugged titanium design', meta: { brand: 'Apple', type: 'watch' } },
    { id: '10', text: 'Amazon Echo Show 10 smart display with Alexa', meta: { brand: 'Amazon', type: 'smart display' } },
];

async function fullTest() {
    console.log('🚀 Creating embedder...');
    const embedder = await createEmbedder();
    initEmbedder({ embedder });

    const fileExists = async (filePath: string) => {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    };

    if (!(await fileExists(VECTORS_PATH))) {
        console.log('🧠 Embedding and saving...');
        await embed(items);
        await fs.mkdir(path.dirname(VECTORS_PATH), { recursive: true });
        await saveVectors(VECTORS_PATH);
    } else {
        console.log('📂 Loading vectors from file...');
        await loadVectors(VECTORS_PATH);
    }

    console.log('\n🔍 Search: "big screen"');
    const results1 = await search('big screen', 3).exec();
    console.table(results1);

    console.log('\n💾 Cached search: "laptop" for 60s');
    const results2 = await search('laptop', 3).cacheFor(60);
    console.table(results2);

    const results3 = await search('laptop', 3).exec();
    console.log('\n🧪 Same result from cache:', JSON.stringify(results2) === JSON.stringify(results3));

    console.log('\n🎯 Filtered search: laptops only');
    const results4 = await search('computer', 5)
        .filter(r => r.meta?.type === 'laptop')
        .exec();
    console.table(results4);

    console.log('\n🤝 Similar to item "1" (iPhone 15 Pro Max)');
    const similarItems = await getSimilarItems('1', 3);
    console.table(similarItems);

    console.log('\n🔥 Softmax search: "apple wearable" with temperature=0.7');
    const softmaxResults = await searchWithSoftmax('apple wearable', 5, 0.7);
    console.table(softmaxResults.map(({ id, text, probability, confidence }) => ({
        id,
        text,
        probability: probability.toFixed(4),
        confidence: confidence.toFixed(4)
    })));
}

fullTest();
