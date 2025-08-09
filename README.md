# 🔍 ai-embed-search — Lightweight AI Semantic Search Engine

[![NPM version](https://img.shields.io/npm/v/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![Types](https://img.shields.io/npm/types/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
[![Downloads](https://img.shields.io/npm/dm/ai-embed-search)](https://www.npmjs.com/package/ai-embed-search)
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

- 🧠 **AI-powered semantic understanding** — finds meaning, not just keywords
- ⚡ **Fast cosine similarity-based retrieval** with normalized embeddings
- 📦 **In-memory vector store** — no database required, works in Node & browser
- 🧩 **Persistent storage** — save/load vectors to/from JSON files
- 🧰 **Batch embedding** — speed up indexing for large datasets
- 🔍 **Search filters & caching** — refine results and optimize repeated queries
- 🎯 **New `searchV2` unified API** — multiple ranking strategies in one call:
    - `cosine` — classic similarity ranking
    - `softmax` — probabilistic ranking with confidence scores
    - `mmr` — Maximal Marginal Relevance for diverse results
- 🧠 **Probabilistic softmax ranking** with entropy-based confidence
- 🔁 **Query expansion** — improve recall for vague searches
- 🤝 **Find similar items** — easy recommendation / related content
- 🌐 **Fully offline** via [`@xenova/transformers`](https://github.com/xenova/transformers.js) (WASM/Node) — no cloud, no API keys needed
- ☁ **Optional OpenAI embeddings** — `text-embedding-3-small` or others with one line of config
- 🖥 **CLI-ready architecture** — easily wrap into command-line tools or scripts

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
import {
    createEmbedder,
    initEmbedder,
    embed,
    search,     // classic API (kept for backward compat)
    searchV2     // unified advanced API (cosine | softmax | mmr)
} from 'ai-embed-search';

// 1) Initialize a local, offline embedder (Xenova MiniLM by default)
const embedder = await createEmbedder(); // or: { provider: 'openai', openaiApiKey: '...' }
await initEmbedder({ embedder });

// 2) Add items with optional metadata
await embed([
    { id: 'p1', text: 'Apple iPhone 15 Pro Max',       meta: { type: 'phone',  brand: 'Apple',   price: 1199 } },
    { id: 'p2', text: 'Samsung Galaxy S24 Ultra',       meta: { type: 'phone',  brand: 'Samsung', price: 1299 } },
    { id: 'p3', text: 'Apple MacBook Pro 14-inch M3',   meta: { type: 'laptop', brand: 'Apple',   price: 1999 } },
    { id: 'p4', text: 'Dell XPS 13 ultrabook',          meta: { type: 'laptop', brand: 'Dell',    price: 1399 } },
]);

// 3a) Classic cosine search (simple and fast)
const classic = await search('apple phone', 3).exec();
console.log('Classic:', classic);

// 3b) Unified advanced search (searchV2)
// Cosine similarity
const cosine = await searchV2('apple phone', { maxItems: 3, strategy: 'cosine' });
console.log('Cosine:', cosine);

// Probabilistic softmax ranking (with confidence)
const softmax = await searchV2('apple phone', { strategy: 'softmax', temperature: 0.8, maxItems: 3 });
console.log('Softmax:', softmax);

// Diverse results via MMR (reduce near-duplicates)
const mmr = await searchV2('apple laptop', { strategy: 'mmr', mmrLambda: 0.6, maxItems: 3 });
console.log('MMR:', mmr);

// Filter by metadata (e.g., only laptops)
const onlyLaptops = await searchV2('apple', {
    strategy: 'cosine',
    maxItems: 5,
    filter: r => r.meta?.type === 'laptop'
});
console.log('Only laptops:', onlyLaptops);
```
Result:
```typescript
// Classic / Cosine
[
    { id: 'p1', text: 'Apple iPhone 15 Pro Max',     score: 0.82, meta: { type: 'phone', brand: 'Apple', price: 1199 } },
    { id: 'p2', text: 'Samsung Galaxy S24 Ultra',    score: 0.53, meta: { type: 'phone', brand: 'Samsung', price: 1299 } },
    { id: 'p3', text: 'Apple MacBook Pro 14-inch M3',score: 0.31, meta: { type: 'laptop', brand: 'Apple', price: 1999 } }
]

// Softmax (adds probability + confidence)
[
    { id: 'p1', text: 'Apple iPhone 15 Pro Max',  score: 0.82, probability: 0.55, confidence: 0.18, meta: { ... } },
    { id: 'p2', text: 'Samsung Galaxy S24 Ultra', score: 0.53, probability: 0.28, confidence: 0.18, meta: { ... } },
    { id: 'p3', text: 'Apple MacBook Pro...',     score: 0.31, probability: 0.17, confidence: 0.18, meta: { ... } }
]

// MMR (more diverse top-k)
[
    { id: 'p3', text: 'Apple MacBook Pro 14-inch M3', score: 0.47, meta: { ... } },
    { id: 'p1', text: 'Apple iPhone 15 Pro Max',      score: 0.41, meta: { ... } },
    { id: 'p4', text: 'Dell XPS 13 ultrabook',        score: 0.36, meta: { ... } }
]

// Filtered (only laptops)
[
    { id: 'p3', text: 'Apple MacBook Pro 14-inch M3', score: 0.76, meta: { type: 'laptop', brand: 'Apple', price: 1999 } },
    { id: 'p4', text: 'Dell XPS 13 ultrabook',        score: 0.58, meta: { type: 'laptop', brand: 'Dell',  price: 1399 } }
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

### 🎯 5. Advanced Search with searchV2
`searchV2` is the unified search API that supports multiple ranking strategies, filtering, and advanced options.
```typescript
import { searchV2 } from 'ai-embed-search';

// Plain cosine similarity
const cosineResults = await searchV2('famous museum in Paris', {
    maxItems: 5,
    strategy: 'cosine'
});

// Probabilistic softmax ranking
const softmaxResults = await searchV2('famous museum in Paris', {
    strategy: 'softmax',
    temperature: 0.7 // lower = sharper, higher = more diverse
});

// Maximal Marginal Relevance (MMR) for diverse results
const diverseResults = await searchV2('travel landmarks', {
    strategy: 'mmr',
    mmrLambda: 0.7, // 0..1 — higher = more relevance, lower = more diversity
    maxItems: 8
});

// Filtering by metadata
const filteredResults = await searchV2('laptop', {
    filter: r => r.meta?.type === 'ultrabook'
});

```
Example Output (Softmax):
```typescript
[
    {
        "id": "3",
        "text": "The Louvre is a famous museum.",
        "score": 0.7486,
        "probability": 0.5010,
        "confidence": 0.1022
    },
    {
        "id": "1",
        "text": "The Eiffel Tower is in Paris.",
        "score": 0.5861,
        "probability": 0.3620,
        "confidence": 0.1022
    }
]
```
Example Output (MMR):
```typescript
[
    { "id": "3", "text": "The Louvre is a famous museum.", "score": 0.2992 },
    { "id": "2", "text": "Mount Fuji is in Japan.", "score": 0.2233 },
    { "id": "1", "text": "The Eiffel Tower is in Paris.", "score": 0.2173 }
]
```

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

Example:
```typescript
const results = await search('apple laptop', 3).exec();
```

### `searchV2(query: string, options?: SearchOptions)`
Unified advanced search API supporting multiple strategies, filters, and parameters.
Returns results immediately (no `.exec()` required).

Options:
- maxItems — maximum number of results (default: 5)
- strategy — 'cosine' | 'softmax' | 'mmr' (default: 'cosine')
- temperature — for softmax strategy (default: 1.0)
- mmrLambda — for mmr strategy, tradeoff between relevance & diversity (0..1, default: 0.5)
- filter — (result: SearchResult) => boolean to filter results by metadata or score

Example:
```typescript
const cosineResults = await searchV2('apple phone', { maxItems: 3 });

const softmaxResults = await searchV2('apple phone', {
  strategy: 'softmax',
  temperature: 0.7
});

const diverseResults = await searchV2('travel landmarks', {
  strategy: 'mmr',
  mmrLambda: 0.7,
  maxItems: 8
});

const onlyLaptops = await searchV2('apple', {
  filter: r => r.meta?.type === 'laptop'
});
```

Example:
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
