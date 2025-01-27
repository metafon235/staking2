import { IconType } from "react-icons";
import { SVGProps } from 'react';

function createIconComponent(renderSvg: (props: SVGProps<SVGSVGElement>) => JSX.Element): IconType {
  const IconComponent = (props: SVGProps<SVGSVGElement>) => renderSvg(props);
  return IconComponent as IconType;
}

export const PivxIcon: IconType = createIconComponent((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#5E4778"/>
      <path fill="#FFF" fillRule="nonzero" d="M22.5 8v2.977H19v10.146h3.5V24h-10v-2.877H16V10.977h-3.5V8h10zm-6.223 6.088v7.088h-1.523v-5.012c-.176.198-.417.39-.722.574-.306.183-.604.323-.895.42v-1.49c.517-.242.98-.529 1.389-.862.408-.334.702-.678.88-1.034h.87v.316z"/>
    </g>
  </svg>
));

export const CrownIcon: IconType = createIconComponent((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#0F1B30"/>
      <path fill="#FFF" d="M24.844 16.612c-.23-.801-1.019-1.256-1.843-1.036-.506.135-.915.5-1.137.963l-1.866-1.557c.066-.227.101-.464.101-.708 0-1.02-.592-1.95-1.516-2.384.068-.428-.042-.876-.332-1.213-.584-.68-1.613-.76-2.297-.177l-1.13.967a2.444 2.444 0 00-4.648 0l-1.13-.967c-.684-.583-1.713-.503-2.297.177-.29.337-.4.785-.332 1.213-.924.433-1.516 1.363-1.516 2.384 0 .244.035.481.101.708L3.136 16.54c-.222-.463-.63-.828-1.137-.963-.824-.22-1.613.235-1.843 1.036-.23.8.258 1.631 1.082 1.852.146.039.293.05.436.042l1.354 3.876c.203.582.748.975 1.367.975h16.328c.619 0 1.164-.393 1.367-.975l1.354-3.876c.143.008.29-.003.436-.042.824-.22 1.312-1.052 1.082-1.852z"/>
    </g>
  </svg>
));

export const FiroIcon: IconType = createIconComponent((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
    <g fill="none">
      <circle cx="16" cy="16" r="16" fill="#00D4D5"/>
      <path fill="#FFF" d="M18.05 21.378v-4.97h3.132v-.484h-3.132V10.94h-4.06v4.984H10.82v.484h3.17v4.97h4.06zm-3.146-.915v-3.14h2.233v3.14h-2.233z"/>
    </g>
  </svg>
));

export const GnoIcon: IconType = createIconComponent((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#00A6C4"/>
      <path fill="#FFF" fillRule="nonzero" d="M24.777 10.514c-.444.223-.932.223-1.376 0L16 6.514l-7.401 4c-.444.223-.932.223-1.376 0L4 8.514v11l3.223 2c.444.223.932.223 1.376 0L16 17.514l7.401 4c.444.223.932.223 1.376 0l3.223-2v-11l-3.223 2zM7.223 19.486c-.444-.223-.932-.223-1.376 0L4 20.486v2l1.847 1c.444.223.932.223 1.376 0l1.847-1v-2l-1.847-1zm17.554 0c-.444-.223-.932-.223-1.376 0L16 23.486l-7.401-4c-.444-.223-.932-.223-1.376 0L4 20.486v2l3.223 2c.444.223.932.223 1.376 0L16 20.486l7.401 4c.444.223.932.223 1.376 0l3.223-2v-2l-3.223-1z"/>
    </g>
  </svg>
));

export const DfiIcon: IconType = createIconComponent((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
    <g fill="none">
      <circle cx="16" cy="16" r="16" fill="#FF00AF"/>
      <path fill="#FFF" d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S10.615 6.25 16 6.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
      <path fill="#FFF" d="M16 9.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5zm0 10.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
    </g>
  </svg>
));