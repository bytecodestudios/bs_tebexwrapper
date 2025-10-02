import React, { useState, useMemo } from 'react';
import { Category, Item, CartItem, ShopConfig } from '../utils/types';
import { FaArrowLeft, FaSearch, FaGem, FaCar, FaMinus, FaPlus, FaStore } from 'react-icons/fa';
import { ImageWithFallback } from './common/ImageWithFallback';
import { StockDisplay } from './common/StockDisplay';
import { Pagination } from './common/Pagination';

const ITEMS_PER_PAGE = 12;

interface HomePageProps {
    categories: Category[];
    cart: CartItem[];
    config: ShopConfig;
    onAddToCart: (item: Item) => void;
    onUpdateCartQuantity: (id: number, change: number) => void;
    onTestDrive: (vehicleSpawnCode: string) => void;
    onNavigateHome: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ categories, cart, config, onAddToCart, onUpdateCartQuantity, onTestDrive, onNavigateHome }) => {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        setSearchTerm('');
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCurrentPage(1);
        setSearchTerm('');
    };
    
    const isItemDisabled = (item: Item) => {
        if (item.stock === 0) return true;
        if (item.stock === -1) return false;
        const itemInCart = cart.find(cartItem => cartItem.id === item.id);
        return !!itemInCart && itemInCart.quantity >= item.stock;
    };
    const getItemButtonText = (item: Item) => isItemDisabled(item) ? (item.stock === 0 ? 'Out of Stock' : 'Max in Cart') : 'Add';

    const renderCategoryGrid = () => (
        <div className="home-rework-container">
            <h2 className="home-rework-header">Store Categories</h2>
            <div className="category-grid">
                {categories.map((cat, index) => (
                    <div key={cat.id} className="category-card-rework" onClick={() => handleCategorySelect(cat)} style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="category-card-logo-container"><ImageWithFallback src={cat.logo_url} alt={cat.name} fallbackText={cat.name} className="category-card-logo" /></div>
                        <div className="category-card-overlay">{cat.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderItemView = () => {
        if (!selectedCategory) return null;
        const filteredItems = selectedCategory.items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const currentItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        return (
            <>
                <div className="item-view-header">
                    <button className="back-button" onClick={handleBackToCategories}><FaArrowLeft /> Back</button>
                    <h2 className="item-view-title">{selectedCategory.name}</h2>
                    <div className="search-container"><FaSearch className="search-icon" /><input type="text" className="search-bar" placeholder="Search this category..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} /></div>
                </div>
                <div className="items-panel">
                    {currentItems.map(item => {
                        const itemInCart = cart.find(ci => ci.id === item.id);
                        const currentQuantity = itemInCart?.quantity || 0;
                        const isMaxStock = item.stock !== -1 && currentQuantity >= item.stock;
                        return (
                            <div key={item.id} className={`item-card ${isItemDisabled(item) ? 'disabled' : ''}`}>
                                <StockDisplay stock={item.stock} />
                                <div className="item-image-container"><ImageWithFallback src={item.image_url} alt={item.name} fallbackText={item.name} /></div>
                                <div className="item-info">
                                    <h4 className="item-name">{item.name}</h4><p className="item-desc">{item.description}</p>
                                    <div className="item-footer">
                                        <div className="item-price"><FaGem /><span>{item.price.toLocaleString()}</span></div>
                                        <div className="item-actions">
                                            {config.testDriveEnabled && item.type === 'vehicle' && <button className="test-drive-btn" onClick={() => onTestDrive(item.item_name)}><FaCar size={12} /> Test Drive</button>}
                                            {currentQuantity === 0 ? (
                                                <button className="add-to-cart-btn" onClick={() => onAddToCart(item)} disabled={isItemDisabled(item)}>{getItemButtonText(item)}</button>
                                            ) : (
                                                <div className="item-quantity-controls-wrapper">
                                                    <button className="minus-btn" onClick={() => onUpdateCartQuantity(item.id, -1)}><FaMinus /></button>
                                                    <span>{currentQuantity}</span>
                                                    <button className="plus-btn" onClick={() => onUpdateCartQuantity(item.id, 1)} disabled={isMaxStock}><FaPlus /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredItems.length} paginate={setCurrentPage} currentPage={currentPage} />
            </>
        );
    };

    return <div className="view-container">{selectedCategory ? renderItemView() : renderCategoryGrid()}</div>;
};