import { useState, useEffect } from 'react';
import MetallicPaint, { parseLogoImage } from './MetallicPaint';
import logo from '@/assets/logos/ebuster-logo.svg';

export const MetallicLogo = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDefaultImage() {
      try {
        setIsLoading(true);
        const response = await fetch(logo);
        const blob = await response.blob();
        const file = new File([blob], "ebuster-logo.svg", { type: blob.type });

        const parsedData = await parseLogoImage(file);
        setImageData(parsedData?.imageData ?? null);
      } catch (err) {
        console.error("Error loading logo image:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDefaultImage();
  }, []);

  if (isLoading || !imageData) {
    return (
      <div className="h-12 w-32 flex items-center justify-center">
        <div className="h-8 w-24 bg-muted/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-12 w-32 relative overflow-hidden">
      <MetallicPaint 
        imageData={imageData} 
        params={{ 
          edge: 2, 
          patternBlur: 0.005, 
          patternScale: 2, 
          refraction: 0.015, 
          speed: 0.3, 
          liquid: 0.07 
        }} 
      />
    </div>
  );
};
