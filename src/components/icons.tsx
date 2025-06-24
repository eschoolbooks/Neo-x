import type { SVGProps } from 'react';

export function ESchoolBookLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      {...props}
    >
      <path
        d="M85,90 C85,90 80,80 50,80 C20,80 15,90 15,90"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M20,15 L20,85 C20,85 25,75 50,75 C75,75 80,85 80,85 L80,15 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M50,15 L50,80" stroke="currentColor" strokeWidth="5" />
      <path d="M15,20 L5,30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M10,10 L0,20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M85,20 L95,30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M90,10 L100,20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
