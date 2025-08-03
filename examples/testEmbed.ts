import {
    initEmbedder,
    embed,
    saveVectors,
    loadVectors,
    search,
    _vectorStore,
    createEmbedder,
    getSimilarItems,
} from '../src/index.ts';
import fs from 'fs/promises';
import path from 'path';

const VECTORS_PATH = path.resolve('examples/vectors.json');

const items = [
    { id: '1', text: 'iPhone 15 Pro Max with OLED display', meta: { brand: 'Apple', type: 'phone' } },
    { id: '2', text: 'Samsung Galaxy S24 Ultra smartphone', meta: { brand: 'Samsung', type: 'phone' } },
    { id: '3', text: 'Apple MacBook Air M3 laptop', meta: { brand: 'Apple', type: 'laptop' } },
    { id: '4', text: 'Sony WH-1000XM5 wireless headphones', meta: { brand: 'Sony', type: 'audio' } },
    { id: '5', text: 'Dell XPS 13 ultrabook', meta: { brand: 'Dell', type: 'laptop' } },
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
}

fullTest();
