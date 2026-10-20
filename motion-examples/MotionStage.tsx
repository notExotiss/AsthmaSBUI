/** Product illustrations composed from Tabler/Lucide icons, HeroUI and Recharts.
 * Circle drawing adapts Motion's public path-drawing example:
 * https://motion.dev/examples/react-path-drawing
 * These are explanatory 2D scenes, not anatomical models or live measurements.
 */
import React from "react";
import { AirParticles } from "./AirParticles";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@heroui/react";

import {
  HeartPulse,
  Check,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
const trend = [
  { v: 25 },
  { v: 40 },
  { v: 33 },
  { v: 57 },
  { v: 43 },
  { v: 65 },
  { v: 60 },
  { v: 76 },
];
const labels = [
  "A little room to breathe",
  "The air around your day",
  "Small check-ins. A fuller picture.",
  "Your care, in one place",
];
export function MotionStage({
  variant = 0,
  replay = 0,
  environment = "A quiet afternoon",
}: {
  variant?: number;
  replay?: number;
  environment?: string;
}) {
  const reduced = useReducedMotion();
  const float = (delay = 0) =>
    reduced
      ? {}
      : {
          y: [0, -9, 0],
          transition: {
            duration: 5,
            delay,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };
  return (
    <div
      className={"official-motion-stage health-story-scene scene-" + variant}
      role="img"
      aria-label={labels[variant]}
    >
      <motion.div
        key={`${variant}-${replay}`}
        className="health-scene-inner"
        initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {variant < 2 && (
          <AirParticles variant={variant} environment={environment} />
        )}
        {variant === 2 && (
          <>
            <motion.div className="trend-scene-card" animate={float()}>
              <Card className="scene-info-card">
                <Card.Content>
                  <div className="scene-card-heading">
                    <HeartPulse size={20} />
                    <span>Your breathing journal</span>
                  </div>
                  <strong className="scene-big-label">
                    One day at a time.
                  </strong>
                  <div className="story-trend">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient
                            id="onboard-trend"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0"
                              stopColor="#b4adf1"
                              stopOpacity={0.45}
                            />
                            <stop
                              offset="1"
                              stopColor="#b4adf1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="natural"
                          dataKey="v"
                          stroke="#bcb6ee"
                          strokeWidth={2.5}
                          fill="url(#onboard-trend)"
                          isAnimationActive={!reduced}
                          animationDuration={1800}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="scene-chart-labels">
                    <span>Small observations</span>
                    <span>Over time</span>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
            <motion.div
              className="scene-tag journal-tag"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <Check size={17} /> A moment, recorded.
            </motion.div>
            <span className="scene-footnote">
              Illustrative trend · no health readings shown
            </span>
          </>
        )}
        {variant === 3 && (
          <>
            <motion.div className="care-scene-card" animate={float()}>
              <Card className="scene-info-card">
                <Card.Content>
                  <div className="scene-card-heading">
                    <ClipboardCheck size={22} />
                    <span>Your everyday space</span>
                  </div>
                  {[
                    "Notice how you feel",
                    "Keep your care plan close",
                    "Look back, together",
                  ].map((t, i) => (
                    <motion.div
                      className="scene-care-row"
                      key={t}
                      initial={{ opacity: 0, x: reduced ? 0 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.25 }}
                    >
                      <span className="scene-check">
                        <Check size={15} />
                      </span>
                      <span>{t}</span>
                    </motion.div>
                  ))}
                </Card.Content>
              </Card>
            </motion.div>
            <motion.div
              className="scene-tag care-tag"
              initial={{ scale: reduced ? 1 : 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: "spring", bounce: 0.25 }}
            >
              <ShieldCheck size={20} /> Made around you.
            </motion.div>
            <span className="scene-footnote">
              A starting point for you and your family.
            </span>
          </>
        )}
      </motion.div>
    </div>
  );
}
