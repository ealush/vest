import React, { useEffect } from 'react';

import { classifyAdoptionClick, trackAdoptionEvent } from '../utils/analytics';

export default function Root({ children }) {
  useEffect(() => {
    function handleClick(event) {
      if (!(event.target instanceof Element)) return;

      const adoptionEvent = classifyAdoptionClick(event.target);
      if (adoptionEvent) {
        trackAdoptionEvent(adoptionEvent.action, adoptionEvent.label);
      }
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return children;
}
