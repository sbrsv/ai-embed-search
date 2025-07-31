import { writeFile, readFile } from 'fs/promises';
import type { VectorEntry } from '../types.js';

export let vectorStore: VectorEntry[] = [];

/**
 * Save current vector store to a file.
 */
export async function saveVectors(filePath: string) {
    await writeFile(filePath, JSON.stringify(vectorStore, null, 2), 'utf-8');
}

/**
 * Load vector store from a JSON file.
 */
export async function loadVectors(filePath: string) {
    const raw = await readFile(filePath, 'utf-8');
    vectorStore = JSON.parse(raw);
}

/**
 * Remove a vector entry by ID.
 */
export function removeVector(id: string) {
    vectorStore = vectorStore.filter(entry => entry.id !== id);
}

/**
 * Clear all vector entries.
 */
export function clearVectors() {
    vectorStore = [];
}
