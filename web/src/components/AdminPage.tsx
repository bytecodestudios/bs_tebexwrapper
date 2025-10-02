import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Category, Item, Log, ManagedPlayer, AdminFeedback, DeleteTarget, AdminView } from '../utils/types';
import { fetchNui } from '../utils/fetchNui';
import { FaTags, FaBoxOpen, FaClipboardList, FaUsersCog, FaPlusCircle, FaSearch, FaGem, FaEdit } from 'react-icons/fa';

// Co-located helper components and constants
const initialCategory: Omit<Category, 'id' | 'items'> = { name: '', logo_url: '', display_order: 0 };
const initialItem: Omit<Item, 'id'> = { category_id: '', name: '', description: '', image_url: '', price: 10, type: 'item', item_name: '', stock: -1 };
const AdminPlaceholder: React.FC<{ title: string; message: string }> = ({ title, message }) => ( <div className="admin-placeholder"><FaEdit className="placeholder-icon" /><h3>{title}</h3><p>{message}</p></div> );
const ModalFeedback: React.FC<{ feedback: AdminFeedback | null }> = ({ feedback }) => feedback ? <div className={`modal-feedback ${feedback.type}`}>{feedback.message}</div> : null;

interface AdminPageProps { categories: Category[]; logs: Log[]; onAdminAction: (action: string, payload: any, successMsg: string) => void; showGlobalFeedback: (type: 'success' | 'error', message: string) => void; setDeleteTarget: (target: DeleteTarget | null) => void; }

