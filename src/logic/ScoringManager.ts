
import type { GameState, HandResult, Context } from './types';

export class ScoringManager {
    static calculateScore(
        handResult: HandResult,
        state: GameState
    ): number {
        let chips = handResult.baseChips;
        let mult = handResult.baseMult;

        const { scoringCards } = handResult;

        // 1. CARD TRIGGER PHASE
        // Iterate played cards Left-to-Right
        for (const card of scoringCards) {
            if (card.isDebuffed) continue; // Balatro logic: debuffed cards contribute nothing

            // Add Rank Value
            chips += card.baseChips;

            // Apply Enhancements
            if (card.enhancement === 'Bonus') chips += 30;
            if (card.enhancement === 'Mult') mult += 4;
            if (card.enhancement === 'Stone') chips += 50;
            // Glass, etc via specific checks or generalized enhancement map
            if (card.enhancement === 'Glass') mult *= 2;

            // Trigger Jokers "on_card_count" or specific card triggers
            // e.g. Photograph (X2 Mult for first face card)
            // We iterate all jokers to see if they react to THIS card scoring
            for (const joker of state.jokers) {
                if (joker.triggerType === 'on_score') {
                    const ctx: Context = { type: 'score', playedCards: [card] };
                    const effect = joker.calculateEffect(state, ctx);
                    if (effect.chips) chips += effect.chips;
                    if (effect.plusMult) mult += effect.plusMult;
                    if (effect.xMult) mult *= effect.xMult;
                }
            }
        }

        // 2. HELD CARD PHASE
        for (const card of state.hand) {
            if (card.isDebuffed) continue;

            if (card.enhancement === 'Steel') mult *= 1.5;
            // King logic (Baron) would be a Joker trigger 'on_held'

            // Trigger Jokers 'on_held'
            for (const joker of state.jokers) {
                if (joker.triggerType === 'on_held') {
                    // Check if joker applies to this specific card (e.g. Baron checks if card is King)
                    // Implementation detail: The Joker's calculateEffect must filter correct cards
                    const ctx: Context = { type: 'held', playedCards: [card] };
                    const effect = joker.calculateEffect(state, ctx);
                    if (effect.xMult) mult *= effect.xMult;
                    if (effect.plusMult) mult += effect.plusMult;
                }
            }
        }

        // 3. JOKER GLOBAL PHASE
        for (const joker of state.jokers) {
            if (joker.triggerType === 'independent' || joker.triggerType === 'passive') { // Passive constant boost
                const ctx: Context = { type: 'independent', scoringHand: scoringCards };
                const effect = joker.calculateEffect(state, ctx);

                if (effect.chips) chips += effect.chips;
                if (effect.plusMult) mult += effect.plusMult;
                if (effect.xMult) mult *= effect.xMult;
            }
        }

        // Ensure minimums
        if (chips < 0) chips = 0;
        if (mult < 1) mult = 1;

        return Math.floor(chips * mult);
    }
}
