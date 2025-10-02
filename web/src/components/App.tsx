import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { useVisibility } from '../providers/VisibilityProvider';
import { Player, ShopConfig, Category, Item, CartItem, Log, AdminFeedback, DeleteTarget } from '../utils/types';

// Pages and Modals
import { HomePage } from '../components/HomePage';
import { CartPage } from '../components/CartPage';
import { AdminPage } from '../components/AdminPage';
import { RedeemCodeModal } from '../components/RedeemCodeModal';

// Common Components
import { AdminFeedbackBanner } from '../components/common/AdminFeedbackBanner';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Icons
import { FaStore, FaShoppingCart, FaUserShield, FaGem, FaTicketAlt } from 'react-icons/fa';

const App: React.FC = () => {
    const { setVisible } = useVisibility();
    const [isClosing, setIsClosing] = useState(false);
    const [page, setPage] = useState<'home' | 'cart' | 'admin'>('home');

    // Global State
    const [player, setPlayer] = useState<Player>({ diamonds: 0, isAdmin: false });
    const [config, setConfig] = useState<ShopConfig>({ testDriveEnabled: false });
    const [categories, setCategories] = useState<Category[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    
    // UI State
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [globalFeedback, setGlobalFeedback] = useState<AdminFeedback | null>(null);
    const [redeemModalFeedback, setRedeemModalFeedback] = useState<AdminFeedback | null>(null);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

    const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

    const showGlobalFeedback = (type: 'success' | 'error', message: string) => setGlobalFeedback({ type, message, id: Date.now() });

    const fetchShopData = useCallback(async () => {
        const data = await fetchNui<any>('fetchData');
        if (data) {
            setCategories(data.categories || []);
            setPlayer(data.player || { diamonds: 0, isAdmin: false });
            setLogs(data.logs || []);
            setConfig(data.config || { testDriveEnabled: false });
        }
    }, []);

    useEffect(() => { fetchShopData(); }, [fetchShopData]);
    useNuiEvent<void>('forceRefresh', () => { showGlobalFeedback('success', 'Shop has been updated!'); fetchShopData(); });

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => { setVisible(false); fetchNui('close'); setIsClosing(false); }, 300);
    }, [setVisible]);

    const handleRedeemCode = async (code: string) => {
        setRedeemModalFeedback(null);
        if (!code.trim()) { setRedeemModalFeedback({ type: 'error', message: 'Please enter a valid code.', id: Date.now() }); return; }
        const result = await fetchNui<{ success: boolean; message: string; newBalance?: number }>('redeemCode', { code });
        if (result.success) {
            setRedeemModalFeedback({ type: 'success', message: result.message, id: Date.now() });
            if (typeof result.newBalance === 'number') setPlayer(p => ({ ...p, diamonds: result.newBalance! }));
        } else {
            setRedeemModalFeedback({ type: 'error', message: result.message || 'An unknown error occurred.', id: Date.now() });
        }
    };

    const handlePurchase = useCallback(async () => {
        const result = await fetchNui<{ success: boolean, message: string, newBalance?: number }>('purchase', { cart });
        if (result?.success) {
            showGlobalFeedback('success', result.message || 'Purchase successful!');
            setCart([]);
            if (typeof result.newBalance === 'number') setPlayer(p => ({ ...p, diamonds: result.newBalance! }));
            setPage('home');
        } else {
            showGlobalFeedback('error', result?.message || 'Purchase failed.');
        }
    }, [cart]);

    const handleTestDrive = async (vehicleSpawnCode: string) => {
        showGlobalFeedback('success', 'Spawning vehicle for test drive...');
        await fetchNui('startTestDrive', { vehicle: vehicleSpawnCode });
        handleClose();
    };
    
    const handleAdminAction = useCallback(async (action: string, payload: any, successMsg: string) => {
        const result = await fetchNui<{ success: boolean, message: string }>('adminAction', { action, payload });
        if (result?.success) {
            showGlobalFeedback('success', successMsg);
            fetchShopData(); // Refresh all data after a successful admin action
        } else {
            showGlobalFeedback('error', result?.message || 'Action failed.');
        }
    }, [fetchShopData]);

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        const { type, id, name } = deleteTarget;
        const action = type === 'category' ? 'delete_category' : 'delete_item';
        handleAdminAction(action, { id }, `${type.charAt(0).toUpperCase() + type.slice(1)} '${name}' deleted.`);
        setDeleteTarget(null);
    };

    const addToCart = (item: Item) => {
        const existingItem = cart.find(i => i.id === item.id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        if (item.stock !== -1 && currentQtyInCart >= item.stock) {
            showGlobalFeedback('error', `No more stock available for ${item.name}.`);
            return;
        }
        if (existingItem) {
            setCart(p => p.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart(p => [...p, { ...item, quantity: 1 }]);
        }
    };

    const updateCartQuantity = (id: number, change: number) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: i.quantity + change } : i).filter(i => i.quantity > 0));
    const removeFromCart = (id: number) => setCart(p => p.filter(i => i.id !== id));
    
    const handleOpenCart = () => {
        if (page === 'cart') return;
        setIsCartLoading(true); setPage('cart');
        setTimeout(() => setIsCartLoading(false), 500);
    };

    const renderPage = () => {
        switch (page) {
            case 'home': return <HomePage categories={categories} cart={cart} config={config} onAddToCart={addToCart} onUpdateCartQuantity={updateCartQuantity} onTestDrive={handleTestDrive} onNavigateHome={() => setPage('home')} />;
            case 'cart': return isCartLoading ? <LoadingSpinner /> : <CartPage cart={cart} player={player} onUpdateQuantity={updateCartQuantity} onRemoveItem={removeFromCart} onPurchase={handlePurchase} onNavigateHome={() => setPage('home')} />;
            case 'admin': return player.isAdmin ? <AdminPage categories={categories} logs={logs} onAdminAction={handleAdminAction} showGlobalFeedback={showGlobalFeedback} setDeleteTarget={setDeleteTarget} /> : null;
            default: return null;
        }
    };

    return (
        <div className="shop-overlay">
            <div className={`app-container ${isClosing ? 'closing' : ''}`}>
                <AdminFeedbackBanner feedback={globalFeedback} onDismiss={() => setGlobalFeedback(null)} />
                <header className="header">
                    <div className="macos-buttons"><button className="macos-btn close-btn" onClick={handleClose}></button><button className="macos-btn minimize-btn"></button><button className="macos-btn maximize-btn"></button></div>
                    <nav className="nav">
                        <button className={`nav-btn ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}><FaStore /> Home</button>
                        {player.isAdmin && <button className={`nav-btn ${page === 'admin' ? 'active' : ''}`} onClick={() => setPage('admin')}><FaUserShield /> Admin</button>}
                    </nav>
                    <div className="header-user-actions">
                        <button title="Redeem Code" className="header-action-btn" onClick={() => { setRedeemModalFeedback(null); setIsRedeemModalOpen(true); }}><FaTicketAlt /></button>
                        <button title="View Cart" className={`header-action-btn ${page === 'cart' ? 'active' : ''}`} onClick={handleOpenCart}>
                            <FaShoppingCart />{cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
                        </button>
                        <div className="user-balance"><FaGem /><span>{player.diamonds.toLocaleString()}</span></div>
                    </div>
                </header>
                <main className="main-content">{renderPage()}</main>
                <ConfirmationModal target={deleteTarget} onConfirm={handleConfirmDelete} onCancel={() => setDeleteTarget(null)} />
                <RedeemCodeModal isOpen={isRedeemModalOpen} onClose={() => setIsRedeemModalOpen(false)} onRedeem={handleRedeemCode} feedback={redeemModalFeedback} />
            </div>
        </div>
    );
};

export default App;