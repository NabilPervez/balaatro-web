
import { v4 as uuidv4 } from 'uuid';
import type { Card, Rank, Suit } from './types';

const SUITS: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const getBaseChips = (rank: Rank): number => {
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    if (rank === 'A') return 11;
    return parseInt(rank);
};

// Simple seeded PRNG (Mulberry32)
function mulberry32(a: number) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export class DeckFactory {
    static createDeck(): Card[] {
        const deck: Card[] = [];

        for (const suit of SUITS) {
            for (const rank of RANKS) {
                deck.push({
                    id: uuidv4(),
                    suit,
                    rank,
                    baseChips: getBaseChips(rank),
                    edition: 'Base',
                    enhancement: 'Base',
                    seal: 'None',
                    isDebuffed: false,
                    isFaceUp: true
                });
            }
        }

        return deck;
    }

    static shuffle(deck: Card[], seed?: number): Card[] {
        const newDeck = [...deck];
        const random = seed !== undefined ? mulberry32(seed) : Math.random;

        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }

        return newDeck;
    }
}
