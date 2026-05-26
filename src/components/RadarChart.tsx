import React from "react";

interface RadarChartProps {
  scores: {
    blue: number;
    red: number;
    green: number;
    battlespace: number;
    gap: number;
  };
  onScoreChange?: (key: "blue" | "red" | "green" | "battlespace" | "gap", value: number) => void;
  interactive?: boolean;
}

export default function RadarChart({ scores, onScoreChange, interactive = true }: RadarChartProps) {
  const width = 300;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const r = 100; // max radius for score of 10

  const keys: Array<{ key: "blue" | "red" | "green" | "battlespace" | "gap"; label: string; color: string; rgb: string }> = [
    { key: "blue", label: "Blue Force (Talent & Offers)", color: "#2e63a6", rgb: "46, 99, 166" },
    { key: "red", label: "Red Force (Competitor Intel)", color: "#b13b3f", rgb: "177, 59, 63" },
    { key: "green", label: "Green Force (Readiness)", color: "#308c5f", rgb: "48, 140, 95" },
    { key: "battlespace", label: "Battlespace (Tech & Shifts)", color: "#6647b1", rgb: "102, 71, 177" },
    { key: "gap", label: "Strategic Gap (Margins)", color: "#b67820", rgb: "182, 120, 32" },
  ];

  // Helper to calculate X, Y coordinates given angle and distance
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
    const distance = (value / 10) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  // Concentric Web rings (levels 2, 4, 6, 8, 10)
  const rings = [2, 4, 6, 8, 10];

  const valuePoints = keys.map((item, index) => {
    const score = scores[item.key];
    return getCoordinates(index, score);
  });

  const valuePolygonPath = valuePoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-stone-950 border border-stone-800 rounded-lg shadow-xl" id="radar-chart-container">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[280px] h-auto">
          {/* Background circles or webs */}
          {rings.map((ringValue, ringIdx) => {
            const ringPoints = keys.map((_, idx) => getCoordinates(idx, ringValue));
            const path = ringPoints.map(p => `${p.x},${p.y}`).join(" ");
            return (
              <polygon
                key={ringIdx}
                points={path}
                fill="none"
                stroke="#2a2824"
                strokeWidth="1"
                strokeDasharray={ringValue === 10 ? "none" : "3 3"}
              />
            );
          })}

          {/* Radial axis lines */}
          {keys.map((_, idx) => {
            const center = { x: cx, y: cy };
            const outer = getCoordinates(idx, 10);
            return (
              <line
                key={idx}
                x1={center.x}
                y1={center.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#2a2824"
                strokeWidth="1"
              />
            );
          })}

          {/* Score Area Polygon */}
          <polygon
            points={valuePolygonPath}
            fill="rgba(188, 153, 60, 0.15)"
            stroke="#bc993c"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Individual Axis nodes */}
          {keys.map((item, idx) => {
            const score = scores[item.key];
            const p = getCoordinates(idx, score);
            const outerLabelPos = getCoordinates(idx, 11.5);
            return (
              <g key={item.key} className="group cursor-help">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill={item.color}
                  stroke="#0b0c0f"
                  strokeWidth="1.5"
                  className="transition-all duration-300 shadow"
                />
                <text
                  x={outerLabelPos.x}
                  y={outerLabelPos.y + 4} // adjust vertical centering
                  textAnchor="middle"
                  fill="#e8e4da"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                  className="fill-stone-300 select-none opacity-80"
                >
                  {scores[item.key].toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay / Central score indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-2xl font-bold text-stone-100 tracking-tight" id="readiness-score-display">
            {((scores.blue + scores.red + scores.green + scores.battlespace + scores.gap) / 5).toFixed(1)}
          </span>
          <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest font-semibold">
            Readiness
          </span>
        </div>
      </div>

      {interactive && onScoreChange && (
        <div className="w-full mt-4 space-y-3.5 border-t border-stone-800 pt-4" id="radar-chart-sliders">
          <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest text-center mb-1">
            Tactical Adjustments (Test Scenarios)
          </p>
          {keys.map((item) => (
            <div key={item.key} className="flex items-center justify-between space-x-3 text-xs">
              <span className="font-mono text-[10px] w-24 text-stone-400 capitalize flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                <span>{item.key === "gap" ? "Gap Analysis" : item.key === "battlespace" ? "Battlespace" : item.key + " Force"}</span>
              </span>
              <input
                id={`slider-${item.key}`}
                type="range"
                min="1"
                max="10"
                step="1"
                value={scores[item.key]}
                onChange={(e) => onScoreChange(item.key, parseInt(e.target.value))}
                className="w-full accent-[#bc993c] bg-stone-800 h-1 rounded-lg border-none outline-none cursor-pointer"
              />
              <span className="font-mono text-[10px] w-6 text-right font-semibold text-amber-500">
                {scores[item.key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
