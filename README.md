# 🔍 ai-embed-search — Lightweight AI Semantic Search Engine

[![NPM version](https://img.shields.io/npm/v/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![Downloads](https://img.shields.io/npm/dm/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/ai-embed-search)](https://bundlephobia.com/package/ai-embed-search)
[![Types](https://img.shields.io/npm/types/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![GitHub Stars](https://img.shields.io/github/stars/sbrsv/ai-embed-search?style=social)](https://github.com/sbrsv/ai-embed-search)

> **Smart. Simple. Local.**  
> AI-powered semantic search in TypeScript using transformer embeddings.  
> No cloud, no API keys — **100% offline**.

<p align="center">
  <a href="https://www.producthunt.com/products/ai-embed-search?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ai-embed-search" target="_blank">
    <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1002358&theme=dark" alt="ai-embed-search - Local semantic search engine with transformer embeddings | Product Hunt" width="250" height="54" />
  </a>
</p>

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
  { id: '1', text: 'iPhone 15 Pro Max' },
  { id: '2', text: 'Samsung Galaxy S24 Ultra' },
  { id: '3', text: 'Apple MacBook Pro' }
]);

const results = await search('apple phone', 2).exec();
console.log(results);
```
Result:
```typescript
[
  { id: '1', text: 'iPhone 15 Pro Max', score: 0.95 },
  { id: '3', text: 'Apple MacBook Pro', score: 0.85 }
]
```

### 🧠 1. Initialize the Embedding Model
✅ Option A: Use the default local model (Xenova MiniLM)
```typescript
import { createEmbedder, initEmbedder } from 'ai-embed-search';

const embedder = await createEmbedder();
await initEmbedder({ embedder });
```
This uses the free, local model via @xenova/transformers. No internet or API key required.

✅ Option B: Use OpenAI Embedding API
```typescript
const embedder = await createEmbedder({
    provider: 'openai',
    model: 'text-embedding-3-small', // or 'text-embedding-ada-002'
    openaiApiKey: 'sk-proj-...',
});
await initEmbedder({ embedder });
```
💡 Note: Requires a valid OpenAI API key and billing setup. See your usage dashboard for quota.

### 📥 2. Add Items to the Vector Store
#### Add Items
You can now add and manage embeddings in multiple ways depending on your use case:
```embed(items)``` Embeds and stores vector representations of the given items. Replaces existing items with the same id.
```typescript
import { embed } from 'ai-embed-search';

await embed([
  { id: 'a1', text: 'Tesla Model S' },
  { id: 'a2', text: 'Electric Vehicle by Tesla' }
]);
```
#### Replace All Items
```replaceAllItems(items)```
Clears the vector store and adds fresh embeddings for the provided items.
```typescript
import { replaceAllItems } from 'ai-embed-search';

await replaceAllItems([
    { id: 'p1', text: 'iPhone 15 Pro Max' },
    { id: 'p2', text: 'Apple’s flagship smartphone' }
]);
````
#### Load Items from File and Embed
```loadItemsFromFile(path)``` Reads a JSON file of items ```(SearchItem[])``` and embeds them.
````typescript
import { loadItemsFromFile } from 'ai-embed-search';

await loadItemsFromFile('examples/products.json');
````
File format:
```json
[
  { "id": "1", "text": "iPhone 15 Pro Max" },
  { "id": "2", "text": "Samsung Galaxy S24 Ultra" },
  { "id": "3", "text": "Apple MacBook Pro" }
]
```

#### Load Precomputed Embeddings
```loadEmbeds(path)```
Loads a JSON file of precomputed embeddings ```(VectorEntry[])``` directly without recomputing vectors.
```typescript
import { loadEmbeds } from 'ai-embed-search';

await loadEmbeds('examples/vectors.json');
````
File format:
```typescript
[
  {
    "id": "1",
    "text": "Pixel 9 Pro",
    "vector": [0.23, 0.11, ...],
    "meta": { "brand": "Google" }
  }
]

```

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
    {
        id: '9',
        text: 'Apple Watch Ultra 2',
        score: 0.812,
        probability: 0.39,
        confidence: 0.82
    },
    {
        id: '3',
        text: 'Apple Vision Pro',
        score: 0.772,
        probability: 0.31,
        confidence: 0.82
    },
    {
        id: '1',
        text: 'iPhone 15 Pro Max',
        score: 0.695,
        probability: 0.18,
        confidence: 0.82
    },
    ...
]
```
How It Works:
1. Cosine similarities between the query and each item are computed.
2. The scores are scaled by a temperature T and passed through the softmax function:
```math
softmax(sᵢ) = exp(sᵢ / T) / ∑ⱼ exp(sⱼ / T)
```
Where `sᵢ` is the similarity score for item `i`, and `T` is the temperature parameter.
3. We compute the entropy H(p) of the resulting probability distribution:
```math
H(p) = -∑ᵢ pᵢ log(pᵢ)
```
This measures the uncertainty in the result:
- Low entropy ⇒ confident, peaked distribution
- High entropy ⇒ uncertain, flat distribution
4. We normalize entropy to get a confidence score between 0 and 1:
```math
confidence = 1 - (H(p) / log(N))
```
Where n is the number of candidates (the maximum entropy is log(n)).

### 🔥 Temperature Intuition

| Temperature | Behavior                    | Use Case                   |
| ----------- | --------------------------- | -------------------------- |
| 0.1–0.5     | Very sharp, top-1 dominates | Deterministic ranking      |
| 1.0         | Balanced                    | Ranked probabilities       |
| 1.5+        | Softer, more diverse        | Random sampling / fallback |

### 📌 Use Cases
- ✅ Probabilistic ranking — get soft scores for relevance
- 🎯 Sampling — return one of top-k randomly with smart weighting
- 🧠 Uncertainty estimation — use entropy/confidence to inform users
- ⚡️ Hybrid search — combine softmax scores with metadata (e.g., tags, categories, prices)


### 🔁 9. Query Expansion via Embedding Neighbors
Query Expansion improves recall and relevance by augmenting the query with its nearest semantic neighbors. Instead of matching only the raw query embedding, we blend it with embeddings of the top-N similar items to form an expanded query vector.
```typescript
import { searchWithExpansion } from 'ai-embed-search';

const results = await searchWithExpansion('ai car', 5, 3);
console.log(results);
```
Example output:
```typescript
[
    { id: '1', text: 'Tesla Model S', score: 0.88 },
    { id: '2', text: 'Electric Vehicle by Tesla', score: 0.85 },
    { id: '3', text: 'Nissan Leaf EV', score: 0.80 }
]
```
How It Works:
1. Embed the query: v₀ = embed(query)
2. Find top-k nearest items in the vector store (based on cosine similarity).
3. Average their vectors with the query vector:
```math
v_expanded = (v₀ + ∑ᵢ vᵢ) / (1 + k)
```
4. Perform final search using v_expanded.

This process makes vague queries like "ai car" match "Tesla", "EV", or "autopilot" even if those words are not directly in the query.

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

### `searchWithExpansion(query: string, limit: number, neighbors: number)`
Search using an expanded query vector formed by blending the input with its neighbors most similar vectors. Useful for handling vague or underdefined queries.

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
