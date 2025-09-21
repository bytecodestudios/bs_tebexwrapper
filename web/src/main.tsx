import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';
import { VisibilityProvider } from './providers/VisibilityProvider';
import { isEnvBrowser } from './utils/misc';

// --- MOCK DATA AND BROWSER SETUP ---
if (isEnvBrowser()) {
  console.log('[Shop] Running in browser mode with mock data.');

  const mockResponses: { [key: string]: any } = {
    fetchData: {
      categories: [
        {
          id: 1, name: 'Super Cars', logo_url: '', display_order: 1,
          items: [
            { id: 4, category_id: 1, name: 'Adder', description: 'Unleash raw speed with this hypercar legend.', image_url: 'https://i.imgur.com/XkXQ6I8.jpeg', price: 5200, type: 'vehicle', item_name: 'adder', stock: -1 },
            { id: 5, category_id: 1, name: 'Cheetah', description: 'Precision engineering for the ultimate road dominance.', image_url: 'https://i.imgur.com/N4FfQCU.jpeg', price: 5100, type: 'vehicle', item_name: 'cheetah', stock: -1 },
            { id: 6, category_id: 1, name: 'T20', description: 'Modern hypercar designed for maximum thrill.', image_url: 'https://i.imgur.com/1nT5N2a.jpeg', price: 5300, type: 'vehicle', item_name: 't20', stock: -1 },
            { id: 7, category_id: 1, name: 'Osiris', description: 'Exotic beauty fused with monstrous performance.', image_url: 'https://i.imgur.com/fx2Q9fK.jpeg', price: 5400, type: 'vehicle', item_name: 'osiris', stock: -1 },
            { id: 8, category_id: 1, name: 'Reaper', description: 'Aggressive styling with insane top speed.', image_url: 'https://i.imgur.com/vjCPp5M.jpeg', price: 4950, type: 'vehicle', item_name: 'reaper', stock: -1 },
            { id: 9, category_id: 1, name: 'Turismo R', description: 'Track-ready supercar built for perfection.', image_url: 'https://i.imgur.com/5zHHw8p.jpeg', price: 5050, type: 'vehicle', item_name: 'turismor', stock: -1 },
            { id: 10, category_id: 1, name: 'FMJ', description: 'Aerodynamic monster with flawless design.', image_url: 'https://i.imgur.com/Mx6JfZe.jpeg', price: 5200, type: 'vehicle', item_name: 'fmj', stock: -1 },
            { id: 11, category_id: 1, name: 'Vacca', description: 'Classic Italian supercar styling at its finest.', image_url: 'https://i.imgur.com/Y9wEN9o.jpeg', price: 4800, type: 'vehicle', item_name: 'vacca', stock: -1 },
            { id: 12, category_id: 1, name: 'Zentorno', description: 'A raging bull with futuristic sharp looks.', image_url: 'https://i.imgur.com/h2dQh6u.jpeg', price: 5500, type: 'vehicle', item_name: 'zentorno', stock: -1 },
            { id: 13, category_id: 1, name: 'Tempesta', description: 'Sleek lines with track-bred technology.', image_url: 'https://i.imgur.com/8GkLpUu.jpeg', price: 5150, type: 'vehicle', item_name: 'tempesta', stock: -1 },
            { id: 14, category_id: 1, name: 'Itali GTB', description: 'High-speed elegance crafted in Italy.', image_url: 'https://i.imgur.com/Kp9NeR0.jpeg', price: 5250, type: 'vehicle', item_name: 'italigtb', stock: -1 },
            { id: 15, category_id: 1, name: 'Cyclone', description: 'Electric hypercar with instant acceleration.', image_url: 'https://i.imgur.com/qZkUgVb.jpeg', price: 5600, type: 'vehicle', item_name: 'cyclone', stock: -1 },
            { id: 16, category_id: 1, name: 'Tezeract', description: 'Futuristic beast pushing limits of design.', image_url: 'https://i.imgur.com/vsyQk7T.jpeg', price: 5700, type: 'vehicle', item_name: 'tezeract', stock: -1 },
            { id: 17, category_id: 1, name: 'Kriger', description: 'German engineering, pure dominance.', image_url: 'https://i.imgur.com/mJG1H1n.jpeg', price: 5850, type: 'vehicle', item_name: 'krieger', stock: -1 },
            { id: 18, category_id: 1, name: 'Emerus', description: 'Lightweight, aerodynamic track monster.', image_url: 'https://i.imgur.com/mn3Mwuz.jpeg', price: 5900, type: 'vehicle', item_name: 'emerus', stock: -1 },
            { id: 19, category_id: 1, name: 'Deveste Eight', description: 'Unique hypercar with aggressive design.', image_url: 'https://i.imgur.com/2gA9tBq.jpeg', price: 6000, type: 'vehicle', item_name: 'deveste', stock: -1 },
            { id: 20, category_id: 1, name: 'Itali RSX', description: 'Stylish Italian monster with sharp lines.', image_url: 'https://i.imgur.com/T4P7s7N.jpeg', price: 6100, type: 'vehicle', item_name: 'italirsx', stock: -1 },
            { id: 21, category_id: 1, name: 'SC1', description: 'Concept hypercar for future enthusiasts.', image_url: 'https://i.imgur.com/HKzE8UO.jpeg', price: 5700, type: 'vehicle', item_name: 'sc1', stock: -1 },
            { id: 22, category_id: 1, name: 'Neo', description: 'Sporty design with cutting-edge speed.', image_url: 'https://i.imgur.com/bmIfYOB.jpeg', price: 5650, type: 'vehicle', item_name: 'neo', stock: -1 },
            { id: 23, category_id: 1, name: 'Pariah', description: 'Street-legal speed demon unrivaled in races.', image_url: 'https://i.imgur.com/h9hV42Y.jpeg', price: 5800, type: 'vehicle', item_name: 'pariah', stock: -1 },
            { id: 24, category_id: 1, name: 'Banshee 900R', description: 'Upgraded classic with modern flair.', image_url: 'https://i.imgur.com/hQvbm1P.jpeg', price: 4900, type: 'vehicle', item_name: 'banshee2', stock: -1 },
            { id: 25, category_id: 1, name: '811', description: 'One of the fastest top-speed cars in existence.', image_url: 'https://i.imgur.com/ejRgM2F.jpeg', price: 6100, type: 'vehicle', item_name: 'pfister811', stock: -1 },
            { id: 26, category_id: 1, name: 'Vagner', description: 'Race-inspired hypercar for elite drivers.', image_url: 'https://i.imgur.com/NhEMhpi.jpeg', price: 6200, type: 'vehicle', item_name: 'vagner', stock: -1 },
            { id: 27, category_id: 1, name: 'XA-21', description: 'Exotic curves with track-ready handling.', image_url: 'https://i.imgur.com/FaL1GDs.jpeg', price: 6150, type: 'vehicle', item_name: 'xa21', stock: -1 },
            { id: 28, category_id: 1, name: 'Tyrant', description: 'Big, bold, and brutally fast.', image_url: 'https://i.imgur.com/Eqrfbpj.jpeg', price: 6250, type: 'vehicle', item_name: 'tyrant', stock: -1 },
            { id: 29, category_id: 1, name: 'Entity XXR', description: 'An upgrade to the Entity line with fierce performance.', image_url: 'https://i.imgur.com/huqT6D5.jpeg', price: 6300, type: 'vehicle', item_name: 'entity2', stock: -1 },
            { id: 30, category_id: 1, name: 'Sultan RS', description: 'Legendary street racer’s dream machine.', image_url: 'https://i.imgur.com/0xFjBY7.jpeg', price: 5000, type: 'vehicle', item_name: 'sultanrs', stock: -1 },
            { id: 31, category_id: 1, name: 'Penetrator', description: 'Exotic design with blistering performance.', image_url: 'https://i.imgur.com/NiUspB7.jpeg', price: 5350, type: 'vehicle', item_name: 'penetrator', stock: -1 },
            { id: 32, category_id: 1, name: 'Infernus', description: 'Classic GTA icon, fast and stylish.', image_url: 'https://i.imgur.com/PLfNvna.jpeg', price: 4950, type: 'vehicle', item_name: 'infernus', stock: -1 },
            { id: 33, category_id: 1, name: 'Bullet', description: 'American muscle-inspired supercar.', image_url: 'https://i.imgur.com/5dAbAHy.jpeg', price: 4700, type: 'vehicle', item_name: 'bullet', stock: -1 },
          ],
        },
        {
          id: 2, name: 'Exclusive Weapons', logo_url: '', display_order: 2,
          items: [
            { id : 4, category_id : 2, name : 'Pistol', description : 'A standard sidearm for self-defense.', image_url : '', price : 250, type : 'item', item_name : 'WEAPON_PISTOL', stock : 25 },
            { id : 5, category_id : 2, name : 'Pistol Mk2', description : 'An upgraded version of the classic pistol.', image_url : '', price : 400, type : 'item', item_name : 'WEAPON_PISTOL_MK2', stock : 15 },
            { id : 6, category_id : 2, name : 'Combat Pistol', description : 'Compact and powerful sidearm.', image_url : '', price : 500, type : 'item', item_name : 'WEAPON_COMBATPISTOL', stock : 12 },
            { id : 7, category_id : 2, name : 'Combat MG Mk2', description : 'Superior firepower for any situation.', image_url : '', price : 750, type : 'item', item_name : 'WEAPON_COMBATMG_MK2', stock : 10 },
            { id : 8, category_id : 2, name : 'Assault Rifle', description : 'Reliable automatic rifle.', image_url : '', price : 900, type : 'item', item_name : 'WEAPON_ASSAULTRIFLE', stock : 8 },
            { id : 9, category_id : 2, name : 'Carbine Rifle Mk2', description : 'Enhanced accuracy and control.', image_url : '', price : 1200, type : 'item', item_name : 'WEAPON_CARBINERIFLE_MK2', stock : 7 },
            { id : 10, category_id : 2, name : 'Pump Shotgun', description : 'High stopping power at close range.', image_url : '', price : 600, type : 'item', item_name : 'WEAPON_PUMPSHOTGUN', stock : 10 },
            { id : 11, category_id : 2, name : 'Heavy Shotgun', description : 'Devastating short-range spread.', image_url : '', price : 850, type : 'item', item_name : 'WEAPON_HEAVYSHOTGUN', stock : 6 },
            { id : 12, category_id : 2, name : 'Sniper Rifle', description : 'Long-range precision rifle.', image_url : '', price : 1500, type : 'item', item_name : 'WEAPON_SNIPERRIFLE', stock : 5 },
            { id : 13, category_id : 2, name : 'Heavy Sniper Mk2', description : 'Extremely powerful Mk2 sniper.', image_url : '', price : 2500, type : 'item', item_name : 'WEAPON_HEAVYSNIPER_MK2', stock : 3 },
            { id : 14, category_id : 2, name : 'Molotov', description : 'Improvised incendiary device.', image_url : '', price : 100, type : 'item', item_name : 'WEAPON_MOLOTOV', stock : 20 },
            { id : 15, category_id : 2, name : 'Sticky Bomb', description : 'Remote-detonated explosive.', image_url : '', price : 1200, type : 'item', item_name : 'WEAPON_STICKYBOMB', stock : 10 },
            { id : 16, category_id : 2, name : 'Armor Vest', description : 'Provides extra protection against bullets.', image_url : '', price : 500, type : 'item', item_name : 'item_armor_vest', stock : 18 },
            { id : 17, category_id : 2, name : 'Heavy Armor', description : 'Maximum ballistic protection.', image_url : '', price : 1200, type : 'item', item_name : 'item_armor_heavy', stock : 6 },
            { id : 18, category_id : 2, name : 'Medkit', description : 'Restores health instantly.', image_url : '', price : 150, type : 'item', item_name : 'item_medkit', stock : 30 },
            { id : 19, category_id : 2, name : 'Bandage', description : 'Stops bleeding and heals a small amount.', image_url : '', price : 30, type : 'item', item_name : 'item_bandage', stock : 50 },
            { id : 20, category_id : 2, name : 'Ammo Pistol (50)', description : 'Box of 50 pistol rounds.', image_url : '', price : 60, type : 'item', item_name : 'ammo_pistol', stock : 100 },
            { id : 21, category_id : 2, name : 'Ammo Rifle (30)', description : 'Box of 30 rifle rounds.', image_url : '', price : 120, type : 'item', item_name : 'ammo_rifle', stock : 80 },
            { id : 22, category_id : 2, name : 'Ammo Shotgun (12)', description : '12 shotgun shells per box.', image_url : '', price : 80, type : 'item', item_name : 'ammo_shotgun', stock : 60 },
            { id : 23, category_id : 2, name : 'Suppressor (Pistol)', description : 'Reduces muzzle flash and sound for pistols.', image_url : '', price : 400, type : 'item', item_name : 'attachment_suppressor_pistol', stock : 9 },
            { id : 24, category_id : 2, name : 'Scope (Rifle 4x)', description : '4x magnification scope for rifles.', image_url : '', price : 650, type : 'item', item_name : 'attachment_scope_4x', stock : 7 },
            { id : 25, category_id : 2, name : 'Extended Magazine (SMG)', description : 'Increases magazine capacity.', image_url : '', price : 220, type : 'item', item_name : 'attachment_extmag_smg', stock : 14 },
            { id : 26, category_id : 2, name : 'Flashbang', description : 'Blinds and disorients enemies temporarily.', image_url : '', price : 180, type : 'item', item_name : 'weapon_flashbang', stock : 25 },
            { id : 27, category_id : 2, name : 'Tear Gas', description : 'Area denial gas that causes coughing and vision loss.', image_url : '', price : 140, type : 'item', item_name : 'weapon_teargas', stock : 20 },
            { id : 28, category_id : 2, name : 'Toolkit', description : 'Used to repair vehicles and equipment.', image_url : '', price : 300, type : 'item', item_name : 'item_toolkit', stock : 12 },
            { id : 29, category_id : 2, name : 'Lockpick Set', description : 'Used for unlocking doors and vehicles.', image_url : '', price : 350, type : 'item', item_name : 'item_lockpick', stock : 22 },
            { id : 30, category_id : 2, name : 'Night Vision Goggles', description : 'Enhances vision in low light.', image_url : '', price : 950, type : 'item', item_name : 'item_nvg', stock : 5 },
            { id : 31, category_id : 2, name : 'Thermal Scanner', description : 'Detects heat signatures through obstacles.', image_url : '', price : 1600, type : 'item', item_name : 'item_thermal_scanner', stock : 3 },
            { id : 32, category_id : 2, name : 'Kevlar Helmet', description : 'Head protection to reduce damage.', image_url : '', price : 320, type : 'item', item_name : 'item_helmet_kevlar', stock : 11 },
            { id : 33, category_id : 2, name : 'Tactical Gloves', description : 'Improves weapon handling and grip.', image_url : '', price : 90, type : 'item', item_name : 'item_tactical_gloves', stock : 40 },
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