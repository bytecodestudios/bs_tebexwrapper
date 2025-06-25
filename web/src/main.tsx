import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App.tsx';
import './index.css';
import { VisibilityProvider } from './providers/VisibilityProvider.tsx';
import { isEnvBrowser } from './utils/misc.ts';

// --- MOCK DATA AND BROWSER SETUP ---
if (isEnvBrowser()) {
  console.log('[Shop] Running in browser mode with mock data.');

  const mockResponses: { [key: string]: any } = {
    fetchData: {
      categories: [
        {
          id: 1, name: 'Super Cars', logo_url: '', display_order: 1,
          items: [
            { id: 1, category_id: 1, name: 'Banshee 900R', description: 'A classic sports car, upgraded for maximum performance.', image_url: 'https://i.imgur.com/FmS85x8.jpeg', price: 2500, type: 'vehicle', item_name: 'banshee2', stock: 5 },
            { id: 2, category_id: 1, name: 'Entity XF', description: 'Experience hypercar speeds with this exotic masterpiece.', image_url: 'https://i.imgur.com/eBw2s23.jpeg', price: 5000, type: 'vehicle', item_name: 'entityxf', stock: -1 },
          ],
        },
        {
          id: 2, name: 'Exclusive Weapons', logo_url: '', display_order: 2,
          items: [
            { id: 4, category_id: 2, name: 'Combat MG Mk2', description: 'Superior firepower for any situation.', image_url: '', price: 750, type: 'item', item_name: 'WEAPON_COMBATMG_MK2', stock: 10 },
            { id: 5, category_id: 2, name: 'Combat MG Mk2', description: 'Superior firepower for any situation.', image_url: '', price: 750, type: 'item', item_name: 'WEAPON_COMBATMG_MK2', stock: 10 },
            { id: 6, category_id: 2, name: 'Combat MG Mk2', description: 'Superior firepower for any situation.', image_url: '', price: 750, type: 'item', item_name: 'WEAPON_COMBATMG_MK2', stock: 10 },
            { id: 7, category_id: 2, name: 'Combat MG Mk2', description: 'Superior firepower for any situation.', image_url: '', price: 750, type: 'item', item_name: 'WEAPON_COMBATMG_MK2', stock: 10 },
            { id: 8, category_id: 2, name: 'Combat MG Mk2', description: 'Superior firepower for any situation.', image_url: '', price: 750, type: 'item', item_name: 'WEAPON_COMBATMG_MK2', stock: 10 },
            { id: 9, category_id: 2, name: 'Combat MG Mk2', description: 'Superior firepower for any situation.', image_url: '', price: 750, type: 'item', item_name: 'WEAPON_COMBATMG_MK2', stock: 10 },
            { id: 9, category_id: 2, name: 'Combat MG Mk2', description: 'Superior firepower for any situation.', image_url: '', price: 750, type: 'item', item_name: 'WEAPON_COMBATMG_MK2', stock: 10 },

          ],
        },
      ],
      player: { diamonds: 15000, isAdmin: true },
      config: { testDriveEnabled: true },
      logs: [
        { id: 1, citizenid: 'steam:1', player_name: 'John Doe', log_type: 'purchase' as const, message: 'Purchased 1x Entity XF for 5,000 Diamonds.', timestamp: new Date(Date.now() - 3600000).toISOString() },
      ],
    },
    getAllPlayers: [
      { name: 'John Doe', identifier: 'steam:1', diamonds: 5400 },
      { name: 'Jane Smith', identifier: 'steam:4', diamonds: 120300 },
    ],
    // [[ NEW ]] Mocks for the redeem page
    redeemCode: { success: true, message: 'Mock Code Redeemed Successfully!' },
    openStoreUrl: { success: true },
  };

  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (typeof input === 'string') {
      const url = new URL(input);
      const eventName = url.pathname.substring(1) as keyof typeof mockResponses;

      if (mockResponses[eventName]) {
        console.log(`[NUI Mock Intercept] > ${eventName}`, init?.body ? JSON.parse(init.body.toString()) : {});
        return new Response(JSON.stringify(mockResponses[eventName]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (eventName === 'close') {
         console.log(`[NUI Mock Intercept] > ${eventName}`);
         return new Response(JSON.stringify({}), { status: 200 });
      }
    }
    
    return originalFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VisibilityProvider>
      <App />
    </VisibilityProvider>
  </React.StrictMode>,
);