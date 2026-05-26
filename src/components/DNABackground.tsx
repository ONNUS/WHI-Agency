import React, { useEffect, useRef } from "react";

export default function DNABackground() {
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

    // Particle structure for the dissolving effect
    interface DissolvingParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      maxLife: number;
      life: number;
    }

    const particles: DissolvingParticle[] = [];

    // Ambient floating backdrop nodes representing the larger network matrix
    interface BackdropNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const backdropNodes: BackdropNode[] = [];
    const backdropCount = 20;

    // Resize observer to ensure perfect canvas bounds matching the container
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = entryWidth;
        height = entryHeight;
        canvas.width = entryWidth;
        canvas.height = entryHeight;

        // Initialize background nodes
        backdropNodes.length = 0;
        const count = entryWidth < 768 ? 10 : backdropCount;
        for (let i = 0; i < count; i++) {
          backdropNodes.push({
            // Distribute primarily in the right half where the DNA is
            x: entryWidth * (0.5 + Math.random() * 0.5),
            y: Math.random() * entryHeight,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.2 + 0.05,
            pulseSpeed: Math.random() * 0.02 + 0.005,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }
    });

    resizeObserver.observe(container);

    let angleOffset = 0;
    const rotationSpeed = 0.006;

    // Render loop
    const render = () => {
      // Set pure near-charcoal background match
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, width, height);

      const isMobile = width < 768;

      // 1. Draw subtle geometric grid markings in the far background
      const gridSize = 100;
      ctx.strokeStyle = "rgba(0, 242, 254, 0.015)";
      ctx.lineWidth = 1;
      for (let x = width * 0.4; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(width * 0.4, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Render Backdrop Nodes (Ambient network)
      backdropNodes.forEach((node) => {
        // Linear drift
        node.x += node.vx;
        node.y += node.vy;

        // Keep inside bounds (right side only)
        if (node.x < width * 0.45) {
          node.x = width * 0.45;
          node.vx *= -1;
        }
        if (node.x > width) {
          node.x = width;
          node.vx *= -1;
        }
        if (node.y < 0 || node.y > height) node.vy *= -1;

        node.pulsePhase += node.pulseSpeed;
        const currentAlpha = node.alpha * (Math.sin(node.pulsePhase) * 0.3 + 0.7);

        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 242, 254, ${currentAlpha})`;
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Render 3D DNA Double Helix Strand (Elegantly aligned on the right half)
      const helixX = width * (isMobile ? 0.82 : 0.76); // Position helix 76% to 82% to the right
      const helixWidth = isMobile ? 35 : 75; // Helix horizontal amplitude
      const helixHeight = height; // Full container height
      const stepValue = isMobile ? 12 : 8; // Step frequency for drawing segments
      const pitch = 0.012; // Frequency of twist

      angleOffset += rotationSpeed;

      // Track positions along the strands to draw connectors (rungs) and spawn dissolving particles
      const strandPoints1: { x: number; y: number; z: number }[] = [];
      const strandPoints2: { x: number; y: number; z: number }[] = [];

      for (let y = 0; y < helixHeight; y += stepValue) {
        // Custom twisting math using sine and cosine with angleOffset
        const theta = y * pitch + angleOffset;
        
        // Z coordinates used purely to determine depth/scale/opacity
        const z1 = Math.sin(theta);
        const z2 = Math.sin(theta + Math.PI);

        // Responsive horizontal offsets
        const x1 = helixX + Math.cos(theta) * helixWidth;
        const x2 = helixX + Math.cos(theta + Math.PI) * helixWidth;

        strandPoints1.push({ x: x1, y, z: z1 });
        strandPoints2.push({ x: x2, y, z: z2 });

        // Rare chance of emitting particles from the helix nodes to simulate the "dissolving structure"
        if (Math.random() < (isMobile ? 0.02 : 0.05) && y < height * 0.8) {
          const onStrand1 = Math.random() > 0.5;
          const px = onStrand1 ? x1 : x2;
          const pz = onStrand1 ? z1 : z2;
          
          particles.push({
            x: px,
            y: y,
            vx: (Math.random() * 0.4 + 0.1) * (onStrand1 ? 1 : -1) + (Math.random() - 0.5) * 0.2,
            vy: -(Math.random() * 0.5 + 0.2), // Float up
            size: Math.random() * 1.5 + 0.6,
            alpha: (pz + 1) / 2 * 0.7 + 0.1,
            color: pz > 0 ? "#00F2FE" : "#0072FF", // Match tactical teal / command blue
            maxLife: Math.random() * 100 + 60,
            life: 0,
          });
        }
      }

      // Draw Connection Rungs (between complementary nodes)
      ctx.lineWidth = 1.0;
      for (let i = 0; i < strandPoints1.length; i += 2) {
        const pt1 = strandPoints1[i];
        const pt2 = strandPoints2[i];

        // Depth scale based on average Z coordinate
        const avgZ = (pt1.z + pt2.z) / 2;
        const depthAlpha = (avgZ + 1.2) / 2.2; // Bounds 0.09 to 1

        if (depthAlpha > 0.1) {
          // Gradient between teal (#00F2FE) and blue (#0072FF)
          const grad = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
          grad.addColorStop(0, `rgba(0, 242, 254, ${0.12 * depthAlpha})`);
          grad.addColorStop(0.5, `rgba(0, 114, 255, ${0.08 * depthAlpha})`);
          grad.addColorStop(1, `rgba(0, 242, 254, ${0.12 * depthAlpha})`);

          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();

          // Accent core node connection tick
          if (i % 4 === 0) {
            ctx.fillStyle = `rgba(0, 72, 255, ${0.2 * depthAlpha})`;
            ctx.beginPath();
            ctx.arc((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Strand 1 Nodes
      strandPoints1.forEach((pt) => {
        const scale = (pt.z + 1.5) / 2.5; // Depth multiplier
        const alpha = ((pt.z + 1) / 2) * 0.6 + 0.15; // Front nodes glow brighter

        // Teal outer glow plus white solid nucleus
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
        ctx.arc(pt.x, pt.y, (isMobile ? 2.5 : 4) * scale, 0, Math.PI * 2);
        ctx.fill();

        if (pt.z > 0.3) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          ctx.arc(pt.x, pt.y, (isMobile ? 1.0 : 1.5) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Strand 2 Nodes
      strandPoints2.forEach((pt) => {
        const scale = (pt.z + 1.5) / 2.5;
        const alpha = ((pt.z + 1) / 2) * 0.5 + 0.15;

        // Command blue focus
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 114, 255, ${alpha})`;
        ctx.arc(pt.x, pt.y, (isMobile ? 2.5 : 4) * scale, 0, Math.PI * 2);
        ctx.fill();

        if (pt.z > 0.3) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(0, 242, 254, ${alpha * 0.7})`;
          ctx.arc(pt.x, pt.y, (isMobile ? 1.0 : 1.5) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Update and Draw Dissolving Network Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifePercent = p.life / p.maxLife;
        const alpha = p.alpha * (1 - lifePercent);

        if (p.life >= p.maxLife || p.x > width || p.x < 0 || p.y < 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw dissolving particle with faint digital trace
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw micro data line connector vectors occasionally for network look
        if (i < particles.length - 1 && i % 8 === 0) {
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[i + 1].x, particles[i + 1].y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0; // Reset alpha channels

      // 5. Draw deep horizontal linear-vignette to ensure complete pure black slate color matching on the left half for supreme readability
      const shadowGrad = ctx.createLinearGradient(0, 0, width, 0);
      shadowGrad.addColorStop(0, "rgba(3, 3, 5, 1.0)");
      shadowGrad.addColorStop(isMobile ? 0.45 : 0.4, "rgba(3, 3, 5, 0.96)");
      shadowGrad.addColorStop(isMobile ? 0.75 : 0.65, "rgba(3, 3, 5, 0.5)");
      shadowGrad.addColorStop(1, "rgba(3, 3, 5, 0.05)");

      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, width, height);

      // Fine screen overlay line
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
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      id="dna-hybrid-visual-backdrop"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block opacity-70"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
