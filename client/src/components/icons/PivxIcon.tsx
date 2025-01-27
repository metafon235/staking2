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
      {/* Circle background */}
      <circle cx="128" cy="128" r="128" fill="currentColor" opacity="0.1" />
      <circle cx="128" cy="128" r="120" fill="currentColor" opacity="0.2" />

      {/* PIVX Logo */}
      <path
        fill="currentColor"
        d="M192 84.267v87.466c0 6.4-3.2 11.734-9.6 11.734h-25.6c-6.4 0-9.6-4-9.6-9.6v-34.133h-1.067l-34.133 37.333c-3.2 3.2-7.467 6.4-12.8 6.4H67.2c-6.4 0-9.6-4-9.6-10.667V84.267C57.6 78.933 60.8 74.667 67.2 74.667h25.6c6.4 0 9.6 4 9.6 9.6v34.133h1.067l34.133-37.333c3.2-3.2 7.467-6.4 12.8-6.4h32c6.4 0 9.6 4 9.6 10.667z"
      />
    </svg>
  );
}