
import type { Card, HandResult, Rank, Suit } from './types';

// Constants for Base Scoring
const HAND_SCORING: Record<string, { chips: number, mult: number }> = {
    'Flush Five': { chips: 160, mult: 16 },
    'Flush House': { chips: 140, mult: 14 },
    'Five of a Kind': { chips: 120, mult: 12 },
    'Straight Flush': { chips: 100, mult: 8 },
    'Four of a Kind': { chips: 60, mult: 7 },
    'Full House': { chips: 40, mult: 4 },
    'Flush': { chips: 35, mult: 4 },
    'Straight': { chips: 30, mult: 4 },
    'Three of a Kind': { chips: 30, mult: 3 },
    'Two Pair': { chips: 20, mult: 2 },
    'Pair': { chips: 10, mult: 2 },
    'High Card': { chips: 5, mult: 1 }
};

const RANK_ORDER: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class HandEvaluator {

    static evaluate(playedCards: Card[]): HandResult {
        // Filter out Stone cards for rank/suit logic, but keep them for return?
        // Actually Stone cards always score (add chips) but don't help make hands.
        // We evaluate the "poker hand" formed by non-stone cards.
        // If only stone cards, it's High Card (technically High Card hand requires 1 card).

        const validCards = playedCards.filter(c => c.enhancement !== 'Stone');

        // If no valid cards (e.g. all Stone), default to High Card using highest Base Chip value (Stone is 50, but has no rank).
        // Balatro logic: Stone cards play as "High Card" hand type effectively if nothing else forms.
        if (validCards.length === 0) {
            return {
                handType: 'High Card',
                scoringCards: playedCards,
                baseChips: HAND_SCORING['High Card'].chips,
                baseMult: HAND_SCORING['High Card'].mult
            };
        }

        // 1. Analyze Ranks
        const rankCounts = new Map<Rank, number>();
        validCards.forEach(c => {
            rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1);
        });

        // 2. Analyze Suits (handling Wild)
        const suitCounts = new Map<Suit, number>();
        const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

        suits.forEach(targetSuit => {
            let count = 0;
            validCards.forEach(c => {
                if (c.suit === targetSuit || c.enhancement === 'Wild') {
                    count++;
                }
            });
            suitCounts.set(targetSuit, count);
        });

        // Check Flush (Size >= 5)
        // Find if any suit >= 5
        let flushSuit: Suit | null = null;
        for (const [s, count] of suitCounts.entries()) {
            if (count >= 5) {
                flushSuit = s;
                break;
            }
        }

        // Check Straight (Size >= 5)
        const isStraight = HandEvaluator.checkStraight(validCards);

        // Rank frequencies
        const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
        const maxCount = counts[0] || 0;
        const secondCount = counts[1] || 0;

        // Detect Hand Type - Priority Order

        // Flush Five: 5 of same rank AND Flush
        if (maxCount >= 5 && flushSuit) {
            // Check if the 5 cards of same rank are also flush
            // Since Wild counts as Suit, if we have 5 Kings and they form a Flush (e.g. 4 Hearts + 1 Wild), it is Flush Five.
            // Assumption: Any 5 matching rank cards that ALSO form a flush are Flush Five.
            return HandEvaluator.createResult('Flush Five', validCards);
        }

        // Flush House: Full House AND Flush
        if (maxCount === 3 && secondCount >= 2 && flushSuit) {
            return HandEvaluator.createResult('Flush House', validCards);
        }

        // Five of a Kind
        if (maxCount >= 5) {
            // Identify the rank
            const rank = Array.from(rankCounts.entries()).find(x => x[1] === maxCount)?.[0];
            const scoring = validCards.filter(c => c.rank === rank).slice(0, 5);
            return HandEvaluator.createResult('Five of a Kind', scoring);
        }

        // Straight Flush
        if (isStraight && flushSuit) {
            // Need to ensure the straight cards ARE the flush cards.
            // Simplified check: if both true, it's likely SF.
            // Rigorous: Check if the cards forming the straight also form a flush.
            // For MVP/Engine Phase 1, we assume strict subset overlap.
            // If I have 5 Hearts constituting a Straight, it's SF.
            return HandEvaluator.createResult('Straight Flush', validCards); // Todo: filter specific 5
        }

        // Four of a Kind
        if (maxCount >= 4) {
            const rank = Array.from(rankCounts.entries()).find(x => x[1] === maxCount)?.[0];
            const scoring = validCards.filter(c => c.rank === rank).slice(0, 4);
            return HandEvaluator.createResult('Four of a Kind', scoring);
        }

        // Full House
        if (maxCount === 3 && secondCount >= 2) {
            // Scoring: The 3 and the 2.
            return HandEvaluator.createResult('Full House', validCards);
        }

        // Flush
        if (flushSuit) {
            // Return the 5 cards of that suit (prioritizing non-wilds? No, just 5).
            const scoring = validCards.filter(c => c.suit === flushSuit || c.enhancement === 'Wild').slice(0, 5);
            return HandEvaluator.createResult('Flush', scoring);
        }

        // Straight
        if (isStraight) {
            return HandEvaluator.createResult('Straight', validCards); // Todo: filter exact 5
        }

        // Three of a Kind
        if (maxCount >= 3) {
            const rank = Array.from(rankCounts.entries()).find(x => x[1] === maxCount)?.[0];
            const scoring = validCards.filter(c => c.rank === rank).slice(0, 3);
            return HandEvaluator.createResult('Three of a Kind', scoring);
        }

        // Two Pair
        if (maxCount === 2 && secondCount >= 2) {
            // Find the two ranks
            const ranks = Array.from(rankCounts.entries()).filter(x => x[1] >= 2).map(x => x[0]);
            const scoring = validCards.filter(c => ranks.includes(c.rank)).slice(0, 4);
            return HandEvaluator.createResult('Two Pair', scoring);
        }

        // Pair
        if (maxCount === 2) {
            const rank = Array.from(rankCounts.entries()).find(x => x[1] === maxCount)?.[0];
            const scoring = validCards.filter(c => c.rank === rank).slice(0, 2);
            return HandEvaluator.createResult('Pair', scoring);
        }

        // High Card
        // Logic: Return highest ranking card
        // Sort validCards by rank index
        const sorted = [...validCards].sort((a, b) => RANK_ORDER.indexOf(b.rank) - RANK_ORDER.indexOf(a.rank));
        return HandEvaluator.createResult('High Card', [sorted[0]]);
    }

    private static createResult(type: string, scoring: Card[]): HandResult {
        const stats = HAND_SCORING[type];
        return {
            handType: type,
            scoringCards: scoring,
            baseChips: stats.chips,
            baseMult: stats.mult
        };
    }

    private static checkStraight(cards: Card[]): boolean {
        // Dedup ranks for straight check?
        // Standard Straight: 5 distinct ranks consecutive.
        // Get generic rank indices
        const indices = new Set<number>();
        cards.forEach(c => indices.add(RANK_ORDER.indexOf(c.rank)));

        if (indices.size < 5) return false;

        const sorted = Array.from(indices).sort((a, b) => a - b);

        // Check for 5 consecutive
        let consecutive = 1;
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] === sorted[i] + 1) {
                consecutive++;
                if (consecutive >= 5) return true;
            } else {
                consecutive = 1;
            }
        }

        // Check Ace Low: A, 2, 3, 4, 5
        // A is index 12. 2 is index 0.
        // We need 12, 0, 1, 2, 3 present
        if (indices.has(12) && indices.has(0) && indices.has(1) && indices.has(2) && indices.has(3)) {
            return true;
        }

        return false;
    }
}
