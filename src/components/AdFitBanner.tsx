import { useEffect, useRef } from 'react';

interface AdFitBannerProps {
  unit: string;
  width: number;
  height: number;
  className?: string;
}

declare global {
  interface Window {
    adfit?: any;
  }
}

export default function AdFitBanner({ unit, width, height, className }: AdFitBannerProps) {
  const scriptLoaded = useRef(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
      script.async = true;
      
      script.onload = () => {
        scriptLoaded.current = true;
        if (window.adfit) {
          window.adfit.refresh();
        }
      };
      
      document.body.appendChild(script);
    } else if (window.adfit) {
      window.adfit.refresh();
    }

    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [unit]);

  return (
    <div className={className} ref={adRef}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none', width: '100%' }}
        data-ad-unit={unit}
        data-ad-width={width}
        data-ad-height={height}
      />
    </div>
  );
}