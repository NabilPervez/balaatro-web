
import React from 'react';
import type { Card as CardType } from '../../logic/types';
import './Card.css';

interface CardProps {
    card: CardType;
    isSelected: boolean;
    onClick: () => void;
}

const SUIT_SYMBOLS: Record<string, string> = {
    'Hearts': '♥',
    'Diamonds': '♦',
    'Clubs': '♣',
    'Spades': '♠'
};

export const Card: React.FC<CardProps> = ({ card, isSelected, onClick }) => {
    const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
    const symbol = SUIT_SYMBOLS[card.suit];

    return (
        <div
            className={`card ${isRed ? 'red' : 'black'} ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="card-top-left">
                <span>{card.rank}</span>
                <span>{symbol}</span>
            </div>

            <div className="card-center">
                {symbol}
            </div>

            <div className="card-bottom-right">
                <span>{card.rank}</span>
                <span>{symbol}</span>
            </div>

            {/* Enhancement Overlay could go here */}
            {card.enhancement !== 'Base' && (
                <div style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    fontSize: '0.6rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: 4
                }}>
                    {card.enhancement}
                </div>
            )}
        </div>
    );
};
