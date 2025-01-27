import { IconType } from "react-icons";
import { SiBitcoinsv } from "react-icons/si"; // Für PIVX (ähnliches Styling)
import { BsCurrencyExchange, BsCurrencyBitcoin } from "react-icons/bs";
import { FaCoins } from "react-icons/fa";

// Erstelle eine Komponente für jedes Icon mit konsistenter Größe und Styling
const createStyledIcon = (Icon: IconType): IconType => {
  const StyledIcon = (props: { size?: number }) => {
    const size = props.size || 24;
    return (
      <Icon
        size={size}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          color: 'currentColor'
        }}
      />
    );
  };
  return StyledIcon as IconType;
};

// Exportiere die Icons mit den besten verfügbaren Varianten
export const PivxIcon = createStyledIcon(SiBitcoinsv);          // Ähnliches Styling wie PIVX
export const CrownIcon = createStyledIcon(BsCurrencyExchange);  // Währungssymbol für Crown
export const FiroIcon = createStyledIcon(BsCurrencyBitcoin);    // Bitcoin-Style für Firo
export const GnoIcon = createStyledIcon(BsCurrencyExchange);    // Währungssymbol für Gnosis
export const DfiIcon = createStyledIcon(FaCoins);              // Coin-Symbol für DeFiChain