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
import { initEmbedder, embed, search } from 'ai-embed-search';

await initEmbedder();

await embed([
  { id: '1', text: 'iPhone 15 Pro Max', meta: { brand: 'Apple', type: 'phone' } },
  { id: '2', text: 'Samsung Galaxy S24 Ultra', meta: { brand: 'Samsung', type: 'phone' } },
  { id: '3', text: 'Apple MacBook Pro', meta: { brand: 'Apple', type: 'laptop' } }
]);

const results = await search('apple phone', 2);
console.log(results);
/*
[
  { id: '1', text: 'iPhone 15 Pro Max', meta: { brand: 'Apple', type: 'phone' }, score: 0.92 },
  { id: '3', text: 'Apple MacBook Pro', { brand: 'Apple', type: 'laptop' }, score: 0.75 }
]
*/
```

### 🧠 1. Initialize the Embedding Model
```typescript
import { initEmbedder } from 'ai-embed-search';

await initEmbedder();
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

const results = await search('fast electric car', 3);
```
Returns:
```typescript
[
  { id: 'a1', text: 'Tesla Model S', score: 0.95 },
  { id: 'a2', text: 'Electric Vehicle by Tesla', score: 0.85 }
]
```

### 💾 6. Search with Cached Embeddings (Advanced)
You can store precomputed embeddings in your own DB or file:
```typescript
const precomputed = {
  id: 'x1',
  text: 'Apple Watch Series 9',
  vector: [0.11, 0.32, ...] // 384-dim array
};
```
Then use cosine similarity to search across them, or build your own vector store using ai-embed-search functions.

### 🧹 7. Clear the Vector Store

```typescript
import { clearStore } from 'ai-embed-search';

clearStore(); // Removes all embedded data from memory
```

## 📖 API Reference
### `initEmbedder()`
Initializes the embedding model. Must be called once before using `embed` or `search`.

### `embed(items: { id: string, text: string }[])`
Embeds and stores the provided items in the vector store. Each item must have a unique `id` and `text`.

### `search(query: string)`
Performs a semantic search for the given query. Returns up to `limit` results sorted by similarity score (default is 5).

### `cacheFor(limit: number)`
Caches the embeddings for the next `limit` search queries. This is useful for optimizing performance when you know you'll be searching multiple times.

### `clearStore()`
Clears all embedded data from the vector store, freeing up memory.


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




