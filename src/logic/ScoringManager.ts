
import { getJokerDef } from '../data/jokers';
import type { GameState, HandResult, Context } from './types';

export class ScoringManager {
    static calculateScore(
        handResult: HandResult,
        state: GameState
    ): number {
        let chips = handResult.baseChips;
        let mult = handResult.baseMult;

        const { scoringCards, handType } = handResult;

        // 1. CARD TRIGGER PHASE
        // Iterate played cards Left-to-Right
        for (const card of scoringCards) {
            if (card.isDebuffed) continue;

            // Add Rank Value
            chips += card.baseChips;

            // Apply Enhancements
            if (card.enhancement === 'Bonus') chips += 30;
            if (card.enhancement === 'Mult') mult += 4;
            if (card.enhancement === 'Stone') chips += 50;
            if (card.enhancement === 'Glass') mult *= 2;

            // Trigger Jokers "on_score"
            for (const joker of state.jokers) {
                const def = getJokerDef(joker.defId);
                if (def.triggerType === 'on_score') {
                    const ctx: Context = {
                        type: 'score',
                        playedCards: [card],
                        scoringHand: scoringCards,
                        pokerHand: handType
                    };
                    const effect = def.calculateEffect(state, ctx, joker);
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

            // Trigger Jokers 'on_held'
            for (const joker of state.jokers) {
                const def = getJokerDef(joker.defId);
                if (def.triggerType === 'on_held') {
                    const ctx: Context = {
                        type: 'held',
                        playedCards: [card],
                        scoringHand: scoringCards,
                        pokerHand: handType
                    };
                    const effect = def.calculateEffect(state, ctx, joker);
                    if (effect.xMult) mult *= effect.xMult;
                    if (effect.plusMult) mult += effect.plusMult;
                }
            }
        }

        // 3. JOKER GLOBAL PHASE
        for (const joker of state.jokers) {
            const def = getJokerDef(joker.defId);
            if (def.triggerType === 'independent' || def.triggerType === 'passive') {
                const ctx: Context = {
                    type: 'independent',
                    scoringHand: scoringCards,
                    pokerHand: handType
                };
                const effect = def.calculateEffect(state, ctx, joker);

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
