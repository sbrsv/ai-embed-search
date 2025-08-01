import * as wizard from '../src/index.ts';

jest.setTimeout(10000);

const mockEmbedder = async (text: string): Promise<number[]> => {
    return Array(384).fill(0).map((_, i) => Math.sin(i + text.length));
};

beforeAll(() => {
    wizard.initEmbedder({ embedder: mockEmbedder });
});

beforeEach(() => {
    wizard.clearVectors();
});

test('basic search works with .exec()', async () => {
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

test('cacheFor() returns same results and caches them', async () => {
    const first = await wizard.search('apple phone', 2).cacheFor(10);
    const second = await wizard.search('apple phone', 2).exec();

    expect(second).toEqual(first);
});

test('filter() returns only results matching metadata', async () => {
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

test('remove() deletes a specific entry', async () => {
    await wizard.embed([
        { id: '1', text: 'iPhone 15 Pro Max' },
        { id: '2', text: 'Samsung Galaxy S24 Ultra' },
    ]);

    wizard.removeVector('1');
    const results = await wizard.search('iphone').exec();
    expect(results.find(r => r.id === '1')).toBeUndefined();
});

test('clear() deletes all entries', async () => {
    await wizard.embed([
        { id: '1', text: 'iPhone 15 Pro Max' },
        { id: '2', text: 'Samsung Galaxy S24 Ultra' },
    ]);

    wizard.clearVectors();
    const results = await wizard.search('phone').exec();
    expect(results.length).toBe(0);
});
