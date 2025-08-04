export function entropy(probs: number[]): number {
    return -probs.reduce((acc, p) => acc + (p > 0 ? p * Math.log(p) : 0), 0);
}
