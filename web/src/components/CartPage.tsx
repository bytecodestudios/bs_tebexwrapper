import React from 'react'; // 'useMemo' has been removed from the import
import { CartItem, Player } from '../utils/types';
import { FaShoppingCart, FaStore, FaGem, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { ImageWithFallback } from './common/ImageWithFallback';

interface CartPageProps {
    cart: CartItem[];
    player: Player;
    onUpdateQuantity: (id: number, change: number) => void;
    onRemoveItem: (id: number) => void;
    onPurchase: () => void;
    onNavigateHome: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
    cart,
    player,
    onUpdateQuantity,
    onRemoveItem,
    onPurchase,
    onNavigateHome
}) => {
    // --- THIS IS THE CHANGED LINE ---
    // The calculation is now done on every render without useMemo.
    const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

    if (cart.length === 0) {
        return (
            <div className="cart-empty-state">
                <FaShoppingCart size={60} className="empty-cart-icon" />
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <button className="back-to-shop-btn" onClick={onNavigateHome}>
                    <FaStore /> Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page-reworked">
            <h2 className="cart-page-title">Your Shopping Cart</h2>
            <div className="cart-content-layout">
                <div className="cart-items-panel-reworked">
                    <div className="cart-items-list">{cart.map(item => (
                        <div key={item.id} className='cart-item-reworked'>
                            <div className='cart-item-image-container'>
                                <ImageWithFallback src={item.image_url} alt={item.name} fallbackText={item.name} />
                            </div>
                            <div className='cart-item-info'>
                                <div className='cart-item-name'>{item.name}</div>
                                <div className='cart-item-price-each'><FaGem /> {item.price.toLocaleString()} each</div>
                            </div>
                            <div className="cart-item-controls-group">
                                <div className='cart-quantity-controls'>
                                    <button onClick={() => onUpdateQuantity(item.id, -1)}>
                                        <FaMinus />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, 1)} disabled={item.stock !== -1 && item.quantity >= item.stock}>
                                        <FaPlus />
                                    </button>
                                </div>
                                <div className="cart-item-subtotal">
                                    <FaGem /> {(item.price * item.quantity).toLocaleString()}
                                </div>
                                <button className='remove-from-cart-btn' onClick={() => onRemoveItem(item.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}</div>
                </div>
                <aside className="cart-summary-panel">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Your Balance</span>
                        <span className="summary-balance"><FaGem /> {player.diamonds.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                        <span>Cart Subtotal</span>
                        <span><FaGem /> {cartTotal.toLocaleString()}</span>
                    </div>
                    <hr className="summary-divider" />
                    <div className="summary-row total-row">
                        <span>Total Cost</span>
                        <span className="summary-total"><FaGem /> {cartTotal.toLocaleString()}</span>
                    </div>
                    {cartTotal > player.diamonds && (
                        <div className="insufficient-funds-warning">You do not have enough diamonds for this purchase.</div>
                    )}
                    <button
                        className='purchase-btn-reworked'
                        onClick={onPurchase}
                        disabled={cartTotal > player.diamonds || cartTotal === 0}
                    >
                        {cartTotal > player.diamonds ? 'Insufficient Diamonds' : 'Complete Purchase'}
                    </button>
                </aside>
            </div>
        </div>
    );
};