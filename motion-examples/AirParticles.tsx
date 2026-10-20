/** Environmental airflow composition (chapter two) built on Drei's
 * CatmullRomLine: https://drei.docs.pmnd.rs/abstractions/catmull-rom-line
 * The first-chapter breathing scene is the Motion-driven particle nebula
 * in ParticleBreath.tsx.
 */
import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CatmullRomLine } from "@react-three/drei/core/CatmullRomLine.js";
import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { ParticleBreath } from "./ParticleBreath";
const colors = ["#a8d6e5", "#b9b6ed", "#e2b6ce"];
function FlowLine({
  lane,
  index,
  active,
  reduced,
}: {
  lane: number;
  index: number;
  active: boolean;
  reduced: boolean;
}) {
  const material = useRef<any>(null);
  const points = Array.from({ length: 9 }, (_, i) => {
    const x = -2 + i * 0.5;
    return [
      x,
      lane * 0.65 + Math.sin(x * 1.6 + index * 0.22) * 0.21,
      index * 0.065,
    ] as [number, number, number];
  });
  useEffect(() => {
    if (reduced || !material.current) return;
    const control = animate(0, -12, {
      duration: active ? 6 : 10,
      repeat: Infinity,
      ease: "linear",
      onUpdate: (v) => {
        if (material.current) material.current.dashOffset = v;
      },
    });
    return () => control.stop();
  }, [active, reduced]);
  return (
    <>
      <CatmullRomLine
        points={points}
        color={colors[lane + 1]}
        lineWidth={0.65}
        transparent
        opacity={active ? 0.32 : 0.13}
      />
      <CatmullRomLine
        points={points}
        color={colors[lane + 1]}
        lineWidth={active ? 2 : 1}
        dashed
        dashSize={0.35}
        gapSize={2.1}
        transparent
        opacity={active ? 0.95 : 0.4}
        onUpdate={(line: any) => {
          material.current = line.material;
        }}
      />
    </>
  );
}
export function AirParticles({
  variant,
  environment = "A quiet afternoon",
}: {
  variant: number;
  environment?: string;
}) {
  const reduced = !!useReducedMotion();
  const active =
    environment === "Pollen season"
      ? 2
      : environment === "A busy street"
        ? 1
        : 0;
  if (variant === 0) {
    return <ParticleBreath />;
  }
  return (
    <div
      className={
        "air-particle-scene smooth-air-scene particle-chapter-" + variant
      }
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 38 }}
        dpr={[1, 1.7]}
        gl={{ alpha: true, antialias: true }}
        frameloop={reduced ? "demand" : "always"}
        fallback={
          <div className="particle-fallback">A little room to breathe.</div>
        }
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[-3, 4, 4]} intensity={3} color="#e8e9ff" />
        <pointLight position={[3, -1, 2]} intensity={12} color="#c6b9e4" />
        <group rotation={[0.18, -0.12, -0.12]}>
            {[-1, 0, 1].map((lane) => (
              <group key={lane}>
                {[0, 1, 2, 3].map((index) => (
                  <FlowLine
                    key={index}
                    lane={lane}
                    index={index}
                    active={active === lane + 1}
                    reduced={reduced}
                  />
                ))}
              </group>
            ))}
          </group>
      </Canvas>
      <>
        <div className="flow-scene-legend">
          {["Everyday air", "Street-level particles", "Seasonal pollen"].map(
            (label, i) => (
              <span
                key={label}
                className={active === i ? "active" : ""}
                style={{ "--flow-color": colors[i] } as React.CSSProperties}
              >
                {label}
              </span>
            ),
          )}
        </div>
        <p className="particle-scene-note">
          A changing world. A little more context.
        </p>
      </>
    </div>
  );
}
