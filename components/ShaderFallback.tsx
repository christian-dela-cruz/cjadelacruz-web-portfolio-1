"use client";

import React, { useId } from "react";

interface ShaderFallbackProps {
  color?: string;
  speed?: number;
}

export function ShaderFallback({ color = "#FF7F50", speed = 0.15 }: ShaderFallbackProps) {
  const uniqueId = useId();
  // Clean up ID suffix to remove colons so it is a valid HTML/CSS selector prefix
  const idSuffix = uniqueId.replace(/:/g, "");
  const patternId = `dither-pattern-${idSuffix}`;
  const maskId = `dither-mask-${idSuffix}`;

  // Speed up keyframe animations dynamically to match mouse hover states
  const animDuration1 = speed > 0.3 ? "8s" : "25s";
  const animDuration2 = speed > 0.3 ? "10s" : "32s";
  const animDuration3 = speed > 0.3 ? "6s" : "20s";

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full select-none pointer-events-none z-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fallback-wave-1-${idSuffix} {
          0% { transform: translate3d(0, 0, 0) scaleY(1); }
          50% { transform: translate3d(-5%, 15px, 0) scaleY(1.08); }
          100% { transform: translate3d(0, 0, 0) scaleY(1); }
        }
        @keyframes fallback-wave-2-${idSuffix} {
          0% { transform: translate3d(0, 0, 0) scaleY(1.05); }
          50% { transform: translate3d(6%, -20px, 0) scaleY(0.95); }
          100% { transform: translate3d(0, 0, 0) scaleY(1.05); }
        }
        @keyframes fallback-wave-3-${idSuffix} {
          0% { transform: translate3d(0, 0, 0) scaleY(0.95); }
          50% { transform: translate3d(-3%, 25px, 0) scaleY(1.03); }
          100% { transform: translate3d(0, 0, 0) scaleY(0.95); }
        }
        .animate-fallback-1-${idSuffix} {
          animation: fallback-wave-1-${idSuffix} ${animDuration1} infinite ease-in-out;
          transform-origin: center bottom;
        }
        .animate-fallback-2-${idSuffix} {
          animation: fallback-wave-2-${idSuffix} ${animDuration2} infinite ease-in-out;
          transform-origin: center bottom;
        }
        .animate-fallback-3-${idSuffix} {
          animation: fallback-wave-3-${idSuffix} ${animDuration3} infinite ease-in-out;
          transform-origin: center bottom;
        }
      ` }} />
      <svg
        className="absolute inset-0 w-[120%] h-full left-[-10%]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 800"
      >
        <defs>
          <pattern
            id={patternId}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="black" />
            <circle cx="2" cy="2" r="1.5" fill="white" />
            <circle cx="6" cy="6" r="1.5" fill="white" />
          </pattern>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </mask>
        </defs>

        {/* Wave 1 */}
        <path
          className={`animate-fallback-1-${idSuffix} opacity-80`}
          fill={color}
          mask={`url(#${maskId})`}
          d="M-200,300 C300,150 700,450 1100,300 C1300,225 1500,375 1700,300 L1700,1000 L-200,1000 Z"
        />

        {/* Wave 2 */}
        <path
          className={`animate-fallback-2-${idSuffix} opacity-55`}
          fill={color}
          mask={`url(#${maskId})`}
          d="M-200,450 C250,550 750,350 1150,480 C1300,530 1500,430 1700,450 L1700,1000 L-200,1000 Z"
        />

        {/* Wave 3 */}
        <path
          className={`animate-fallback-3-${idSuffix} opacity-35`}
          fill={color}
          mask={`url(#${maskId})`}
          d="M-200,200 C350,100 650,300 950,220 C1250,140 1450,270 1700,220 L1700,1000 L-200,1000 Z"
        />
      </svg>
    </div>
  );
}
