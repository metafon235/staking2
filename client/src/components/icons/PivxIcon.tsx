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
      {/* Main circle */}
      <circle cx="128" cy="128" r="128" fill="currentColor" opacity="0.1" />
      <circle cx="128" cy="128" r="124" fill="currentColor" opacity="0.2" />

      {/* PIVX Logo - Stylized "X" */}
      <path
        fill="currentColor"
        d="M175 75v106c0 8-4 14-12 14h-31c-8 0-12-5-12-12v-41h-1l-41 45c-4 4-9 8-15 8H31c-8 0-12-5-12-13V75c0-7 4-12 12-12h31c8 0 12 5 12 12v41h1l41-45c4-4 9-8 15-8h32c8 0 12 5 12 13z"
      />
    </svg>
  );
}