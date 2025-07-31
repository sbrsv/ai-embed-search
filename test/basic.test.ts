import * as wizard from '../src/index.ts';

jest.setTimeout(10000);

const mockEmbedder = async (text: string): Promise<number[]> => {
    return Array(384).fill(0).map((_, i) => Math.sin(i + text.length));
};

beforeAll(() => {
    wizard.init({ embedder: mockEmbedder });
});

test('basic search works', async () => {
    await wizard.embed([
        { id: '1', text: 'iPhone 15 Pro Max' },
        { id: '2', text: 'Samsung Galaxy S24 Ultra' },
        { id: '3', text: 'Apple MacBook Air' },
    ]);

    const results = await wizard.search('apple phone', 2);
    expect(results.length).toBeGreaterThan(0);
});
