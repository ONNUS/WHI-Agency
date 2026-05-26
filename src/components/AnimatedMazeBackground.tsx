import React, { useEffect, useRef } from "react";

export default function AnimatedMazeBackground() {
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

    // Define color wave animators to replicate the aurora-like beams in the image
    interface GlowBeam {
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      rotation: number;
      colorStart: string;
      colorEnd: string;
      phase: number;
      speed: number;
      baseX: number;
      baseY: number;
    }

    const beams: GlowBeam[] = [];

    // Initialize custom glowing zones mirroring the attached image's structure
    const initBeams = (w: number, h: number) => {
      beams.length = 0;

      // 1. Warm orange/peach flare in the bottom-left corner
      beams.push({
        x: 0,
        y: h,
        radiusX: w * 0.85,
        radiusY: h * 0.75,
        rotation: -Math.PI / 6,
        colorStart: "rgba(226, 98, 61, 0.42)", // Warm Peach/Orange hex #e2623d
        colorEnd: "rgba(226, 98, 61, 0.0)",
        phase: Math.random() * Math.PI,
        speed: 0.003,
        baseX: 0,
        baseY: h,
      });

      // 2. Beautiful cyan/teal light ray rising from the bottom-center/right
      beams.push({
        x: w * 0.65,
        y: h,
        radiusX: w * 0.75,
        radiusY: h * 0.95,
        rotation: -Math.PI / 4,
        colorStart: "rgba(19, 154, 169, 0.48)", // Teal/Cyan aura hex #139aa9
        colorEnd: "rgba(19, 154, 169, 0.0)",
        phase: Math.random() * Math.PI,
        speed: 0.002,
        baseX: w * 0.65,
        baseY: h,
      });

      // 3. Ambient slate blue/indigo soft glow filling the bottom-right
      beams.push({
        x: w,
        y: h * 0.8,
        radiusX: w * 0.65,
        radiusY: h * 0.8,
        rotation: 0,
        colorStart: "rgba(35, 78, 120, 0.35)", // Indigo/Slate blue
        colorEnd: "rgba(35, 78, 120, 0.0)",
        phase: Math.random() * Math.PI,
        speed: 0.004,
        baseX: w,
        baseY: h * 0.8,
      });
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = entryWidth;
        height = entryHeight;
        canvas.width = entryWidth;
        canvas.height = entryHeight;
        initBeams(entryWidth, entryHeight);
      }
    });

    resizeObserver.observe(container);

    // Drifting background dust particles that slowly float around
    interface DustParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      phase: number;
      pulseSpeed: number;
    }

    const particles: DustParticle[] = [];
    const maxParticles = 12;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * 400,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.1,
        vy: -Math.random() * 0.12 - 0.05,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.35 + 0.1,
        phase: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    // Render loop
    const render = () => {
      // Draw background base (deep dark charcoal matching #030305 #0a0b0d)
      ctx.fillStyle = "#0c0d12";
      ctx.fillRect(0, 0, width, height);

      // 1. Draw each glowing color flare/beam in fluid animation
      beams.forEach((beam) => {
        beam.phase += beam.speed;
        
        // Gentle wave motion for coordinates and radius
        const scale = 1.0 + Math.sin(beam.phase) * 0.12;
        const radiusX = beam.radiusX * scale;
        const radiusY = beam.radiusY * (2.0 - scale);
        
        // Minor translation drift
        const dx = Math.cos(beam.phase * 0.7) * (width * 0.02);
        const dy = Math.sin(beam.phase * 0.9) * (height * 0.02);

        ctx.save();
        ctx.translate(beam.baseX + dx, beam.baseY + dy);
        ctx.rotate(beam.rotation);

        // Circular gradient mapping to draw a smooth feather-edged glow matching the photo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(radiusX, radiusY));
        grad.addColorStop(0, beam.colorStart);
        grad.addColorStop(0.35, beam.colorStart.replace(/[\d.]+\)$/, "0.18)"));
        grad.addColorStop(1, beam.colorEnd);

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Draw an ellipse representing the anisotropic light beam flare
        ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Animate and overlay micro dust particles inside the glow fields
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.pulseSpeed;

        // Reset if floats off outer boundaries
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0 || p.x > width) {
          p.vx *= -1;
        }

        const opacity = p.alpha * (0.6 + Math.sin(p.phase) * 0.4);

        ctx.beginPath();
        // Match the glowing aura color channels depending on coordinate quadrant
        if (p.x < width * 0.45) {
          ctx.fillStyle = `rgba(226, 98, 61, ${opacity})`; // Peach/Orange light dust
        } else {
          ctx.fillStyle = `rgba(0, 242, 254, ${opacity})`; // Cyan/Teal tech dust
        }
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Dark vignette around the card's inner edges to maintain absolute contrast and clean boundaries
      const edgeVignette = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.4,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      edgeVignette.addColorStop(0, "rgba(12, 13, 18, 0.0)");
      edgeVignette.addColorStop(0.7, "rgba(12, 13, 18, 0.25)");
      edgeVignette.addColorStop(1, "rgba(12, 13, 18, 0.65)");

      ctx.fillStyle = edgeVignette;
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
      id="legacy-maze-glowing-aurora-backdrop"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block opacity-100"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
