import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { useVisibility } from '../providers/VisibilityProvider';
import {
    FaStore, FaShoppingCart, FaUserShield, FaTrash, FaPlus, FaMinus, FaTags,
    FaBoxOpen, FaClipboardList, FaGem, FaEdit, FaPlusCircle, FaUsersCog,
    FaSearch, FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaTimes, FaInfinity, FaCar,
    FaTicketAlt
} from 'react-icons/fa';

// --- TYPE DEFINITIONS ---
interface Player { diamonds: number; isAdmin: boolean; }
interface ShopConfig { testDriveEnabled: boolean; }
interface Item { id: number; category_id: number | string; name: string; description: string; image_url: string; price: number; type: 'item' | 'vehicle'; item_name: string; stock: number; }
interface Category { id: number; name: string; logo_url: string; display_order: number; items: Item[]; }
interface CartItem extends Item { quantity: number; }
interface Log { id: number; citizenid: string; player_name: string; log_type: 'purchase' | 'admin_add' | 'admin_edit' | 'admin_delete' | 'admin_give_diamonds' | 'admin_take_diamonds' | 'test_drive'; message: string; timestamp: string; }
interface ManagedPlayer { name: string; identifier: string; diamonds: number; }
interface AdminFeedback { type: 'success' | 'error'; message: string; id: number; }
type AdminView = 'categories' | 'items' | 'logs' | 'players';
interface DeleteTarget { type: 'category' | 'item'; id: number; name: string; }

const initialCategory: Omit<Category, 'id' | 'items'> = { name: '', logo_url: '', display_order: 0 };
const initialItem: Omit<Item, 'id'> = { category_id: '', name: '', description: '', image_url: '', price: 10, type: 'item', item_name: '', stock: -1 };

