import { useState, useEffect } from 'react';

export default function AnimatedNumber({ value, duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value == null || isNaN(value)) {
      setDisplayValue(value);
      return;
    }

    const startTimestamp = performance.now();
    const endValue = Number(value);

    const step = (currentTimestamp) => {
      const progress = Math.min((currentTimestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * endValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  // Format the number appropriately
  if (typeof displayValue !== 'number') return displayValue || '0';
  
  if (displayValue >= 1_000_000_000) return (displayValue / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (displayValue >= 1_000_000) return (displayValue / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (displayValue >= 1_000) return (displayValue / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  
  return displayValue.toLocaleString();
}
