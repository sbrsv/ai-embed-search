import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import * as wizard from '../src/index.ts';

const mockEmbedder = async (text: string): Promise<number[]> => {
    return Array(384)
        .fill(0)
        .map((_, i) => Math.sin(i + text.length));
};

beforeAll(() => {
    wizard.initEmbedder({ embedder: mockEmbedder });
});

beforeEach(() => {
    wizard.clearVectors();
});

describe('ai-embed-search', () => {
    it('basic search works with .exec()', async () => {
        await wizard.embed([
            { id: '1', text: 'iPhone 15 Pro Max', meta: { brand: 'Apple', type: 'phone' } },
            { id: '2', text: 'Samsung Galaxy S24 Ultra', meta: { brand: 'Samsung', type: 'phone' } },
            { id: '3', text: 'Apple MacBook Air', meta: { brand: 'Apple', type: 'laptop' } },
        ]);

        const results = await wizard.search('apple phone', 2).exec();
        expect(results.length).toBeGreaterThan(0);
        expect(results[0]).toHaveProperty('id');
        expect(results[0]).toHaveProperty('score');
    });

    it('cacheFor() returns same results and caches them', async () => {
        const first = await wizard.search('apple phone', 2).cacheFor(10);
        const second = await wizard.search('apple phone', 2).exec();
        expect(second).toEqual(first);
    });

    it('filter() returns only results matching metadata', async () => {
        await wizard.embed([
            { id: '1', text: 'iPhone 15 Pro Max', meta: { brand: 'Apple', type: 'phone' } },
            { id: '2', text: 'Samsung Galaxy S24 Ultra', meta: { brand: 'Samsung', type: 'phone' } },
            { id: '3', text: 'Apple MacBook Air', meta: { brand: 'Apple', type: 'laptop' } },
        ]);

        const results = await wizard.search('apple').filter(r => r.meta?.type === 'phone').exec();
        expect(results.length).toBeGreaterThan(0);
        for (const r of results) {
            expect(r.meta?.type).toBe('phone');
        }
    });

    it('remove() deletes a specific entry', async () => {
        await wizard.embed([
            { id: '1', text: 'iPhone 15 Pro Max' },
            { id: '2', text: 'Samsung Galaxy S24 Ultra' },
        ]);

        wizard.removeVector('1');
        const results = await wizard.search('iphone').exec();
        expect(results.find(r => r.id === '1')).toBeUndefined();
    });

    it('clear() deletes all entries', async () => {
        await wizard.embed([
            { id: '1', text: 'iPhone 15 Pro Max' },
            { id: '2', text: 'Samsung Galaxy S24 Ultra' },
        ]);

        wizard.clearVectors();
        const results = await wizard.search('phone').exec();
        expect(results.length).toBe(0);
    });
});

it('getSimilarItems() returns most similar items excluding itself', async () => {
    await wizard.embed([
        { id: '1', text: 'iPhone 15 Pro Max', meta: { brand: 'Apple', type: 'phone' } },
        { id: '2', text: 'iPhone 14 Pro', meta: { brand: 'Apple', type: 'phone' } },
        { id: '3', text: 'MacBook Air', meta: { brand: 'Apple', type: 'laptop' } },
        { id: '4', text: 'Samsung Galaxy S24 Ultra', meta: { brand: 'Samsung', type: 'phone' } },
        { id: '5', text: 'Apple Watch Series 9', meta: { brand: 'Apple', type: 'watch' } },
    ]);

    const similar = await wizard.getSimilarItems('1', 3);

    expect(similar.length).toBe(3);

    expect(similar.some(r => r.id === '1')).toBe(false);

    for (const r of similar) {
        expect(r).toHaveProperty('id');
        expect(typeof r.score).toBe('number');
    }

    const scores = similar.map(r => r.score);
    const sortedScores = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sortedScores);
});

describe('searchWithSoftmax()', () => {
    beforeEach(() => {
        wizard.clearVectors();
    });

    it('returns results with probabilities that sum to ~1', async () => {
        await wizard.embed([
            { id: '1', text: 'iPhone 15 Pro Max' },
            { id: '2', text: 'Samsung Galaxy S24 Ultra' },
            { id: '3', text: 'Apple MacBook Air' },
            { id: '4', text: 'Apple Watch Series 9' },
        ]);

        const results = await wizard.searchWithSoftmax('apple', 4, 0.7);
        expect(results.length).toBe(4);
        for (const r of results) {
            expect(r).toHaveProperty('probability');
            expect(typeof r.probability).toBe('number');
        }

        const sum = results.reduce((acc, cur) => acc + cur.probability!, 0);
        expect(sum).toBeGreaterThan(0.99);
        expect(sum).toBeLessThan(1.01);
    });

    it('ranks results by probability in descending order', async () => {
        await wizard.embed([
            { id: '1', text: 'Apple MacBook' },
            { id: '2', text: 'Samsung Phone' },
            { id: '3', text: 'Apple Watch' },
        ]);

        const results = await wizard.searchWithSoftmax('apple', 3, 0.8);
        const probs = results.map(r => r.probability);
        const sorted = [...probs].sort((a, b) => b - a);
        expect(probs).toEqual(sorted);
    });
});