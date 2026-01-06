
import { create } from 'zustand';
import type { GameState } from '../logic/types';
import { DeckFactory } from '../logic/DeckFactory';
import { HandEvaluator } from '../logic/HandEvaluator';
import { ScoringManager } from '../logic/ScoringManager';

interface GameActions {
    initRun: () => void;
    toggleCardSelection: (cardId: string) => void;
    playHand: () => void;
    discardHand: () => void;
}

const MAX_HAND_SIZE = 8; // Standard Balatro hand size
const MAX_SELECTED_CARDS = 5;

// Helper to create initial state
const createInitialState = (): GameState => {
    const deck = DeckFactory.createDeck(); // Should be shuffled
    // Shuffle logic needs to be here or factory
    const shuffled = DeckFactory.shuffle(deck);

    // Draw initial hand
    const hand = shuffled.slice(0, MAX_HAND_SIZE);
    const remainingDeck = shuffled.slice(MAX_HAND_SIZE);

    return {
        runState: 'PLAYING_HAND',
        deck: remainingDeck,
        hand: hand,
        discardPile: [],
        playArea: [], // Selected cards? No, wait. 
        // In Balatro, you select cards in your hand (they pop up).
        // Then you click "Play".
        // "Play Area" in GameState might be for animation/scoring phase.
        // For selection state, we might need a separate Set or boolean on Card.
        // But Card is in `hand` array.
        // Zustand store can keep track of `selectedCardIds`.

        jokers: [],
        consumables: [],
        money: 4,
        ante: 1,
        round: 1,
        currentBlind: { targetScore: 300, reward: 3 },
        handsRemaining: 4,
        discardsRemaining: 3
    };
};

// We extend GameState to include ephemeral UI state like 'selectedCardIds'
// OR we map `isFaceUp` / `isSelected` in the component? 
// PRD suggested `isSelected` on CardComponent props.
// Ideally, selection is UI state, but "Play Hand" needs to know what is selected.
// So we store `selectedCardIds` in the store.

interface StoreState extends GameState {
    selectedCardIds: string[];
    actions: GameActions;
}

export const useGameStore = create<StoreState>((set, get) => ({
    ...createInitialState(),
    selectedCardIds: [],

    actions: {
        initRun: () => {
            set({ ...createInitialState(), selectedCardIds: [] });
        },

        toggleCardSelection: (cardId: string) => {
            const { selectedCardIds } = get();
            if (selectedCardIds.includes(cardId)) {
                set({ selectedCardIds: selectedCardIds.filter(id => id !== cardId) });
            } else {
                if (selectedCardIds.length < MAX_SELECTED_CARDS) {
                    set({ selectedCardIds: [...selectedCardIds, cardId] });
                }
            }
        },

        playHand: () => {
            const { hand, selectedCardIds, handsRemaining } = get();

            if (selectedCardIds.length === 0) return; // Cannot play empty currently
            if (handsRemaining <= 0) return;

            // Get the card objects
            const playedCards = hand.filter(c => selectedCardIds.includes(c.id));

            // 1. Evaluate
            const handResult = HandEvaluator.evaluate(playedCards);

            // 2. Score
            const score = ScoringManager.calculateScore(handResult, get());

            console.log(`Hand Played: ${handResult.handType} for ${score} points!`);

            // 3. Logic: Remove played cards, decrease hands remaining
            // Actually, in Balatro, scored cards are discarded (unless Glass breaks etc).
            const remainingHand = hand.filter(c => !selectedCardIds.includes(c.id));

            // Refill hand? In Balatro, you draw up to MAX_HAND_SIZE after playing?
            // Yes, "Draw to X".
            const deck = [...get().deck];
            const discardPile = [...get().discardPile, ...playedCards];

            const cardsNeeded = MAX_HAND_SIZE - remainingHand.length;
            const newCards = deck.splice(0, cardsNeeded);

            const newHand = [...remainingHand, ...newCards];

            // Check Blind clear
            // Note: In real game, score accumulates.
            // We need `currentScore` in GameState. 
            // I missed adding `currentRoundScore` to standard GameState in Types, 
            // I'll add it here implicitly or update types later.
            // For MVP: log it.

            set({
                hand: newHand,
                deck: deck,
                discardPile: discardPile,
                selectedCardIds: [],
                handsRemaining: handsRemaining - 1
            });
        },

        discardHand: () => {
            const { hand, selectedCardIds, discardsRemaining, deck } = get();
            if (discardsRemaining <= 0 || selectedCardIds.length === 0) return;

            // Move selected to discard
            const discarded = hand.filter(c => selectedCardIds.includes(c.id));
            const remainingHand = hand.filter(c => !selectedCardIds.includes(c.id));

            // Draw
            const cardsNeeded = MAX_HAND_SIZE - remainingHand.length;
            const currentDeck = [...deck];
            const newCards = currentDeck.splice(0, cardsNeeded);

            set({
                hand: [...remainingHand, ...newCards],
                deck: currentDeck,
                discardPile: [...get().discardPile, ...discarded],
                selectedCardIds: [],
                discardsRemaining: discardsRemaining - 1
            });
        }
    }
}));
