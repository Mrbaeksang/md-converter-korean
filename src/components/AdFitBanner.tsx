import { useEffect, useRef } from 'react';

interface AdFitBannerProps {
  unit: string;
  width: number;
  height: number;
  className?: string;
}


export default function AdFitBanner({ unit, width, height, className }: AdFitBannerProps) {
  const scriptLoaded = useRef(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adElement = adRef.current;
    
    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
      script.async = true;
      
      script.onload = () => {
        scriptLoaded.current = true;
        // AdFit doesn't need manual refresh on initial load
      };
      
      document.body.appendChild(script);
    }

    return () => {
      if (adElement) {
        adElement.innerHTML = '';
      }
    };
  }, [unit]);

  return (
    <div className={className} ref={adRef} style={{ textAlign: 'center' }}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unit}
        data-ad-width={width}
        data-ad-height={height}
      />
    </div>
  );
}