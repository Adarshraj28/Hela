import { useState, useEffect } from 'react';

export function useDominantColor(imageUrl: string | undefined): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setColor(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 10; // Small sample size
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);

        // Make the color darker and slightly saturated
        const factor = 0.6;
        r = Math.round(r * factor);
        g = Math.round(g * factor);
        b = Math.round(b * factor);

        setColor(`rgb(${r}, ${g}, ${b})`);
      } catch {
        setColor(null);
      }
    };

    img.onerror = () => setColor(null);
  }, [imageUrl]);

  return color;
}
