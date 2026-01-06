
import type { JokerDefinition } from '../logic/types';

export const JOKER_DEFINITIONS: Record<string, JokerDefinition> = {
    'j_joker': {
        defId: 'j_joker',
        name: 'Joker',
        rarity: 'Common',
        cost: 2,
        description: '+4 Mult',
        triggerType: 'independent',
        calculateEffect: () => {
            return { plusMult: 4 };
        }
    },
    'j_greedy_joker': {
        defId: 'j_greedy_joker',
        name: 'Greedy Joker',
        rarity: 'Common',
        cost: 5,
        description: 'Played cards with Diamond suit give +4 Mult when scored',
        triggerType: 'on_score',
        calculateEffect: (_gs, ctx) => {
            // Check if the card being scored is Diamond
            // ctx.playedCards contains the single card being scored for 'on_score' trigger?
            // Yes, ScoringManager iterates cards and calls 'on_score'.
            if (ctx.playedCards && ctx.playedCards.length > 0) {
                const card = ctx.playedCards[0];
                if (card.suit === 'Diamonds' || card.enhancement === 'Wild') { // Wild check!
                    return { plusMult: 4 };
                }
            }
            return {};
        }
    },
    'j_the_duo': {
        defId: 'j_the_duo',
        name: 'The Duo',
        rarity: 'Rare',
        cost: 8,
        description: 'X2 Mult if playing a Pair',
        triggerType: 'independent',
        calculateEffect: (_gs, ctx) => {
            if (ctx.pokerHand === 'Pair') {
                return { xMult: 2 };
            }
            return {};
        }
    },
    'j_golden': {
        defId: 'j_golden',
        name: 'Golden Joker',
        rarity: 'Uncommon',
        cost: 6,
        description: 'Earn $4 at end of round',
        triggerType: 'independent',
        calculateEffect: (_gs, _ctx) => {
            // "End of round" usually handled by a separate phase or 'independent' means "During scoring".
            // If "Golden Joker" gives money at end of round, it shouldn't trigger on score calculation.
            // But for MVP, let's say it triggers "independent" but returns money?
            // Actually, Balatro standard jokers trigger on scoring OR specific "End of Round" phase.
            // My ScoringManager only does scoring.
            // I'll leave this empty for scoring, but handled in GameStore?
            // Or add a 'passive' trigger check in GameStore endRound logic.
            return {};
        }
    }
};

export const getJokerDef = (defId: string): JokerDefinition => {
    return JOKER_DEFINITIONS[defId] || JOKER_DEFINITIONS['j_joker'];
};

export const getRandomJokerDef = (): JokerDefinition => {
    const keys = Object.keys(JOKER_DEFINITIONS);
    const key = keys[Math.floor(Math.random() * keys.length)];
    return JOKER_DEFINITIONS[key];
};
