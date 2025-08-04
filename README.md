# 🔍 AI-embed-search — Lightweight AI Semantic Search Engine

> **Smart. Simple. Local.**  
> AI-powered semantic search in TypeScript using transformer embeddings. No cloud, no API keys — 100% offline.

[![NPM version](https://img.shields.io/npm/v/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![Downloads](https://img.shields.io/npm/dm/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/ai-embed-search)](https://bundlephobia.com/package/ai-embed-search)
[![Types](https://img.shields.io/npm/types/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![License](https://img.shields.io/npm/l/ai-embed-search)](./LICENSE)


---

## 🚀 Features

- 🧠 AI-powered semantic understanding
- ✨ Super simple API: `init`, `embed`, `search`, `clear`
- ⚡️ Fast cosine similarity-based retrieval
- 📦 In-memory vector store (no DB required)
- 🧩 Save/load vectors to JSON file
- 🔍 Search filters, caching, batch embed & probabilistic softmax ranking
- 🧰 CLI-ready architecture
- 🌐 Fully offline via `@xenova/transformers` (WASM/Node)

---

## 📦 Installation

```bash
  npm install ai-embed-search
```

or

```bash
  yarn add ai-embed-search
```
Requires Node.js ≥ 18 or a modern browser for WASM.

## ⚡ Quick Start

```typescript
import {embed, search, createEmbedder, initEmbedder} from 'ai-embed-search';

const embedder = await createEmbedder();
await initEmbedder({ embedder });

await embed([
  { id: '1', text: 'iPhone 15 Pro Max', meta: { brand: 'Apple', type: 'phone' } },
  { id: '2', text: 'Samsung Galaxy S24 Ultra', meta: { brand: 'Samsung', type: 'phone' } },
  { id: '3', text: 'Apple MacBook Pro', meta: { brand: 'Apple', type: 'laptop' } }
]);

const results = await search('apple phone', 2).exec();
console.log(results);
```
Result:
```typescript
[
  { id: '1', text: 'iPhone 15 Pro Max', score: 0.95, meta: { brand: 'Apple', type: 'phone' } },
  { id: '3', text: 'Apple MacBook Pro', score: 0.85, meta: { brand: 'Apple', type: 'laptop' } }
]
```

### 🧠 1. Initialize the Embedding Model
```typescript
import { createEmbedder, initEmbedder } from 'ai-embed-search';

const embedder = await createEmbedder();
await initEmbedder({ embedder });
```
Loads the MiniLM model via @xenova/transformers. Required once at startup.

### 📥 2. Add Items to the Vector Store
```typescript
import { embed } from 'ai-embed-search';

await embed([
  { id: 'a1', text: 'Tesla Model S' },
  { id: 'a2', text: 'Electric Vehicle by Tesla' }
]);
```
Embeds and stores vector representations of the given items.

### 🔍 3. Perform Semantic Search
```typescript
import { search } from 'ai-embed-search';

const results = await search('fast electric car', 3).exec();
```
Returns:
```typescript
[
  { id: 'a1', text: 'Tesla Model S', score: 0.95 },
  { id: 'a2', text: 'Electric Vehicle by Tesla', score: 0.85 }
]
```
### 📦 4. Search with Metadata
You can add metadata to each item:
```typescript
const laptops = await search('computer', 5)
    .filter(r => r.meta?.type === 'laptop')
    .exec();
```

### 💾 5. Search with Cached Embeddings (Advanced)
You can store precomputed embeddings in your own DB or file:
```typescript
const precomputed = {
  id: 'x1',
  text: 'Apple Watch Series 9',
  vector: [0.11, 0.32, ...] // 384-dim array
};
```
Then use cosine similarity to search across them, or build your own vector store using ai-embed-search functions.

### 🧹 6. Clear the Vector Store

```typescript
import { removeVector, clearVectors } from 'ai-embed-search';

removeVector('a1');     // Remove by ID
clearVectors();         // Clear all vectors
```

### 🤝 7. Find Similar Items
You can retrieve the most semantically similar items to an existing one in the vector store:
```typescript
import { getSimilarItems } from 'ai-embed-search';

const similar = await getSimilarItems('1', 3);
console.log(similar);
```
Result:
```typescript
[
    { id: '2', text: 'Samsung Galaxy S24 Ultra smartphone', score: 0.93 },
    { id: '3', text: 'Apple MacBook Air M3 laptop', score: 0.87 },
    { id: '5', text: 'Dell XPS 13 ultrabook', score: 0.85 }
]
```
This is useful for recommendation systems, "related items" features, or clustering.

### 🔥 8. Probabilistic Search with Softmax Ranking

You can rank search results **probabilistically** using a temperature-scaled softmax over cosine similarity:

```ts
import { searchWithSoftmax } from 'ai-embed-search';

const results = await searchWithSoftmax('apple wearable', 5, 0.7);
console.log(results);
```
Result:
```typescript
[
    { id: '9', text: 'Apple Watch Ultra 2', probability: 0.39 },
    { id: '3', text: 'Apple Vision Pro', probability: 0.31 },
    { id: '1', text: 'iPhone 15 Pro Max', probability: 0.18 },
    ...
]
```
Temperature controls certainty:
low (e.g., 0.5): more confident, top-heavy
high (e.g., 1.5): more diverse, flatter distribution
Useful for sampling, ranking, or building "smart randomness" into recommendations.


## 📖 API Reference
### `initEmbedder()`
Initializes the embedding model. Must be called once before using `embed` or `search`.

### `embed(items: { id: string, text: string }[])`
Embeds and stores the provided items in the vector store. Each item must have a unique `id` and `text`.

### `search(query: string, limit: number)`
Performs a semantic search for the given query. Returns up to `limit` results sorted by similarity score (default is 5).

### `getSimilarItems(id: string,, limit: number)`
Finds the most similar items to the one with the given `id`. Returns up to `limit` results sorted by similarity score.

### `cacheFor(limit: number)`
Caches the embeddings for the next `limit` search queries. This is useful for optimizing performance when you know you'll be searching multiple times.

### `clearStore()`
Clears all embedded data from the vector store, freeing up memory.

### `searchWithSoftmax(query: string, limit: number, temperature: number)`
Performs a probabilistic search using softmax ranking. The `temperature` parameter controls the distribution sharpness:

## 🔧 Development
- Model: [MiniLM](https://huggingface.co/xenova/bert-base-uncased) via `@xenova/transformers`
- Vector type: 384-dim float32 array
- Similarity: Cosine similarity
- Storage: In-memory vector store (no database required)
- On-premises: Fully offline, no cloud dependencies

## 🌐 SEO Keywords
ai search, semantic search, local ai search, vector search, transformer embeddings, cosine similarity, open source search engine, text embeddings, in-memory search, local search engine, typescript search engine, fast npm search, embeddings in JS, ai search npm package

## License
MIT © 2025 Peter Sibirtsev

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.
