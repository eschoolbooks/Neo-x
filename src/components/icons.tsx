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
        <g transform="translate(50, 50)" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
            <line y1="-40" y2="-48" transform="rotate(0)" />
            <line y1="-40" y2="-48" transform="rotate(45)" />
            <line y1="-40" y2="-48" transform="rotate(90)" />
            <line y1="-40" y2="-48" transform="rotate(135)" />
            <line y1="-40" y2="-48" transform="rotate(180)" />
            <line y1="-40" y2="-48" transform="rotate(225)" />
            <line y1="-40" y2="-48" transform="rotate(270)" />
            <line y1="-40" y2="-48" transform="rotate(315)" />
        </g>
        
        {/* Book */}
        <g transform="translate(0, 0)" stroke="currentColor" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M25,30 Q50,25 75,30 V 70 Q50,75 25,70 V 30 Z" fill="hsl(var(--background))" />
            <path d="M50,27.5 V 72.5" />
            
            {/* Face */}
            <g fill="currentColor" stroke="none">
                <circle cx="41" cy="48" r="2.5" />
                <circle cx="59" cy="48" r="2.5" />
            </g>
            {/* Smile */}
            <path d="M42,57 q8,8 16,0" strokeWidth="4" />
        </g>
    </svg>
  );
}
