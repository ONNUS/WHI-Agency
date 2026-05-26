import React from "react";

interface WHILogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function WHILogo({ className = "h-8 md:h-10", iconOnly = false }: WHILogoProps) {
  return (
    <div className={`flex items-center select-none ${className}`} id="whi-official-logo">
      {/* SVG Container holding the absolute exact replica of the WHI logo from the user's JPEG */}
      <svg 
        viewBox={iconOnly ? "640 30 280 300" : "0 30 940 300"} 
        className="h-full w-auto" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Precise, geometric ultra-bold logotype "W H" */}
        {!iconOnly && (
          <g id="whi-wordmark">
            {/* Extremely bold, clean W */}
            <path 
              d="M 20,42 H 94 L 136,185 L 179,42 H 254 L 296,185 L 338,42 H 413 L 335,322 H 260 L 226,195 L 192,322 H 117 Z" 
              fill="#ffffff" 
            />
            {/* Extremely bold, clean H */}
            <path 
              d="M 435,42 H 510 V 160 H 570 V 42 H 645 V 322 H 570 V 215 H 510 V 322 H 435 Z" 
              fill="#ffffff" 
            />
          </g>
        )}

        {/* Brand Symbol Component -> High-fidelity replica of the yellow S-curve and white box with dot */}
        <g id="whi-symbol">
          {/* White rounded square with transparent cutout circle dot inside */}
          <path 
            d="M 685,42 h 90 a 20,20 0 0 1 20,20 v 45 a 20,20 0 0 1 -20,20 h -90 a 20,20 0 0 1 -20,-20 v -45 a 20,20 0 0 1 20,-20 Z M 730,104 a 18,18 0 1 0 0,-36 a 18,18 0 0 0 0,36 Z" 
            fill="#ffffff" 
            fillRule="evenodd" 
          />

          {/* Premium custom path representing the official yellow curve */}
          <path 
            d="M 667,322 H 820 A 90,90 0 0,0 820,142 H 687 C 670,142 667,157 667,177 C 667,197 682,232 717,232 H 810 A 10,10 0 0,1 810,252 H 667 Z" 
            fill="#ffd300" 
          />
        </g>
      </svg>
    </div>
  );
}