export const AdminPage: React.FC<AdminPageProps> = ({ categories, logs, onAdminAction, showGlobalFeedback, setDeleteTarget }) => {
    // All admin-related state is now managed locally within this component
    const [adminView, setAdminView] = useState<AdminView>('categories');
    const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Partial<Category> | null>(null);
    const [selectedItemForEdit, setSelectedItemForEdit] = useState<Partial<Item> | null>(null);
    const [managedPlayers, setManagedPlayers] = useState<ManagedPlayer[]>([]);
    const [managingPlayer, setManagingPlayer] = useState<ManagedPlayer | null>(null);
    const [diamondAmountInput, setDiamondAmountInput] = useState('');
    const [playerSearchTerm, setPlayerSearchTerm] = useState('');
    const [logFilter, setLogFilter] = useState<'all' | 'player' | 'admin' | 'test_drive'>('all');
    const [modalFeedback, setModalFeedback] = useState<AdminFeedback | null>(null);

    const allItems = useMemo(() => categories.flatMap(cat => cat.items || []), [categories]);

    const refreshPlayers = useCallback(async () => {
        const players = await fetchNui<ManagedPlayer[]>('getAllPlayers');
        if (players) setManagedPlayers(players);
    }, []);

    useEffect(() => { if (adminView === 'players') refreshPlayers(); }, [adminView, refreshPlayers]);
    
    const handleModifyDiamonds = useCallback(async (action: 'add' | 'remove') => {
        if (!managingPlayer) return;
        const amount = parseInt(diamondAmountInput);
        if (isNaN(amount) || amount <= 0) {
            setModalFeedback({ type: 'error', message: 'Please enter a valid amount.', id: Date.now() });
            return;
        }
        const targetName = managedPlayers.find(p => p.identifier === managingPlayer.identifier)?.name || 'Unknown';
        const result = await fetchNui<{ success: boolean; message: string; players?: ManagedPlayer[] }>('modifyDiamonds', { identifier: managingPlayer.identifier, amount, action, targetName });
        if (result.success) {
            setModalFeedback({ type: 'success', message: result.message, id: Date.now() });
            setDiamondAmountInput('');
            if (result.players) setManagedPlayers(result.players);
        } else {
            setModalFeedback({ type: 'error', message: result.message || 'Action failed.', id: Date.now() });
        }
    }, [managingPlayer, diamondAmountInput, managedPlayers]);

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryForEdit?.name?.trim()) {
            showGlobalFeedback('error', 'Category Name cannot be empty.'); return;
        }
        onAdminAction(selectedCategoryForEdit.id ? 'edit_category' : 'add_category', selectedCategoryForEdit, `Category '${selectedCategoryForEdit.name}' saved.`);
        setSelectedCategoryForEdit(null);
    };

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItemForEdit?.name?.trim() || !selectedItemForEdit?.item_name?.trim()) {
            showGlobalFeedback('error', 'Item Name and Spawn Code cannot be empty.'); return;
        }
        onAdminAction(selectedItemForEdit.id ? 'edit_item' : 'add_item', selectedItemForEdit, `Item '${selectedItemForEdit.name}' saved.`);
        setSelectedItemForEdit(null);
    };

    const handleFormChange = (e: React.ChangeEvent<any>, form: 'category' | 'item') => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseInt(value) || 0 : value;
        if (form === 'category') setSelectedCategoryForEdit(p => p ? { ...p, [name]: val } : null);
        else setSelectedItemForEdit(p => p ? { ...p, [name]: val } : null);
    };
    
    const filteredLogs = useMemo(() => logs.filter(log => logFilter === 'all' || (logFilter === 'player' && log.log_type === 'purchase') || (logFilter === 'admin' && log.log_type.startsWith('admin_')) || (logFilter === 'test_drive' && log.log_type === 'test_drive')), [logs, logFilter]);
    const filteredPlayers = useMemo(() => managedPlayers.filter(p => p.name.toLowerCase().includes(playerSearchTerm.toLowerCase()) || p.identifier.toLowerCase().includes(playerSearchTerm.toLowerCase())), [managedPlayers, playerSearchTerm]);
    
    const renderCurrentView = () => {
        switch (adminView) {
            case 'categories': return ( <div className="admin-management-view"><div className="admin-list-panel"><div className="admin-list-header"><h4 className="admin-list-title">All Categories</h4><button className="create-new-btn" onClick={() => setSelectedCategoryForEdit(initialCategory)}><FaPlusCircle /> New</button></div><ul className="admin-list">{categories.map(cat => (<li key={cat.id} className={`admin-list-item ${selectedCategoryForEdit?.id === cat.id ? 'selected' : ''}`} onClick={() => setSelectedCategoryForEdit(cat)}>{cat.name} <span>#{cat.id}</span></li>))}</ul></div><div className="admin-form-panel">{selectedCategoryForEdit ? (<form className="admin-form" onSubmit={handleCategorySubmit}><h3>{selectedCategoryForEdit.id ? <><span className="editing-badge">Editing</span> {selectedCategoryForEdit.name}</> : 'Create New Category'}</h3><div className="admin-form-group"><label>Category Name</label><input type="text" name="name" value={selectedCategoryForEdit.name || ''} onChange={e => handleFormChange(e, 'category')} required /></div><div className="admin-form-group"><label>Logo URL</label><input type="text" name="logo_url" value={selectedCategoryForEdit.logo_url || ''} onChange={e => handleFormChange(e, 'category')} /></div><div className="admin-form-group"><label>Display Order</label><input type="number" name="display_order" value={selectedCategoryForEdit.display_order ?? 0} onChange={e => handleFormChange(e, 'category')} required /></div><div className="admin-form-buttons"><button type="submit" className="form-btn save">Save Changes</button>{selectedCategoryForEdit.id && <button type="button" className="form-btn delete" onClick={() => setDeleteTarget({ type: 'category', id: selectedCategoryForEdit.id as number, name: selectedCategoryForEdit.name || 'Unknown' })}>Delete</button>}</div></form>) : (<AdminPlaceholder title="Manage Categories" message="Select a category to edit, or create a new one." />)}</div></div>);
            case 'items': return ( <div className="admin-management-view"><div className="admin-list-panel"><div className="admin-list-header"><h4 className="admin-list-title">All Items</h4><button className="create-new-btn" onClick={() => setSelectedItemForEdit({ ...initialItem, category_id: categories[0]?.id || '' })}><FaPlusCircle /> New</button></div><ul className="admin-list">{allItems.map(item => (<li key={item.id} className={`admin-list-item ${selectedItemForEdit?.id === item.id ? 'selected' : ''}`} onClick={() => setSelectedItemForEdit(item)}>{item.name} <span>#{item.id}</span></li>))}</ul></div><div className="admin-form-panel">{selectedItemForEdit ? (<form className="admin-form" onSubmit={handleItemSubmit}><h3>{selectedItemForEdit.id ? <><span className="editing-badge">Editing</span> {selectedItemForEdit.name}</> : 'Create New Item'}</h3><div className="admin-form-group"><label>Item Name</label><input type="text" name="name" value={selectedItemForEdit.name || ''} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-group"><label>Category</label><select name="category_id" value={selectedItemForEdit.category_id || ''} onChange={e => handleFormChange(e, 'item')} required><option value="" disabled>Select...</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div><div className="admin-form-group"><label>Description</label><textarea name="description" value={selectedItemForEdit.description || ''} onChange={e => handleFormChange(e, 'item')} rows={3} /></div><div className="admin-form-group"><label>Image URL</label><input type="text" name="image_url" value={selectedItemForEdit.image_url || ''} onChange={e => handleFormChange(e, 'item')} /></div><div className="admin-form-group"><label>Price (Diamonds)</label><input type="number" name="price" min="0" value={selectedItemForEdit.price ?? 10} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-group"><label>Stock <small>(-1 for infinite)</small></label><input type="number" name="stock" min="-1" value={selectedItemForEdit.stock ?? -1} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-group"><label>Type</label><select name="type" value={selectedItemForEdit.type || 'item'} onChange={e => handleFormChange(e, 'item')} required><option value="item">Item</option><option value="vehicle">Vehicle</option></select></div><div className="admin-form-group"><label>Item Name / Vehicle Spawn Code</label><input type="text" name="item_name" value={selectedItemForEdit.item_name || ''} onChange={e => handleFormChange(e, 'item')} required /></div><div className="admin-form-buttons"><button type="submit" className="form-btn save">Save Changes</button>{selectedItemForEdit.id && <button type="button" className="form-btn delete" onClick={() => setDeleteTarget({ type: 'item', id: selectedItemForEdit.id as number, name: selectedItemForEdit.name || 'Unknown' })}>Delete</button>}</div></form>) : (<AdminPlaceholder title="Manage Items" message="Select an item to edit, or create one." />)}</div></div>);
            case 'logs': return (<div className="admin-view"><div className="admin-view-header"><h2 className="admin-view-title">Activity Logs</h2><div className="log-filter-controls"><button className={`log-filter-btn ${logFilter === 'all' ? 'active' : ''}`} onClick={() => setLogFilter('all')}>All</button><button className={`log-filter-btn ${logFilter === 'player' ? 'active' : ''}`} onClick={() => setLogFilter('player')}>Purchases</button><button className={`log-filter-btn ${logFilter === 'admin' ? 'active' : ''}`} onClick={() => setLogFilter('admin')}>Admin</button><button className={`log-filter-btn ${logFilter === 'test_drive' ? 'active' : ''}`} onClick={() => setLogFilter('test_drive')}>Test Drives</button></div></div><div className='log-list-rework'>{filteredLogs.length > 0 ? (filteredLogs.map(log => (<div key={log.id} className='log-entry'><span className='log-timestamp'>{new Date(log.timestamp).toLocaleString()}</span><span className={`log-type log-type-${log.log_type}`}>{log.log_type.replace(/_/g, ' ')}</span><span className="log-message">{log.message} - <span className="log-player-name">{log.player_name || 'N/A'}</span></span></div>))) : (<div className="log-empty-state"><FaClipboardList size={40} /><h3>No Logs Found</h3><p>There are no logs matching the current filter.</p></div>)}</div></div>);
            case 'players': return ( <div className="admin-view player-management-rework"><div className="player-management-header"><div className="search-container"><FaSearch className="search-icon" /><input type="text" className="search-bar" placeholder={`Search ${managedPlayers.length} players...`} value={playerSearchTerm} onChange={(e) => setPlayerSearchTerm(e.target.value)} /></div><button className="create-new-btn" onClick={refreshPlayers}>Refresh List</button></div><div className="player-management-list-container">{filteredPlayers.length > 0 ? (<table className="player-list-table"><thead><tr><th>Player</th><th>Diamonds</th><th>Actions</th></tr></thead><tbody>{filteredPlayers.map(p => (<tr key={p.identifier}><td><div className="player-list-name">{p.name}</div><div className="player-list-identifier">{p.identifier}</div></td><td><div className="player-list-diamonds"><FaGem size={14} /><span>{p.diamonds.toLocaleString()}</span></div></td><td><button className="manage-player-btn" onClick={() => { setModalFeedback(null); setDiamondAmountInput(''); setManagingPlayer(p); }}>Manage</button></td></tr>))}</tbody></table>) : (<div className="player-list-empty-state"><h3>No Players Found</h3><p>Your search returned no results.</p></div>)}</div></div>);
            default: return null;
        }
    };

    return (
        <div className="admin-page-rework">
            <aside className="admin-sidebar">
                <h2>Admin Panel</h2>
                <button className={`admin-nav-btn ${adminView === 'categories' ? 'active' : ''}`} onClick={() => setAdminView('categories')}><FaTags /> Categories</button>
                <button className={`admin-nav-btn ${adminView === 'items' ? 'active' : ''}`} onClick={() => setAdminView('items')}><FaBoxOpen /> Items</button>
                <button className={`admin-nav-btn ${adminView === 'players' ? 'active' : ''}`} onClick={() => setAdminView('players')}><FaUsersCog /> Players</button>
                <button className={`admin-nav-btn ${adminView === 'logs' ? 'active' : ''}`} onClick={() => setAdminView('logs')}><FaClipboardList /> Logs</button>
            </aside>
            <main className="admin-content-area">
                {renderCurrentView()}
                {managingPlayer && (
                    <div className="player-modal-overlay" onClick={() => setManagingPlayer(null)}>
                        <div className="player-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="player-modal-header"><h3>Manage {managingPlayer.name}</h3><button className="close-modal-btn" onClick={() => setManagingPlayer(null)}>×</button></div>
                            <div className="player-modal-body">
                                <div className="player-info-card"><div className="player-id">Identifier: {managingPlayer.identifier}</div><div className="player-diamond-balance"><FaGem /><span>{managedPlayers.find(p => p.identifier === managingPlayer.identifier)?.diamonds.toLocaleString() ?? '...'}</span></div></div>
                                <div className="player-actions-form"><h4>Modify Diamond Balance</h4><ModalFeedback feedback={modalFeedback} /><div className="actions-input-group"><input type="number" placeholder="Amount..." value={diamondAmountInput} onChange={e => setDiamondAmountInput(e.target.value)} min="1" /><button className="action-btn add" onClick={() => handleModifyDiamonds('add')}>Add</button><button className="action-btn remove" onClick={() => handleModifyDiamonds('remove')}>Remove</button></div></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};