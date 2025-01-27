import { FC } from 'react';
import { PivxIcon } from "./PivxIcon";

interface CoinIconProps {
  symbol: string;
  className?: string;
}

export const CoinIcon: FC<CoinIconProps> = ({ symbol, className }) => {
  const normalizedSymbol = symbol.toLowerCase();
  
  try {
    // Try to dynamically import the cryptocurrency icon
    const iconPath = `/node_modules/cryptocurrency-icons/svg/color/${normalizedSymbol}.svg`;
    return (
      <img 
        src={iconPath} 
        alt={`${symbol} icon`}
        className={className}
        onError={(e) => {
          // If loading fails, replace with PIVX icon
          e.currentTarget.style.display = 'none';
          const fallbackElement = e.currentTarget.parentElement?.querySelector('.fallback-icon');
          if (fallbackElement) {
            fallbackElement.style.display = 'block';
          }
        }}
      />
    );
  } catch {
    // If import fails, use PIVX icon as fallback
    return <PivxIcon className={className} />;
  }
};
