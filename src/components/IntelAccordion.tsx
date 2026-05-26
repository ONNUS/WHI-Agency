import React, { useState } from "react";
import { motion } from "motion/react";

interface AccordionItem {
  id: string;
  number: string;
  title: string;
  description: string;
}

export default function IntelAccordion() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const items: AccordionItem[] = [
    {
      id: "intel-01",
      number: "01",
      title: "Unbiased strategic clarity",
      description:
        "When the assessment isn't free, our findings aren't shaped by what services we want to sell you next. We analyze the real bottlenecks — even when it's not a marketing problem.",
    },
    {
      id: "intel-02",
      number: "02",
      title: "Diagnosis gates execution",
      description:
        "No competitive intelligence, no systems stress-test, no campaign deployment happens until we possess precise battlefield variables. We do not move troops blindly.",
    },
    {
      id: "intel-03",
      number: "03",
      title: "Subsidized partnership model",
      description:
        "If you transition to a transformation BDS retainer within 14 days of your combat plan delivery, 50% of the DNA™ fee is credited back, making the intelligence highly subsidized.",
    },
    {
      id: "intel-04",
      number: "04",
      title: "High mutual qualification",
      description:
        "Our team monitors inputs before authorization. If your organization is not ready for real operational remodeling, we will decline the assessment and suggest an early-stage pivot resource.",
    },
  ];

  return (
    <div 
      className="w-full flex flex-col md:flex-row gap-4 h-[650px] md:h-[450px]"
      id="intel-principle-accordion-container"
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <motion.div
            key={item.id}
            id={`intel-accordion-item-${item.number}`}
            layout
            onClick={() => setActiveIndex(index)}
            className={`relative overflow-hidden cursor-pointer rounded-lg border flex flex-col justify-between p-6 sm:p-8 transition-colors duration-300 ${
              isActive
                ? "bg-[#0e0f14] border-[#bc993c]/50 shadow-2xl shadow-[#bc993c]/5"
                : "bg-stone-950/40 hover:bg-[#0c0d12]/80 border-stone-900/40 hover:border-stone-850"
            }`}
            animate={{
              flexGrow: isActive ? 5 : 1,
              flexShrink: isActive ? 1 : 2,
              flexBasis: isActive ? "45%" : "10%",
            }}
            transition={{
              type: "spring",
              stiffness: 110,
              damping: 18,
            }}
          >
            {/* Horizontal or Vertical orientation depending on active state */}
            {isActive ? (
              // ACTIVE EXPANDED FULL VIEW
              <div className="flex flex-col h-full justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-900/50 pb-4">
                    <span className="font-mono text-sm sm:text-base font-bold text-[#bc993c]">
                      {item.number}
                    </span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  
                  <motion.h4
                    layout="position"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="font-serif text-stone-100 text-xl sm:text-2xl font-bold tracking-tight"
                  >
                    {item.title}
                  </motion.h4>
                </div>

                <motion.p
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.08, duration: 0.3 }}
                  className="text-stone-300 text-sm sm:text-base leading-relaxed font-sans flex-1 pt-2"
                >
                  {item.description}
                </motion.p>

                <div className="border-t border-[#bc993c]/10 pt-4">
                  <span className="font-mono text-[10px] sm:text-xs text-[#bc993c]/60 uppercase tracking-widest block font-bold">
                    WHI Intel Doctrine Module
                  </span>
                </div>
              </div>
            ) : (
              // INACTIVE COLLAPSED VIEW
              <div className="flex flex-col md:h-full justify-between items-center h-full">
                
                {/* Number indicator */}
                <div className="flex items-center justify-between w-full md:w-auto">
                  <span className="font-mono text-stone-500 text-sm md:text-base font-semibold">
                    {item.number}
                  </span>
                  
                  {/* Title shown standard inline on mobile collapsed, but rotated beautifully on desktop */}
                  <span className="md:hidden font-serif text-stone-400 text-sm font-semibold truncate ml-3 flex-1 text-left">
                    {item.title}
                  </span>

                  <span className="text-xs font-mono text-[#bc993c]/40 md:hidden font-bold shrink-0">
                    TAP
                  </span>
                </div>

                {/* Desktop vertical spine text mimicking references (bottom reads up) */}
                <div className="hidden md:flex flex-1 items-center justify-center w-full py-4 overflow-hidden relative">
                  {/* Spine pathway divider visual indicator line */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-stone-850 to-transparent pointer-events-none" />

                  <div className="relative z-10 bg-[#07080c] group-hover:bg-[#0c0d12] px-2 py-6">
                    <h4 
                      className="font-serif text-stone-400 text-sm font-semibold tracking-wide whitespace-nowrap rotate-180 uppercase select-none transition-colors duration-300 hover:text-stone-300"
                      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                    >
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Tiny node anchor point at desktop footer */}
                <div className="hidden md:block">
                  <div className="w-2 h-2 rounded-full border border-stone-800 bg-stone-900 group-hover:border-[#bc993c]/20 transition-colors" />
                </div>

              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
