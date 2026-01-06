
import { v4 as uuidv4 } from 'uuid';
import { getRandomJokerDef } from '../data/jokers';
import type { Joker } from './types';

export class ShopGenerator {
    static generateShop(_ante: number): Joker[] {
        // Simple logic: return 3 random jokers
        const items: Joker[] = [];
        for (let i = 0; i < 3; i++) {
            const def = getRandomJokerDef();
            items.push({
                id: uuidv4(),
                defId: def.defId,
                edition: 'Base'
                // plusChips, plusMult default undefined
            });
        }
        return items;
    }
}
