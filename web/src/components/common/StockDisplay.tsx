import React from 'react';
import { FaInfinity } from 'react-icons/fa';

export const StockDisplay: React.FC<{ stock: number }> = ({ stock }) => {
    if (stock === -1) {
        return <div className="item-stock unlimited"><FaInfinity size={10} /> Unlimited</div>;
    }
    if (stock === 0) {
        return <div className="item-stock out-of-stock">Out of Stock</div>;
    }
    const lowStockClass = stock > 0 && stock <= 5 ? 'low' : '';
    return <div className={`item-stock ${lowStockClass}`}>{stock} in stock</div>;
};