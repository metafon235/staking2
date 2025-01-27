import { IconType } from "react-icons";
import { SVGProps } from 'react';

// Importiere die Icons direkt aus dem node_modules Verzeichnis
const PIVX_ICON_PATH = "/node_modules/cryptocurrency-icons/svg/color/pivx.svg";
const CRW_ICON_PATH = "/node_modules/cryptocurrency-icons/svg/color/crw.svg";
const FIRO_ICON_PATH = "/node_modules/cryptocurrency-icons/svg/color/firo.svg";
const GNO_ICON_PATH = "/node_modules/cryptocurrency-icons/svg/color/gno.svg";
const DFI_ICON_PATH = "/node_modules/cryptocurrency-icons/svg/color/dfi.svg";

function createIconComponent(iconPath: string): IconType {
  const IconComponent = (props: SVGProps<SVGSVGElement>) => (
    <img 
      src={iconPath} 
      alt="coin icon" 
      width={props.width || "24"} 
      height={props.height || "24"}
      style={{ 
        display: 'inline-block',
        verticalAlign: 'middle',
        ...props.style
      }}
    />
  );
  return IconComponent as IconType;
}

export const PivxIcon = createIconComponent(PIVX_ICON_PATH);
export const CrownIcon = createIconComponent(CRW_ICON_PATH);
export const FiroIcon = createIconComponent(FIRO_ICON_PATH);
export const GnoIcon = createIconComponent(GNO_ICON_PATH);
export const DfiIcon = createIconComponent(DFI_ICON_PATH);