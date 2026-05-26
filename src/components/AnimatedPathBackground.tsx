import React, { useEffect, useRef } from "react";

export default function AnimatedPathBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Golden waves (Aurora-style) to replicate structural pathways
    interface GoldWave {
      phase: number;
      speed: number;
      amplitude: number;
      yScale: number;
      colorStart: string;
      colorEnd: string;
    }

    const waves: GoldWave[] = [
      {
        phase: 0,
        speed: 0.002,
        amplitude: 50,
        yScale: 0.85,
        colorStart: "rgba(188, 153, 60, 0.18)", // WHI Premium Gold #bc993c
        colorEnd: "rgba(188, 153, 60, 0)",
      },
      {
        phase: Math.PI / 3,
        speed: 0.003,
        amplitude: 35,
        yScale: 0.9,
        colorStart: "rgba(226, 179, 74, 0.12)", // Lighter Champagne gold
        colorEnd: "rgba(226, 179, 74, 0)",
      },
      {
        phase: Math.PI * 1.5,
        speed: 0.0015,
        amplitude: 60,
        yScale: 0.75,
        colorStart: "rgba(138, 105, 33, 0.22)", // Deep bronze/amber
        colorEnd: "rgba(138, 105, 33, 0)",
      },
    ];

    // Trajectory particles following flowing pathways upwards to symbolize growth/integration
    interface PathParticle {
      t: number;      // Progress parameter along the path (0 to 1)
      speed: number;  // Progress rate
      offsetY: number;// Vertical start offset
      curveX: number; // Amplitude multiplier for cosine curve
      size: number;
      alpha: number;
    }

    const particles: PathParticle[] = [];
    const maxParticles = 15;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        t: Math.random(),
        speed: Math.random() * 0.0015 + 0.0008,
        offsetY: Math.random() * 200 - 50,
        curveX: Math.random() * 80 + 40,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    const initCanvas = (w: number, h: number) => {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        initCanvas(entryWidth, entryHeight);
      }
    });

    resizeObserver.observe(container);

    // Render loop
    const render = () => {
      // Background base (deep matte slate matching #0e0f14)
      ctx.fillStyle = "#0c0d12";
      ctx.fillRect(0, 0, width, height);

      const isMobile = width < 768;

      // 1. Draw structured geometric net lines on the right side (Integration Grid)
      ctx.strokeStyle = "rgba(188, 153, 60, 0.015)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = width * 0.3; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(width * 0.3, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw active radar compass / tactical telemetry coordinates in the bottom right corner
      const compassX = width * 0.85;
      const compassY = height * 0.8;
      const compassRad = isMobile ? 80 : 140;

      ctx.strokeStyle = "rgba(188, 153, 60, 0.035)";
      ctx.beginPath();
      ctx.arc(compassX, compassY, compassRad, 0, Math.PI * 2);
      ctx.arc(compassX, compassY, compassRad * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(compassX - compassRad - 10, compassY);
      ctx.lineTo(compassX + compassRad + 10, compassY);
      ctx.moveTo(compassX, compassY - compassRad - 10);
      ctx.lineTo(compassX, compassY + compassRad + 10);
      ctx.stroke();

      // Sweeping compass indicators
      const rotateAngle = (Date.now() * 0.0003) % (Math.PI * 2);
      ctx.strokeStyle = "rgba(188, 153, 60, 0.08)";
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(
        compassX + Math.cos(rotateAngle) * compassRad,
        compassY + Math.sin(rotateAngle) * compassRad
      );
      ctx.stroke();

      // 3. Render glowing golden waves on the bottom
      waves.forEach((wave) => {
        wave.phase += wave.speed;

        ctx.beginPath();
        // Set curve points
        ctx.moveTo(0, height);

        const segments = 40;
        const widthStep = width / segments;

        for (let i = 0; i <= segments; i++) {
          const currentX = i * widthStep;
          // Apply customized wave calculation (combines sine and baseline trajectory)
          const angle = (currentX / width) * Math.PI * 2 + wave.phase;
          const curveFactor = Math.sin(angle);
          
          // Slope upward toward the right edge
          const verticalSlope = (currentX / width) * 120 * wave.yScale;
          const currentY = height - 10 - verticalSlope + curveFactor * wave.amplitude;

          ctx.lineTo(currentX, currentY);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Create gradient fill extending vertically
        const grad = ctx.createLinearGradient(0, height - 180, 0, height);
        grad.addColorStop(0, "rgba(188, 153, 60, 0.0)");
        grad.addColorStop(0.4, wave.colorStart);
        grad.addColorStop(1, wave.colorEnd);

        ctx.fillStyle = grad;
        ctx.fill();
      });

      // 4. Update and run Golden Path Trajectory Particles rising along the slopes
      particles.forEach((p) => {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.offsetY = Math.random() * 120 - 30;
          p.curveX = Math.random() * 80 + 40;
        }

        // Move horizontally from left quadrant past the right boundary
        const px = width * (0.35 + p.t * 0.65);
        // Map curves to trajectories
        const waveAngle = p.t * Math.PI * 1.5 + (Date.now() * 0.001);
        const py = height - (p.t * (height * 0.85)) - p.offsetY + Math.cos(waveAngle) * 20;

        const currentAlpha = p.alpha * Math.sin(p.t * Math.PI);

        ctx.beginPath();
        ctx.fillStyle = `rgba(188, 153, 60, ${currentAlpha})`;
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect particles in proximity to form integrated mesh nodes
        particles.forEach((other) => {
          if (p === other) return;
          const ox = width * (0.35 + other.t * 0.65);
          const oy = height - (other.t * (height * 0.85)) - other.offsetY + Math.cos(other.t * Math.PI * 1.5 + (Date.now() * 0.001)) * 20;
          
          const dx = px - ox;
          const dy = py - oy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 75) {
            const lineAlpha = (1 - dist / 75) * 0.06 * Math.min(currentAlpha, other.alpha);
            ctx.strokeStyle = `rgba(188, 153, 60, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(ox, oy);
            ctx.stroke();
          }
        });
      });

      // 5. Draw strong left side deep vignette overlay to preserve high-contrast text legibility
      const textVignette = ctx.createLinearGradient(0, 0, width, 0);
      textVignette.addColorStop(0, "rgba(12, 13, 18, 1.0)");
      textVignette.addColorStop(isMobile ? 0.45 : 0.4, "rgba(12, 13, 18, 0.96)");
      textVignette.addColorStop(isMobile ? 0.75 : 0.65, "rgba(12, 13, 18, 0.45)");
      textVignette.addColorStop(1, "rgba(12, 13, 18, 0.02)");

      ctx.fillStyle = textVignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded"
      id="whi-integrated-path-gold-backdrop"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block opacity-100"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
