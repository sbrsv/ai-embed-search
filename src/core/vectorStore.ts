import { writeFile, readFile } from 'fs/promises';
import type { VectorEntry } from '../types.js';

export let vectorStore: VectorEntry[] = [];

export async function saveVectors(filePath: string) {
    await writeFile(filePath, JSON.stringify(vectorStore, null, 2), 'utf-8');
}

export async function loadVectors(filePath: string) {
    const raw = await readFile(filePath, 'utf-8');
    vectorStore = JSON.parse(raw);
}
