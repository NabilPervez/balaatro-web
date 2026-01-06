
import React, { useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../Card/Card';
import { HandEvaluator } from '../../logic/HandEvaluator';
import './GameCanvas.css';

export const GameCanvas: React.FC = () => {
    // Connect to store
    const {
        hand,
        selectedCardIds,
        money,
        ante,
        round,
        currentBlind,
        handsRemaining,
        discardsRemaining,
        actions
    } = useGameStore(state => ({
        hand: state.hand,
        selectedCardIds: state.selectedCardIds,
        money: state.money,
        ante: state.ante,
        round: state.round,
        currentBlind: state.currentBlind,
        handsRemaining: state.handsRemaining,
        discardsRemaining: state.discardsRemaining,
        actions: state.actions
    }));

    // Computed UI state
    const selectedCards = useMemo(() => {
        return hand.filter(c => selectedCardIds.includes(c.id));
    }, [hand, selectedCardIds]);

    const currentHandType = useMemo(() => {
        if (selectedCards.length === 0) return '';
        const result = HandEvaluator.evaluate(selectedCards);
        return result.handType;
    }, [selectedCards]);

    const scoreEstimate = useMemo(() => {
        if (selectedCards.length === 0) return { chips: 0, mult: 0 };
        const result = HandEvaluator.evaluate(selectedCards);
        return { chips: result.baseChips, mult: result.baseMult };
    }, [selectedCards]);

    useEffect(() => {
        // Init game on mount if empty?
        // actions.initRun(); 
        // We'll let user click Start or auto-init via separate StartScreen later.
        // For now, auto-init to test.
        if (hand.length === 0) actions.initRun();
    }, []);

    return (
        <div className="game-canvas">
            {/* Top / HUD */}
            <div className="hud-zone">
                <div className="stats-panel">
                    <div className="stat">
                        <small>ANTE</small>
                        <div className="score-box" style={{ background: '#e76f51' }}>{ante}</div>
                    </div>
                    <div className="stat">
                        <small>ROUND</small>
                        <div className="score-box" style={{ background: '#f4a261' }}>{round}</div>
                    </div>
                    <div className="stat">
                        <small>GOAL</small>
                        <div className="score-box">{currentBlind.targetScore}</div>
                    </div>
                    <div className="stat">
                        <small>MONEY</small>
                        <div style={{ color: '#f4d35e', fontWeight: 'bold' }}>${money}</div>
                    </div>
                </div>

                {/* Jokers Placeholder */}
                <div style={{ display: 'flex', gap: 10 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                            width: 60, height: 80,
                            border: '2px dashed rgba(255,255,255,0.2)',
                            borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', color: '#666'
                        }}>
                            JOKER
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle / Play Zone */}
            <div className="play-zone">
                <div className="play-zone-label">
                    {currentHandType || "Select Cards"}
                </div>
                {/* 
                   Here we could visualize the cards being played via animation.
                   For now, the logic is instant.
                */}
                {currentHandType && (
                    <div style={{
                        position: 'absolute', bottom: 10,
                        background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: 20
                    }}>
                        Preview: {scoreEstimate.chips} X {scoreEstimate.mult}
                    </div>
                )}
            </div>

            {/* Bottom / Hand Zone */}
            <div className="hand-zone">
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {hand.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            isSelected={selectedCardIds.includes(card.id)}
                            onClick={() => actions.toggleCardSelection(card.id)}
                        />
                    ))}
                </div>

                <div className="action-buttons">
                    <button
                        className="btn btn-play"
                        disabled={selectedCards.length === 0 || handsRemaining <= 0}
                        onClick={actions.playHand}
                    >
                        Play Hand
                        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>
                            {handsRemaining} Remaining
                        </div>
                    </button>

                    <button
                        className="btn btn-discard"
                        disabled={selectedCards.length === 0 || discardsRemaining <= 0}
                        onClick={actions.discardHand}
                    >
                        Discard
                        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>
                            {discardsRemaining} Remaining
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
