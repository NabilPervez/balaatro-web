
export class BlindScaler {
    static getBlindTarget(ante: number, round: number): number {
        // Simple exponential scaling for demo
        // Base scaling by Ante
        let base = 300 * Math.pow(1.6, ante - 1);

        // Round multipliers: 1 = Small (1x), 2 = Big (1.5x), 3 = Boss (2x) relative to base?
        // Actually Balatro: 
        // Ante 1: 300 (Small), 450 (Big), 600 (Boss)
        // 300 * 1.0, 300 * 1.5, 300 * 2.0

        let multiplier = 1;
        if (round === 2) multiplier = 1.5;
        if (round === 3) multiplier = 2.0;

        // Round to nearest 10 or 100
        const raw = base * multiplier;
        if (raw < 1000) return Math.floor(raw / 10) * 10;
        return Math.floor(raw / 100) * 100;
    }
}
