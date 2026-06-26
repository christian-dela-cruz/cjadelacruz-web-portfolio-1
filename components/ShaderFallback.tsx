"use client";

import React, { useEffect, useRef } from "react";

interface ShaderFallbackProps {
  color?: string;
  speed?: number;
}

export function ShaderFallback({ color = "#FF7F50", speed = 0.15 }: ShaderFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    // Create a 4x4 checkerboard pattern canvas for a standard dithering look (50% density)
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 4;
    patternCanvas.height = 4;
    const pctx = patternCanvas.getContext("2d");
    if (pctx) {
      pctx.fillStyle = "white";
      pctx.fillRect(0, 0, 2, 2);
      pctx.fillRect(2, 2, 2, 2);
    }
    const pattern = ctx.createPattern(patternCanvas, "repeat");

    // Reusable offscreen canvas for rendering waves prior to masking (prevents GC thrashing)
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      
      canvas.width = width;
      canvas.height = height;
      
      tempCanvas.width = width;
      tempCanvas.height = height;
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const time = performance.now();

      // Clear main canvas
      ctx.clearRect(0, 0, width, height);

      if (tempCtx) {
        // Reset temp canvas state
        tempCtx.clearRect(0, 0, width, height);
        tempCtx.globalCompositeOperation = "source-over";

        // Draw multiple layered waves with different heights, waves, and opacities
        const drawWave = (tCtx: CanvasRenderingContext2D, waveIdx: number, opacity: number) => {
          tCtx.fillStyle = color;
          tCtx.globalAlpha = opacity;
          tCtx.beginPath();
          tCtx.moveTo(0, height);

          // Math representing the warp flow
          const baseHeight = height * (0.35 + waveIdx * 0.15);
          const amplitude = 30 + waveIdx * 15;
          const frequency = 0.003 - waveIdx * 0.0005;

          for (let x = 0; x <= width; x += 10) {
            const y = baseHeight 
              + amplitude * Math.sin(x * frequency + time * speed * 0.001) 
              + (amplitude * 0.4) * Math.cos(x * frequency * 2.5 - time * speed * 0.0012);
            tCtx.lineTo(x, y);
          }

          tCtx.lineTo(width, height);
          tCtx.closePath();
          tCtx.fill();
        };

        // Render 3 wave paths
        drawWave(tempCtx, 0, 0.50);
        drawWave(tempCtx, 1, 0.35);
        drawWave(tempCtx, 2, 0.20);

        // Apply checkerboard pattern mask using destination-in compositing
        if (pattern) {
          tempCtx.globalAlpha = 1.0;
          tempCtx.globalCompositeOperation = "destination-in";
          tempCtx.fillStyle = pattern;
          tempCtx.fillRect(0, 0, width, height);
        }

        // Draw the finished dithered waves onto the main visible canvas
        ctx.drawImage(tempCanvas, 0, 0);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
