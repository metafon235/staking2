import { SVGProps } from 'react';

export function PivxIcon(props: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <img 
      src="/assets/pivx-icon.png"
      alt="PIVX"
      style={{ width: '1em', height: '1em' }}
      className={props.className}
    />
  );
}