export {
    initEmbedder,
    embed,
    search,
    getSimilarItems,
    searchWithSoftmax
} from './core/engine.ts';
export {
    vectorStore as _vectorStore,
    saveVectors,
    loadVectors,
    removeVector,
    clearVectors,
} from './core/vectorStore.ts';
export { createEmbedder } from './core/embedder.ts';
