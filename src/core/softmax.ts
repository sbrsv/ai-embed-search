export function softmax(scores: number[], temperature: number = 1): number[] {
    const scaled = scores.map(score => score / temperature);
    const max = Math.max(...scaled);
    const exps = scaled.map(score => Math.exp(score - max));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    return exps.map(exp => exp / sumExp);
}
