
import { DeckFactory } from './DeckFactory';
import { HandEvaluator } from './HandEvaluator';
import { ScoringManager } from './ScoringManager';
import type { GameState, Joker } from './types';

function runDemo() {
    console.log("=== Joker's Gambit Engine Demo ===");

    // 1. Create Deck
    const deck = DeckFactory.createDeck();
    console.log(`Deck created: ${deck.length} cards.`);

    // 2. Select specific cards for a Royal Flush
    // Hearts: 10, J, Q, K, A
    const hand = deck.filter(c => c.suit === 'Hearts' && ['10', 'J', 'Q', 'K', 'A'].includes(c.rank));
    console.log("Hand Selected:", hand.map(c => `${c.rank} of ${c.suit}`));

    // 3. Evaluate Hand
    const result = HandEvaluator.evaluate(hand);
    console.log("Hand Evaluation:", result.handType);
    console.log("Base Chips:", result.baseChips);
    console.log("Base Mult:", result.baseMult);

    if (result.handType !== 'Royal Flush' && result.handType !== 'Straight Flush') {
        console.error("FAILED: Expected Straight Flush (Royal)");
    }

    // 4. Setup Mock Game State with a Joker
    // Joker: "Jolly Joker" (+8 Mult if pair? No, let's do a simple +4 Mult abstract joker)
    const mockJoker: Joker = {
        id: 'joker-1',
        defId: 'j_joker',
        edition: 'Base'
    };

    const gameState: GameState = {
        runState: 'PLAYING_HAND',
        deck: [],
        hand: [],
        discardPile: [],
        playArea: hand,
        jokers: [mockJoker],
        consumables: [],
        money: 0,
        ante: 1,
        round: 1,
        currentBlind: { targetScore: 300, reward: 3 },
        handsRemaining: 4,
        discardsRemaining: 3
    };

    // 5. Calculate Score
    const score = ScoringManager.calculateScore(result, gameState);
    console.log(`Final Score: ${score}`);

    // Calculation:
    // Hand: Straight Flush (100 Chips, 8 Mult)
    // Cards: 10(10) + J(10) + Q(10) + K(10) + A(11) = 51 Chips
    // Total Chips: 100 + 51 = 151
    // Joker: +4 Mult
    // Total Mult: 8 + 4 = 12
    // Score: 151 * 12 = 1812

    const expected = 1812;
    if (score === expected) {
        console.log("✅ Score matches expected calculation!");
    } else {
        console.error(`❌ Score mismatch! Expected ${expected}, got ${score}`);
    }
}

// Run if called directly
if (typeof window === 'undefined') {
    // Node environment?
    // runDemo(); 
    // We export it to be run by a runner or imported
}

export { runDemo };
