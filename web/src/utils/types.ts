// src/types.ts

export interface Player {
    diamonds: number;
    isAdmin: boolean;
}

export interface ShopConfig {
    testDriveEnabled: boolean;
}

export interface Item {
    id: number;
    category_id: number | string;
    name: string;
    description: string;
    image_url: string;
    price: number;
    type: 'item' | 'vehicle';
    item_name: string;
    stock: number;
}

export interface Category {
    id: number;
    name: string;
    logo_url: string;
    display_order: number;
    items: Item[];
}

export interface CartItem extends Item {
    quantity: number;
}

export interface Log {
    id: number;
    citizenid: string;
    player_name: string;
    log_type: 'purchase' | 'admin_add' | 'admin_edit' | 'admin_delete' | 'admin_give_diamonds' | 'admin_take_diamonds' | 'test_drive';
    message: string;
    timestamp: string;
}

export interface ManagedPlayer {
    name: string;
    identifier: string;
    diamonds: number;
}

export interface AdminFeedback {
    type: 'success' | 'error';
    message: string;
    id: number;
}

export type AdminView = 'categories' | 'items' | 'logs' | 'players';

export interface DeleteTarget {
    type: 'category' | 'item';
    id: number;
    name: string;
}