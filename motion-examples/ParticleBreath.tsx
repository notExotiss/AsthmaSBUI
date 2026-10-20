/** First-chapter onboarding scene: lungs drawn in breathing particles.
 * Vanilla Three.js points driven by Motion's vanilla API, following the
 * upstream demos archived in this folder (three-sequence,
 * three-motion-values): threeEffect lets animate() treat the particle
 * group as a first-class subject, spring values drive pointer parallax,
 * and a repeating keyframe animation carries the seven-second breath.
 * On the inhale the two lobes expand and rise while airway particles
 * stream upward; on the exhale everything settles and releases.
 */
import React, { useEffect, useRef } from "react";
import { animate, frame, frameSteps } from "motion";
import { threeEffect } from "motion/three";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import * as THREE from "three";

animate.addEffect(threeEffect);

const BREATH = 7; // seconds per full breath, shared with the DOM cue
const palette = ["#a8d6e5", "#b9b6ed", "#e2b6ce", "#dfe9fb"].map(
  (c) => new THREE.Color(c),
);
const white = new THREE.Color("#ffffff");

function lungsGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const sides: number[] = [];
  const phases: number[] = [];

  const push = (x: number, y: number, z: number, side: number, bright: number) => {
    positions.push(x, y, z);
    const c = palette[(sizes.length + side + 4) % palette.length]
      .clone()
      .lerp(white, bright);
    colors.push(c.r, c.g, c.b);
    sizes.push(1 + Math.random() * Math.random() * 3.2);
    sides.push(side);
    phases.push(Math.random() * Math.PI * 2);
  };

  // Two lung lobes: ellipsoids biased toward the base, tips leaning outward.
  for (const side of [-1, 1]) {
    for (let k = 0; k < 1150; k++) {
      const r = Math.pow(Math.random(), 0.5);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      let lx = r * Math.sin(theta) * Math.cos(phi) * 0.72;
      let ly = r * Math.cos(theta) * 1.02;
      const lz = r * Math.sin(theta) * Math.sin(phi) * 0.55;
      ly = ly * (ly > 0 ? 0.72 : 1.08);
      const tilt = -0.16 * side;
      const cx = lx * Math.cos(tilt) - ly * Math.sin(tilt);
      const cy = lx * Math.sin(tilt) + ly * Math.cos(tilt);
      push(side * 0.85 + cx, -0.12 + cy, lz, side, Math.random() * 0.35);
    }
  }

  // The airway: a trachea column rising between the lobes, with bronchi
  // branching into each lobe. Brighter, so the breath reads as a stream.
  for (let k = 0; k < 420; k++) {
    if (Math.random() < 0.55) {
      const y = 0.75 + Math.random() * 1.5;
      const spread = 0.05 + (y - 0.75) * 0.02;
      push(
        (Math.random() - 0.5) * 2 * spread,
        y,
        (Math.random() - 0.5) * 1.4 * spread,
        0,
        0.45 + Math.random() * 0.4,
      );
    } else {
      const side = k % 2 === 0 ? -1 : 1;
      const t = Math.random();
      push(
        side * (0.06 + t * 0.62),
        0.78 - t * 0.5 + (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.16,
        0,
        0.45 + Math.random() * 0.4,
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("aSide", new THREE.Float32BufferAttribute(sides, 1));
  geometry.setAttribute("aPhase", new THREE.Float32BufferAttribute(phases, 1));
  return geometry;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.25, "rgba(255,255,255,0.4)");
  g.addColorStop(0.6, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const vertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSide;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uTime;
  uniform float uBreath;
  uniform float uPixelRatio;
  void main() {
    vColor = aColor;
    float airway = step(abs(aSide), 0.5);
    vec3 p = position;
    // Lobes expand about their own center and lift on the inhale.
    vec3 center = vec3(aSide * 0.85, -0.12, 0.0);
    p = center + (p - center) * (1.0 + uBreath * 0.26);
    p.y += uBreath * 0.13 * (1.0 - airway);
    // Airway particles stream upward while air is drawn in.
    p.y += uBreath * 0.5 * airway * (0.35 + 0.65 * fract(aPhase));
    // Gentle individual drift.
    p += 0.05 * vec3(
      sin(uTime * 0.55 + aPhase + position.y * 2.9),
      cos(uTime * 0.45 + aPhase * 1.3 + position.x * 2.2),
      sin(uTime * 0.60 + aPhase + position.x * 1.7)
    );
    // Each lobe slowly swirls about its own vertical axis.
    float ang = uTime * 0.2 * (1.0 - airway);
    float ca = cos(ang);
    float sa = sin(ang);
    p.xz = center.xz + mat2(ca, -sa, sa, ca) * (p.xz - center.xz);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float tw = 0.72 + 0.28 * sin(uTime * (0.9 + aSize * 0.35) + aPhase * 2.3);
    tw *= 1.0 + airway * uBreath * 0.9;
    vTwinkle = tw;
    gl_PointSize = aSize * tw * uPixelRatio * (13.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const fragmentShader = `
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float falloff = smoothstep(0.5, 0.02, d);
    falloff *= falloff;
    float alpha = falloff * vTwinkle * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function ParticleBreath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = !!useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 55, damping: 16, mass: 0.6 });
  const springY = useSpring(pointerY, { stiffness: 55, damping: 16, mass: 0.6 });
  const rotateY = useTransform(springX, (v) => v * 0.38);
  const rotateX = useTransform(springY, (v) => -v * 0.26);

  const breath = useMotionValue(0);
  const cueTransition = {
    duration: BREATH,
    repeat: Infinity,
    ease: "easeInOut" as const,
    times: [0, 0.4, 0.52, 1],
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      canvas.style.display = "none";
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.35, 6.2);
    camera.lookAt(0, 0.1, 0);

    // parallax: pointer springs · sway: idle drift · spin: entrance spring
    const parallax = new THREE.Group();
    const sway = new THREE.Group();
    const spin = new THREE.Group();
    sway.add(spin);
    parallax.add(sway);
    scene.add(parallax);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: reduced ? 2.5 : 0 },
        uBreath: { value: reduced ? 0.55 : 0 },
        uOpacity: { value: reduced ? 1 : 0 },
        uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
      },
      vertexShader,
      fragmentShader,
    });
    const points = new THREE.Points(lungsGeometry(), material);
    spin.add(points);

    // A soft light between the lobes that gathers on the inhale.
    const core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: "#9db4e6",
        transparent: true,
        opacity: reduced ? 0.16 : 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    core.position.set(0, 0.2, 0);
    core.scale.setScalar(1.5);
    spin.add(core);

    const resize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    // Motion drives the scene: a spring entrance for the whole group,
    // a repeating keyframe for the breath, springs for pointer parallax.
    const unsubBreath = breath.on("change", (v) => {
      material.uniforms.uBreath.value = v;
      core.material.opacity = 0.05 + v * 0.17;
      core.scale.setScalar(1.3 + v * 0.55);
    });
    const unsubY = rotateY.on("change", (v) => {
      parallax.rotation.y = v;
    });
    const unsubX = rotateX.on("change", (v) => {
      parallax.rotation.x = v;
    });

    let entrance: { stop: () => void } | undefined;
    let fade: { stop: () => void } | undefined;
    let breathControl: { stop: () => void } | undefined;
    if (reduced) {
      sway.rotation.y = 0.14;
      renderer.render(scene, camera);
    } else {
      entrance = animate(
        spin,
        { scale: [0.4, 1], rotateY: [-100, 0], rotateX: [-30, 0] },
        { type: "spring", stiffness: 80, damping: 14, mass: 0.9 },
      );
      fade = animate(0, 1, {
        duration: 1.6,
        ease: "easeOut",
        onUpdate: (v) => {
          material.uniforms.uOpacity.value = v;
        },
      });
      breathControl = animate(breath, [0, 1, 1, 0], {
        duration: BREATH,
        repeat: Infinity,
        ease: "easeInOut",
      });
    }

    const clock = new THREE.Clock();
    const renderProcess = reduced
      ? undefined
      : frame.render(() => {
          const t = clock.getElapsedTime();
          material.uniforms.uTime.value = t;
          sway.rotation.y = Math.sin(t * 0.25) * 0.2;
          sway.position.y = Math.sin(t * 0.4) * 0.05;
          camera.position.x = Math.sin(t * 0.18) * 0.18;
          camera.position.y = 0.35 + Math.cos(t * 0.14) * 0.12;
          camera.lookAt(0, 0.1, 0);
          renderer.render(scene, camera);
        }, true);

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
      pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    const onLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };
    if (!reduced) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }

    return () => {
      if (renderProcess) frameSteps.render.cancel(renderProcess);
      entrance?.stop();
      fade?.stop();
      breathControl?.stop();
      unsubBreath();
      unsubY();
      unsubX();
      observer.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      points.geometry.dispose();
      material.dispose();
      core.material.map?.dispose();
      core.material.dispose();
      renderer.dispose();
    };
  }, [reduced, breath, rotateX, rotateY, pointerX, pointerY]);

  return (
    <div
      className="air-particle-scene smooth-air-scene particle-chapter-0"
      ref={wrapRef}
    >
      <div className="particle-canvas-wrap">
        <canvas ref={canvasRef} aria-hidden />
      </div>
      {!reduced && (
        <div className="breath-cue" aria-hidden>
          <motion.span
            animate={{ opacity: [0.9, 0.9, 0, 0] }}
            transition={cueTransition}
          >
            breathe in
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 0, 0.9, 0.9] }}
            transition={cueTransition}
          >
            breathe out
          </motion.span>
        </div>
      )}
      <div className="breath-form-label">A MOMENT TO NOTICE</div>
      <p className="particle-scene-note">Your breathing has a rhythm.</p>
    </div>
  );
}
