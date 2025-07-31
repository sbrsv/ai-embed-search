import * as wizard from '../src/index.ts';

jest.setTimeout(10000);

const mockEmbedder = async (text: string): Promise<number[]> => {
    return Array(384).fill(0).map((_, i) => Math.sin(i + text.length));
};

beforeAll(() => {
    wizard.init({ embedder: mockEmbedder });
});

test('basic search works with .exec()', async () => {
    await wizard.embed([
        { id: '1', text: 'iPhone 15 Pro Max' },
        { id: '2', text: 'Samsung Galaxy S24 Ultra' },
        { id: '3', text: 'Apple MacBook Air' },
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