// --- NEW COMPONENT: RedeemCodeModal ---
const RedeemCodeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onRedeem: (code: string) => Promise<void>;
    feedback: AdminFeedback | null;
}> = ({ isOpen, onClose, onRedeem, feedback }) => {
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (feedback) {
            setIsSubmitting(false);
        }
    }, [feedback]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || !code) return;
        setIsSubmitting(true);
        onRedeem(code);
    };

    return (
        <div className="redeem-modal-overlay" onClick={onClose}>
            <div className="redeem-modal-content" onClick={e => e.stopPropagation()}>
                <div className="redeem-modal-header">
                    <h3>Redeem a Code</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="redeem-modal-body">
                        <p>Enter your purchased code below to claim your rewards.</p>
                        <ModalFeedback feedback={feedback} />
                        <div className="redeem-form-group">
                            <input
                                type="text"
                                placeholder="YOUR-CODE-HERE"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="redeem-modal-buttons">
                           <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                           <button type="submit" className="redeem-btn" disabled={!code || isSubmitting}>
                               {isSubmitting ? 'Redeeming...' : 'Redeem'}
                           </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- UNIVERSAL COMPONENTS ---
const ImageWithFallback: React.FC<{ src?: string; alt: string; fallbackText: string; className?: string }> = ({ src, alt, fallbackText, ...props }) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [src]);
    if (error || !src) {
        return <div className="image-fallback-container"><span>{fallbackText}</span></div>;
    }
    return <img src={src} alt={alt} onError={() => setError(true)} {...props} />;
};
const AdminFeedbackBanner: React.FC<{ feedback: AdminFeedback | null; onDismiss: () => void; }> = ({ feedback, onDismiss }) => {
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(onDismiss, 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback, onDismiss]);
    if (!feedback) return null;
    return (
        <div className={`admin-feedback-banner ${feedback.type}`}>
            {feedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{feedback.message}</span>
            <button className="dismiss-btn" onClick={onDismiss}><FaTimes /></button>
        </div>
    );
};
const AdminPlaceholder: React.FC<{ title: string; message: string }> = ({ title, message }) => ( <div className="admin-placeholder"><FaEdit className="placeholder-icon" /><h3>{title}</h3><p>{message}</p></div> );
const ModalFeedback: React.FC<{ feedback: AdminFeedback | null }> = ({ feedback }) => {
    if (!feedback) return null;
    return <div className={`modal-feedback ${feedback.type}`}>{feedback.message}</div>;
};
const StockDisplay: React.FC<{ stock: number }> = ({ stock }) => {
    if (stock === -1) {
        return <div className="item-stock unlimited"><FaInfinity size={10} /> Unlimited</div>;
    }
    if (stock === 0) {
        return <div className="item-stock out-of-stock">Out of Stock</div>;
    }
    const lowStockClass = stock > 0 && stock <= 5 ? 'low' : '';
    return <div className={`item-stock ${lowStockClass}`}>{stock} in stock</div>;
};
const ConfirmationModal: React.FC<{
    target: DeleteTarget | null;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ target, onConfirm, onCancel }) => {
    if (!target) return null;
    const isCategory = target.type === 'category';
    const warningText = isCategory ? 'This will also delete all items within this category.' : '';
    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-content">
                <h3>Confirm Deletion</h3>
                <p>
                    Are you sure you want to delete the {target.type} <strong>"{target.name}"</strong>?
                    {warningText && <><br /><br /><strong>{warningText}</strong></>}
                    <br /><br />This action cannot be undone.
                </p>
                <div className="confirmation-modal-buttons">
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="confirm-btn" onClick={onConfirm}>Confirm & Delete</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
const App: React.FC = () => {
    const { setVisible } = useVisibility();
    const [isClosing, setIsClosing] = useState(false);
    const [page, setPage] = useState<'home' | 'cart' | 'admin'>('home');
    const [player, setPlayer] = useState<Player>({ diamonds: 0, isAdmin: false });
    const [config, setConfig] = useState<ShopConfig>({ testDriveEnabled: false });
    const [categories, setCategories] = useState<Category[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [globalFeedback, setGlobalFeedback] = useState<AdminFeedback | null>(null);
    const [modalFeedback, setModalFeedback] = useState<AdminFeedback | null>(null);
    const [redeemModalFeedback, setRedeemModalFeedback] = useState<AdminFeedback | null>(null);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

    // Admin State
    const [adminView, setAdminView] = useState<AdminView>('categories');
    const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Partial<Category> | null>(null);
    const [selectedItemForEdit, setSelectedItemForEdit] = useState<Partial<Item> | null>(null);
    const [managedPlayers, setManagedPlayers] = useState<ManagedPlayer[]>([]);
    const [managingPlayer, setManagingPlayer] = useState<ManagedPlayer | null>(null);
    const [diamondAmountInput, setDiamondAmountInput] = useState('');
    const [playerSearchTerm, setPlayerSearchTerm] = useState('');
    const [logFilter, setLogFilter] = useState<'all' | 'player' | 'admin' | 'test_drive'>('all');
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

    const showGlobalFeedback = (type: 'success' | 'error', message: string) => setGlobalFeedback({ type, message, id: Date.now() });
    const showModalFeedback = (type: 'success' | 'error', message: string) => setModalFeedback({ type, message, id: Date.now() });
    const showRedeemFeedback = (type: 'success' | 'error', message: string) => setRedeemModalFeedback({ type, message, id: Date.now() });

    const fetchShopData = useCallback(async () => {
        const data = await fetchNui<any>('fetchData');
        if (data) {
            setCategories(data.categories || []);
            setPlayer(data.player || { diamonds: 0, isAdmin: false });
            setLogs(data.logs || []);
            setConfig(data.config || { testDriveEnabled: false });
        }
    }, []);

    const refreshPlayers = useCallback(async () => {
        const players = await fetchNui<ManagedPlayer[]>('getAllPlayers');
        if (players) setManagedPlayers(players);
    }, []);

    useEffect(() => { fetchShopData(); }, [fetchShopData]);

    useNuiEvent<void>('forceRefresh', () => {
        showGlobalFeedback('success', 'Shop has been updated!');
        fetchShopData();
        if (player.isAdmin && adminView === 'players') {
            refreshPlayers();
        }
    });

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setVisible(false);
            fetchNui('close');
            setIsClosing(false);
        }, 300);
    }, [setVisible]);

    const handleRedeemCode = async (code: string) => {
        setRedeemModalFeedback(null);
        if (!code || !code.trim()) {
            showRedeemFeedback('error', 'Please enter a valid code.');
            return;
        }

        const result = await fetchNui<{ success: boolean; message: string; newBalance?: number }>('redeemCode', { code });

        if (result.success) {
            showRedeemFeedback('success', result.message);
            if (typeof result.newBalance === 'number') {
                setPlayer(p => ({ ...p, diamonds: result.newBalance! }));
            }
        } else {
            showRedeemFeedback('error', result.message || 'An unknown error occurred.');
        }
    };
    
    const handlePurchase = useCallback(async () => {
        const result = await fetchNui<{ success: boolean, message: string, newBalance?: number }>('purchase', { cart });
        if (result.success) {
            showGlobalFeedback('success', result.message || 'Purchase successful!');
            setCart([]);
            if (typeof result.newBalance === 'number') setPlayer(p => ({ ...p, diamonds: result.newBalance! }));
            setPage('home');
            setSelectedCategory(null);
        } else {
            showGlobalFeedback('error', result.message || 'Purchase failed.');
        }
    }, [cart]);

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
    
    const handleTestDrive = async (vehicleSpawnCode: string) => {
        showGlobalFeedback('success', 'Spawning vehicle for test drive...');
        await fetchNui('startTestDrive', { vehicle: vehicleSpawnCode });
        handleClose();
    };
    
    const handleAdminAction = useCallback(async (action: string, payload: any, successMsg: string) => {
        const result = await fetchNui<{ success: boolean, message: string }>('adminAction', { action, payload });
        if (result.success) {
            showGlobalFeedback('success', successMsg);
            setSelectedCategoryForEdit(null);
            setSelectedItemForEdit(null);
        } else {
            showGlobalFeedback('error', result.message || 'Action failed.');
        }
    }, []);

    const handleModifyDiamonds = useCallback(async (action: 'add' | 'remove') => {
        if (!managingPlayer) return;
        const amount = parseInt(diamondAmountInput);
        if (isNaN(amount) || amount <= 0) {
            showModalFeedback('error', 'Please enter a valid amount.');
            return;
        }
        const targetPlayer = managedPlayers.find(p => p.identifier === managingPlayer.identifier);
        const targetName = targetPlayer ? targetPlayer.name : 'Unknown Player';
        const result = await fetchNui<{ success: boolean; message: string; players?: ManagedPlayer[] }>('modifyDiamonds', { identifier: managingPlayer.identifier, amount, action, targetName: targetName });
        if (result.success) {
            showModalFeedback('success', result.message);
            setDiamondAmountInput('');
            if (result.players) setManagedPlayers(result.players);
        } else {
            showModalFeedback('error', result.message || 'Action failed.');
        }
    }, [managingPlayer, diamondAmountInput, managedPlayers]);

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryForEdit) return;
        if (!selectedCategoryForEdit.name || selectedCategoryForEdit.name.trim() === '') {
            showGlobalFeedback('error', 'Category Name cannot be empty.'); return;
        }
        handleAdminAction(selectedCategoryForEdit.id ? 'edit_category' : 'add_category', selectedCategoryForEdit, `Category '${selectedCategoryForEdit.name}' saved.`);
    };

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItemForEdit) return;
        if (!selectedItemForEdit.name || selectedItemForEdit.name.trim() === '') {
            showGlobalFeedback('error', 'Item Name cannot be empty.'); return;
        }
        if (!selectedItemForEdit.item_name || selectedItemForEdit.item_name.trim() === '') {
            showGlobalFeedback('error', 'Item Name / Spawn Code cannot be empty.'); return;
        }
        handleAdminAction(selectedItemForEdit.id ? 'edit_item' : 'add_item', selectedItemForEdit, `Item '${selectedItemForEdit.name}' saved.`);
    };

    const handleFormChange = (e: React.ChangeEvent<any>, form: 'category' | 'item') => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseInt(value) || 0 : value;
        if (form === 'category') setSelectedCategoryForEdit(p => p ? { ...p, [name]: val } : null);
        else setSelectedItemForEdit(p => p ? { ...p, [name]: val } : null);
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        const { type, id, name } = deleteTarget;
        const action = type === 'category' ? 'delete_category' : 'delete_item';
        handleAdminAction(action, { id }, `${type.charAt(0).toUpperCase() + type.slice(1)} '${name}' deleted.`);
        setDeleteTarget(null);
    };

    const allItems = useMemo(() => categories.flatMap(cat => cat.items || []), [categories]);
    const cartTotal = useMemo(() => cart.reduce((t, i) => t + i.price * i.quantity, 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
    const filteredLogs = useMemo(() => logs.filter(log => logFilter === 'all' || (logFilter === 'player' && log.log_type === 'purchase') || (logFilter === 'admin' && (log.log_type.startsWith('admin_'))) || (logFilter === 'test_drive' && log.log_type === 'test_drive')), [logs, logFilter]);
    const filteredPlayers = useMemo(() => managedPlayers.filter(p => p.name.toLowerCase().includes(playerSearchTerm.toLowerCase()) || p.identifier.toLowerCase().includes(playerSearchTerm.toLowerCase())), [managedPlayers, playerSearchTerm]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;
    const renderHomePage = () => { 
        const isItemDisabled = (item: Item) => { 
            if (item.stock === 0) return true; 
            if (item.stock === -1) return false; 
            const itemInCart = cart.find(cartItem => cartItem.id === item.id); 
            return itemInCart && itemInCart.quantity >= item.stock; 
        };
        const getItemButtonText = (item: Item) => { 
            if (item.stock === 0) return 'Out of Stock'; 
            if (isItemDisabled(item)) return 'Max in Cart'; 
            return 'Add'; 
        }; 
    
        const filteredItems = selectedCategory ? selectedCategory.items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    
        return (
            <div key={selectedCategory ? `category-${selectedCategory.id}` : 'category-grid'} className="view-container">
                {!selectedCategory ? (
                    <div className="home-rework-container">
                        <h2 className="home-rework-header">Store Categories</h2>
                        <div className="category-grid">
                            {categories.map((cat, index) => (
                                <div key={cat.id} className="category-card-rework" onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="category-card-logo-container"><ImageWithFallback src={cat.logo_url} alt={cat.name} fallbackText={cat.name} className="category-card-logo" /></div>
                                    <div className="category-card-overlay">{cat.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="item-view-header">
                            <button className="back-button" onClick={() => setSelectedCategory(null)}><FaArrowLeft /> Back</button>
                            <h2 className="item-view-title">{selectedCategory.name}</h2>
                            <div className="search-container"><FaSearch className="search-icon" /><input type="text" className="search-bar" placeholder="Search this category..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} /></div>
                        </div>
                        <div className="items-panel">
                            {currentItems.map(item => {
                                const itemInCart = cart.find(cartItem => cartItem.id === item.id);
                                const currentQuantity = itemInCart ? itemInCart.quantity : 0;
                                const isMaxStock = item.stock !== -1 && currentQuantity >= item.stock;
    
                                return (
                                    <div key={item.id} className={`item-card ${isItemDisabled(item) ? 'disabled' : ''}`}>
                                        <StockDisplay stock={item.stock} />
                                        <div className="item-image-container"><ImageWithFallback src={item.image_url} alt={item.name} fallbackText={item.name} /></div>
                                        <div className="item-info">
                                            <h4 className="item-name">{item.name}</h4>
                                            <p className="item-desc">{item.description}</p>
                                            <div className="item-footer">
                                                <div className="item-price"><FaGem /><span>{item.price.toLocaleString()}</span></div>
                                                <div className="item-actions">
                                                    {config.testDriveEnabled && item.type === 'vehicle' && (
                                                        <button className="test-drive-btn" onClick={() => handleTestDrive(item.item_name)}><FaCar size={12} /> Test Drive</button>
                                                    )}
                                                    {currentQuantity === 0 ? (
                                                        <button className="add-to-cart-btn" onClick={() => addToCart(item)} disabled={isItemDisabled(item)}>{getItemButtonText(item)}</button>
                                                    ) : (
                                                        <div className="item-quantity-controls">
                                                            <button className="minus-btn" onClick={() => updateCartQuantity(item.id, -1)}><FaMinus /></button>
                                                            <span>{currentQuantity}</span>
                                                            <button className="plus-btn" onClick={() => updateCartQuantity(item.id, 1)} disabled={isMaxStock}><FaPlus /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Pagination 
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={filteredItems.length}
                            paginate={setCurrentPage}
                            currentPage={currentPage}
                        />
                    </>
                )}
            </div>
        );
    };

    const renderCartPage = () => { 
        if (cart.length === 0) return (
            <div className="cart-empty-state">
                <FaShoppingCart size={60} className="empty-cart-icon" />
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <button className="back-to-shop-btn" onClick={() => { setPage('home'); setSelectedCategory(null); }}><FaStore /> Continue Shopping</button>
            </div>
        ); 
        return (
            <div className="cart-page-reworked">
                <h2 className="cart-page-title">Your Shopping Cart</h2>
                <div className="cart-content-layout">
                    <div className="cart-items-panel-reworked">
                        <div className="cart-items-header">
                            <div className="header-product">Product</div>
                            <div className="header-quantity">Quantity</div>
                            <div className="header-subtotal">Subtotal</div>
                            <div className="header-remove"></div>
                        </div>
                        <div className="cart-items-list">{cart.map(item => (
                            <div key={item.id} className='cart-item-reworked'>
                                <div className="cart-item-product">
                                    <div className='cart-item-image-container'><ImageWithFallback src={item.image_url} alt={item.name} fallbackText={item.name} /></div>
                                    <div className='cart-item-info'>
                                        <div className='cart-item-name'>{item.name}</div>
                                        <div className='cart-item-price-each'><FaGem /> {item.price.toLocaleString()} each</div>
                                    </div>
                                </div>
                                <div className='cart-quantity-controls'>
                                    <button onClick={() => updateCartQuantity(item.id, -1)} disabled={item.quantity <= 1}><FaMinus /></button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.id, 1)} disabled={item.stock !== -1 && item.quantity >= item.stock}><FaPlus /></button>
                                </div>
                                <div className="cart-item-subtotal"><FaGem /> {(item.price * item.quantity).toLocaleString()}</div>
                                <div className="cart-item-remove"><button className='remove-from-cart-btn' onClick={() => removeFromCart(item.id)}><FaTrash /></button></div>
                            </div>
                        ))}</div>
                    </div>
                    <aside className="cart-summary-panel">
                        <h3>Order Summary</h3>
                        <div className="summary-row"><span>Your Balance</span><span className="summary-balance"><FaGem /> {player.diamonds.toLocaleString()}</span></div>
                        <div className="summary-row"><span>Cart Subtotal</span><span><FaGem /> {cartTotal.toLocaleString()}</span></div>
                        <hr className="summary-divider" />
                        <div className="summary-row total-row"><span>Total Cost</span><span className="summary-total"><FaGem /> {cartTotal.toLocaleString()}</span></div>
                        {cartTotal > player.diamonds && (<div className="insufficient-funds-warning">You do not have enough diamonds for this purchase.</div>)}
                        <button className='purchase-btn-reworked' onClick={handlePurchase} disabled={cartTotal > player.diamonds || cartTotal === 0}>{cartTotal > player.diamonds ? 'Insufficient Diamonds' : 'Complete Purchase'}</button>
                    </aside>
                </div>
            </div>
        );
    };

    const renderAdminPage = () => {
        let currentView;
        switch (adminView) {
            case 'categories': currentView = ( <div className="admin-management-view"><div className="admin-list-panel"><div className="admin-list-header"><h4 className="admin-list-title">All Categories</h4><button className="create-new-btn" onClick={() => setSelectedCategoryForEdit(initialCategory)}><FaPlusCircle /> New</button></div><ul className="admin-list">{categories.map(cat => (<li key={cat.id} className={`admin-list-item ${selectedCategoryForEdit?.id === cat.id ? 'selected' : ''}`} onClick={() => setSelectedCategoryForEdit(cat)}>{cat.name} <span>#{cat.id}</span></li>))}</ul></div><div className="admin-form-panel">{selectedCategoryForEdit ? (<form className="admin-form" onSubmit={handleCategorySubmit}><h3>{selectedCategoryForEdit.id ? <><span className="editing-badge">Editing</span> {selectedCategoryForEdit.name}</> : 'Create New Category'}</h3><div className="admin-form-group"><label>Category Name</label><input type="text" name="name" value={selectedCategoryForEdit.name || ''} onChange={e => handleFormChange(e, 'category')} required /></div><div className="admin-form-group"><label>Logo URL</label><input type="text" name="logo_url" value={selectedCategoryForEdit.logo_url || ''} onChange={e => handleFormChange(e, 'category')} /></div><div className="admin-form-group"><label>Display Order</label><input type="number" name="display_order" value={selectedCategoryForEdit.display_order ?? 0} onChange={e => handleFormChange(e, 'category')} required /></div><div className="admin-form-buttons"><button type="submit" className="form-btn save">Save Changes</button>{selectedCategoryForEdit.id && <button type="button" className="form-btn delete" onClick={() => setDeleteTarget({ type: 'category', id: selectedCategoryForEdit.id as number, name: selectedCategoryForEdit.name || 'Unknown' })}>Delete</button>}</div></form>) : (<AdminPlaceholder title="Manage Categories" message="Select a category to edit, or create a new one." />)}</div></div>); break;
            case 'items': currentView = ( <div className="admin-management-view"><div className="admin-list-panel"><div className="admin-list-header"><h4 className="admin-list-title">All Items</h4><button className="create-new-btn" onClick={() => setSelectedItemForEdit({ ...initialItem, category_id: categories[0]?.id || '' })}><FaPlusCircle /> New</button></div><ul className="admin-list">{allItems.map(item => (<li key={item.id} className={`admin-list-item ${selectedItemForEdit?.id === item.id ? 'selected' : ''}`} onClick={() => setSelectedItemForEdit(item)}>{item.name} <span>#{item.id}</span></li>))}</ul></div><div className="admin-form-panel">{selectedItemForEdit ? (<form className="admin-form" onSubmit={handleItemSubmit}><h3>{selectedItemForEdit.id ? <><span className="editing-badge">Editing</span> {selectedItemForEdit.name}</> : 'Create New Item'}</h3><div className="admin-form-group"><label>Item Name</label><input type="text" name="name" value={selectedItemForEdit.name || ''} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-group"><label>Category</label><select name="category_id" value={selectedItemForEdit.category_id || ''} onChange={e => handleFormChange(e, 'item')} required><option value="" disabled>Select...</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div><div className="admin-form-group"><label>Description</label><textarea name="description" value={selectedItemForEdit.description || ''} onChange={e => handleFormChange(e, 'item')} rows={3} /></div><div className="admin-form-group"><label>Image URL</label><input type="text" name="image_url" value={selectedItemForEdit.image_url || ''} onChange={e => handleFormChange(e, 'item')} /></div><div className="admin-form-group"><label>Price (Diamonds)</label><input type="number" name="price" min="0" value={selectedItemForEdit.price ?? 10} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-group"><label>Stock <small>(-1 for infinite)</small></label><input type="number" name="stock" min="-1" value={selectedItemForEdit.stock ?? -1} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-group"><label>Type</label><select name="type" value={selectedItemForEdit.type || 'item'} onChange={e => handleFormChange(e, 'item')} required><option value="item">Item</option><option value="vehicle">Vehicle</option></select></div><div className="admin-form-group"><label>Item Name / Vehicle Spawn Code</label><input type="text" name="item_name" value={selectedItemForEdit.item_name || ''} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-buttons"><button type="submit" className="form-btn save">Save Changes</button>{selectedItemForEdit.id && <button type="button" className="form-btn delete" onClick={() => setDeleteTarget({ type: 'item', id: selectedItemForEdit.id as number, name: selectedItemForEdit.name || 'Unknown' })}>Delete</button>}</div></form>) : (<AdminPlaceholder title="Manage Items" message="Select an item to edit, or create one." />)}</div></div>); break;
            case 'logs': currentView = (<div className="admin-view"><div className="admin-view-header"><h2 className="admin-view-title">Activity Logs</h2><div className="log-filter-controls"><button className={`log-filter-btn ${logFilter === 'all' ? 'active' : ''}`} onClick={() => setLogFilter('all')}>All</button><button className={`log-filter-btn ${logFilter === 'player' ? 'active' : ''}`} onClick={() => setLogFilter('player')}>Purchases</button><button className={`log-filter-btn ${logFilter === 'admin' ? 'active' : ''}`} onClick={() => setLogFilter('admin')}>Admin</button><button className={`log-filter-btn ${logFilter === 'test_drive' ? 'active' : ''}`} onClick={() => setLogFilter('test_drive')}>Test Drives</button></div></div><div className='log-list-rework'>{filteredLogs.length > 0 ? (filteredLogs.map(log => (<div key={log.id} className='log-entry'><span className='log-timestamp'>{new Date(log.timestamp).toLocaleString()}</span><span className={`log-type log-type-${log.log_type}`}>{log.log_type.replace(/_/g, ' ')}</span><span className="log-message">{log.message} - <span className="log-player-name">{log.player_name || 'N/A'}</span></span></div>))) : (<div className="log-empty-state"><FaClipboardList size={40} /><h3>No Logs Found</h3><p>There are no logs matching the current filter.</p></div>)}</div></div>); break;
            case 'players': currentView = ( <div className="admin-view player-management-rework"><div className="player-management-header"><div className="search-container"><FaSearch className="search-icon" /><input type="text" className="search-bar" placeholder={`Search ${managedPlayers.length} players...`} value={playerSearchTerm} onChange={(e) => setPlayerSearchTerm(e.target.value)} /></div><button className="create-new-btn" onClick={refreshPlayers}>Refresh List</button></div><div className="player-management-list-container">{filteredPlayers.length > 0 ? (<table className="player-list-table"><thead><tr><th>Player</th><th>Diamonds</th><th>Actions</th></tr></thead><tbody>{filteredPlayers.map(p => (<tr key={p.identifier}><td><div className="player-list-name">{p.name}</div><div className="player-list-identifier">{p.identifier}</div></td><td><div className="player-list-diamonds"><FaGem size={14} /><span>{p.diamonds.toLocaleString()}</span></div></td><td><button className="manage-player-btn" onClick={() => { setModalFeedback(null); setDiamondAmountInput(''); setManagingPlayer(p); }}>Manage</button></td></tr>))}</tbody></table>) : (<div className="player-list-empty-state"><h3>No Players Found</h3><p>Your search returned no results.</p></div>)}</div></div>); break;
            default: currentView = null;
        }
        return (
            <div className="admin-page-rework">
                <aside className="admin-sidebar">
                    <h2>Admin Panel</h2>
                    <button className={`admin-nav-btn ${adminView === 'categories' ? 'active' : ''}`} onClick={() => setAdminView('categories')}><FaTags /> Categories</button>
                    <button className={`admin-nav-btn ${adminView === 'items' ? 'active' : ''}`} onClick={() => setAdminView('items')}><FaBoxOpen /> Items</button>
                    <button className={`admin-nav-btn ${adminView === 'players' ? 'active' : ''}`} onClick={() => { setAdminView('players'); refreshPlayers(); }}><FaUsersCog /> Players</button>
                    <button className={`admin-nav-btn ${adminView === 'logs' ? 'active' : ''}`} onClick={() => setAdminView('logs')}><FaClipboardList /> Logs</button>
                </aside>
                <main className="admin-content-area">
                    {currentView}
                    {managingPlayer && (
                        <div className="player-modal-overlay" onClick={() => setManagingPlayer(null)}>
                            <div className="player-modal-content" onClick={e => e.stopPropagation()}>
                                <div className="player-modal-header"><h3>Manage {managingPlayer.name}</h3><button className="close-modal-btn" onClick={() => setManagingPlayer(null)}>×</button></div>
                                <div className="player-modal-body">
                                    <div className="player-info-card">
                                        <div className="player-id">Identifier: {managingPlayer.identifier}</div>
                                        <div className="player-diamond-balance"><FaGem /><span>{managedPlayers.find(p => p.identifier === managingPlayer.identifier)?.diamonds.toLocaleString() ?? '...'}</span></div>
                                    </div>
                                    <div className="player-actions-form">
                                        <h4>Modify Diamond Balance</h4><ModalFeedback feedback={modalFeedback} />
                                        <div className="actions-input-group">
                                            <input type="number" placeholder="Amount..." value={diamondAmountInput} onChange={e => setDiamondAmountInput(e.target.value)} min="1" />
                                            <button className="action-btn add" onClick={() => handleModifyDiamonds('add')}>Add</button>
                                            <button className="action-btn remove" onClick={() => handleModifyDiamonds('remove')}>Remove</button>
                                        </div>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    const renderPage = () => {
        switch (page) {
            case 'home': return renderHomePage();
            case 'cart': return renderCartPage();
            case 'admin': return player.isAdmin ? renderAdminPage() : null;
            default: return null;
        }
    };

    return (
        <div className="shop-overlay">
            <div className={`app-container ${isClosing ? 'closing' : ''}`}>
                <AdminFeedbackBanner feedback={globalFeedback} onDismiss={() => setGlobalFeedback(null)} />
                <header className="header">
                    <div className="macos-buttons">
                        <button className="macos-btn close-btn" onClick={handleClose}></button>
                        <button className="macos-btn minimize-btn"></button>
                        <button className="macos-btn maximize-btn"></button>
                    </div>

                    <nav className="nav">
                        <button className={`nav-btn ${page === 'home' ? 'active' : ''}`} onClick={() => { setPage('home'); setSelectedCategory(null); }}>
                            <FaStore /> Home
                        </button>
                        {player.isAdmin && (
                            <button className={`nav-btn ${page === 'admin' ? 'active' : ''}`} onClick={() => setPage('admin')}>
                                <FaUserShield /> Admin
                            </button>
                        )}
                    </nav>

                    <div className="header-user-actions">
                        <button
                            title="Redeem Code"
                            className="header-action-btn"
                            onClick={() => {
                                setRedeemModalFeedback(null);
                                setIsRedeemModalOpen(true);
                            }}
                        >
                            <FaTicketAlt />
                        </button>

                        <button
                            title="View Cart"
                            className={`header-action-btn ${page === 'cart' ? 'active' : ''}`}
                            onClick={() => setPage('cart')}
                        >
                            <FaShoppingCart />
                            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
                        </button>

                        <div className="user-balance">
                            <FaGem />
                            <span>{player.diamonds.toLocaleString()}</span>
                        </div>
                    </div>
                </header>
                <main className="main-content">
                    {renderPage()}
                </main>
                <ConfirmationModal target={deleteTarget} onConfirm={handleConfirmDelete} onCancel={() => setDeleteTarget(null)} />

                <RedeemCodeModal
                    isOpen={isRedeemModalOpen}
                    onClose={() => setIsRedeemModalOpen(false)}
                    onRedeem={handleRedeemCode}
                    feedback={redeemModalFeedback}
                />
            </div>
        </div>
    );
};

const Pagination: React.FC<{
    itemsPerPage: number;
    totalItems: number;
    paginate: (pageNumber: number) => void;
    currentPage: number;
}> = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) {
        return null;
    }

    return (
        <nav className="pagination-container">
            <ul className="pagination-list">
                {pageNumbers.map(number => (
                    <li key={number} className={`pagination-item ${currentPage === number ? 'active' : ''}`}>
                        <button onClick={() => paginate(number)} className="pagination-link">
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default App;