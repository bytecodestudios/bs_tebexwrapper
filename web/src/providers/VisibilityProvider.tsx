// src/providers/VisibilityProvider.tsx

import React, { createContext, useContext, useState } from 'react';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { fetchNui } from '../utils/fetchNui';
import { isEnvBrowser } from '../utils/misc';

const VisibilityCtx = createContext<any>(null);

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // When in a browser, we want to see the UI by default.
  // In the game, it should start hidden.
  const [visible, setVisible] = useState<boolean>(isEnvBrowser());

  useNuiEvent<boolean>('setVisible', setVisible);

  React.useEffect(() => {
    // We don't want to needlessly listen for escape in the browser
    if (!visible || isEnvBrowser()) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false); // Hide the UI
        fetchNui('close'); // Tell the client script to release focus
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  return (
    <VisibilityCtx.Provider value={{ visible, setVisible }}>
       {/* In browser, we can just use a boolean to render/not render.
           In game, we must use visibility to keep the app mounted and listening for events. */}
       <div style={!isEnvBrowser() ? { visibility: visible ? 'visible' : 'hidden', height: '100%' } : {}}>
        {visible && children}
      </div>
    </VisibilityCtx.Provider>
  );
};

export const useVisibility = () => useContext<any>(VisibilityCtx);