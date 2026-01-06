
export type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface EffectOutput {
    plusMult?: number;
    xMult?: number;
    chips?: number;
}

// Forward declaration to avoid circular dependency if needed, 
// strictly following the PRD example structure.
export interface Card {
    id: string;          // UUID for React keys
    suit: Suit;
    rank: Rank;
    baseChips: number;   // Derived from Rank (e.g., A = 11, K = 10)

    // Modifiers
    edition: 'Base' | 'Foil' | 'Holographic' | 'Polychrome' | 'Negative';
    enhancement: 'Base' | 'Stone' | 'Glass' | 'Steel' | 'Gold' | 'Bonus' | 'Mult' | 'Wild' | 'Lucky';
    seal: 'None' | 'Gold' | 'Red' | 'Blue' | 'Purple';

    // Status
    isDebuffed: boolean; // Caused by Boss Blinds (suits disabled, etc.)
    isFaceUp: boolean;   // For "The House" boss blind logic
}

export interface GameState {
    runState: 'MENU' | 'SHOP' | 'BLIND_SELECT' | 'PLAYING_HAND' | 'GAME_OVER';

    deck: Card[];        // The full deck (52+ cards)
    hand: Card[];        // Cards currently held (max hand size)
    discardPile: Card[];
    playArea: Card[];    // Cards selected to be played

    jokers: Joker[];     // Max 5 (standard)
    consumables: Card[]; // Tarot/Planet/Spectral (Max 2)

    // Economy & Meta
    money: number;
    ante: number;        // Difficulty Tier (1-8)
    round: number;       // 1 (Small), 2 (Big), 3 (Boss)

    // Current Round Stats
    currentBlind: {
        targetScore: number;
        reward: number;
        bossEffect?: string; // Simplification for now
    };
    handsRemaining: number;
    discardsRemaining: number;
}

export interface Context {
    type: 'score' | 'discard' | 'held' | 'independent';
    playedCards?: Card[];
    scoringHand?: Card[]; // The calculated best poker hand
}

export interface Joker {
    id: string;
    name: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
    cost: number;
    edition: 'Base' | 'Foil' | 'Holographic' | 'Polychrome' | 'Negative';

    // The logic hook
    triggerType: 'on_score' | 'on_discard' | 'on_held' | 'independent' | 'passive';
    calculateEffect: (gameState: GameState, context: Context) => EffectOutput;
}

export interface HandResult {
    handType: string;         // 'Five of a Kind', 'Straight Flush', etc.
    scoringCards: Card[];     // Cards that contribute to the score
    baseChips: number;        // Base chips for this hand type
    baseMult: number;         // Base mult for this hand type
}
