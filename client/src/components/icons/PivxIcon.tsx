import { SVGProps } from 'react';

export function PivxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      {...props}
    >
      {/* Background Circle */}
      <circle cx="128" cy="128" r="128" fill="currentColor" opacity="0.1" />

      {/* PIVX Text and X symbol */}
      <g fill="currentColor">
        {/* P */}
        <path d="M60 72h35c8 0 14 2 18 6s6 10 6 18c0 8-2 14-6 18s-10 6-18 6H78v36H60V72zm35 32c3 0 5-1 6-2s2-3 2-6-1-5-2-6-3-2-6-2H78v16h17z"/>
        {/* I */}
        <path d="M128 72h18v84h-18z"/>
        {/* V */}
        <path d="M157 72h19l15 84h-18l-7-46-7 46h-17z"/>
        {/* X */}
        <path d="M198 72h20l-14 42 14 42h-20l-7-25-7 25h-19l14-42-14-42h19l7 25z"/>
      </g>
    </svg>
  );
}