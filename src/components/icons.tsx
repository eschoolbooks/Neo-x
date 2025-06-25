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
        {/* Rays */}
        <g transform="translate(50, 50)" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <line y1="-32" y2="-42" transform="rotate(0)" />
          <line y1="-32" y2="-42" transform="rotate(30)" />
          <line y1="-32" y2="-42" transform="rotate(60)" />
          <line y1="-32" y2="-42" transform="rotate(90)" />
          <line y1="-32" y2="-42" transform="rotate(120)" />
          <line y1="-32" y2="-42" transform="rotate(150)" />
          <line y1="-32" y2="-42" transform="rotate(180)" />
          <line y1="-32" y2="-42" transform="rotate(210)" />
          <line y1="-32" y2="-42" transform="rotate(240)" />
          <line y1="-32" y2="-42" transform="rotate(270)" />
          <line y1="-32" y2="-42" transform="rotate(300)" />
          <line y1="-32" y2="-42" transform="rotate(330)" />
        </g>
        
        {/* Book */}
        <g transform="translate(0, 5)" stroke="currentColor" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          {/* Book outline */}
          <path d="M30,25 h40 v30 c0,15 -20,15 -40,0 V25 Z" />
          {/* Spine */}
          <line x1="50" y1="25" x2="50" y2="58" />
          {/* Face */}
          <circle cx="43" cy="40" r="2" fill="currentColor" stroke="none" />
          <circle cx="57" cy="40" r="2" fill="currentColor" stroke="none" />
          {/* Smile */}
          <path d="M43,48 q7,7 14,0" strokeWidth="4" />
        </g>
    </svg>
  );
}
