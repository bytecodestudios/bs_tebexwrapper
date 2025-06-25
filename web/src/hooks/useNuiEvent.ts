import { useEffect, useRef } from 'react';

export const useNuiEvent = <T>(action: string, handler: (data: T) => void) => {
  const savedHandler = useRef(handler);
  useEffect(() => { savedHandler.current = handler; }, [handler]);

  useEffect(() => {
    const eventListener = (event: MessageEvent) => {
      if (savedHandler.current && event.data.action === action) {
        savedHandler.current(event.data.data);
      }
    };
    window.addEventListener('message', eventListener);
    return () => window.removeEventListener('message', eventListener);
  }, [action]);
};