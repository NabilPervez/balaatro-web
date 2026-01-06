
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getJokerDef } from '../../data/jokers';
import '../GameCanvas/GameCanvas.css'; // Reuse styles

export const Shop: React.FC = () => {
    const { shopJokers, money, actions, ante, round } = useGameStore(state => ({
        shopJokers: state.shopJokers,
        money: state.money,
        actions: state.actions,
        ante: state.ante,
        round: state.round
    }));

    return (
        <div className="game-canvas" style={{ gridTemplateRows: '10vh 1fr 10vh' }}>
            <div className="hud-zone">
                <div style={{ fontSize: '2rem' }}>SHOP</div>
                <div className="stats-panel">
                    <div className="stat">
                        <small>MONEY</small>
                        <div style={{ color: '#f4d35e', fontWeight: 'bold' }}>${money}</div>
                    </div>
                </div>
            </div>

            <div className="play-zone" style={{ flexDirection: 'column', gap: 20 }}>
                <h2>Ante {ante} - Round {round} Complete!</h2>

                <div style={{ display: 'flex', gap: 20 }}>
                    {shopJokers.map(joker => {
                        const def = getJokerDef(joker.defId);
                        const canBuy = money >= def.cost;

                        return (
                            <div key={joker.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                <div className="joker-card" title={def.description}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{def.name}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#888' }}>{def.rarity}</div>
                                    <div style={{ fontSize: '0.7rem', marginTop: 4 }}>{def.description}</div>
                                </div>

                                <button
                                    className="btn"
                                    style={{ padding: '0.5rem', fontSize: '0.8rem', background: canBuy ? '#2a9d8f' : '#333' }}
                                    disabled={!canBuy}
                                    onClick={() => actions.buyJoker(joker.id)}
                                >
                                    Buy ${def.cost}
                                </button>
                            </div>
                        );
                    })}

                    {shopJokers.length === 0 && <div>Sold Out!</div>}
                </div>
            </div>

            <div className="hand-zone" style={{ justifyContent: 'center' }}>
                <button className="btn btn-play" onClick={actions.nextRound}>
                    Next Round
                </button>
            </div>
        </div>
    );
};
