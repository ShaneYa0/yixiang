"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Sparkles, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type RitualPhase = "idle" | "breath" | "cloud" | "coins" | "seal" | "done";

const yaoPattern = [false, true, false, false, true, false];

export function IchingRitualScene({ phase, startedAt }: { phase: RitualPhase; startedAt: number }) {
  return (
    <Canvas className="absolute inset-0" dpr={[1, 1.65]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} shadows>
      <Suspense fallback={null}>
        <CopperFurnaceRitual phase={phase} startedAt={startedAt} />
      </Suspense>
    </Canvas>
  );
}

function CopperFurnaceRitual({ phase, startedAt }: { phase: RitualPhase; startedAt: number }) {
  const ritualStart = useRef(0);
  const stageRef = useRef<THREE.Group>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, -0.15, 0));
  const active = phase !== "idle";

  useEffect(() => {
    if (active) ritualStart.current = startedAt / 1000;
  }, [active, startedAt]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const ritualTime = active ? Math.max(0, time - ritualStart.current) : 0;
    const progress = active ? easeOut(clamp(ritualTime / 4.1, 0, 1)) : 0;

    if (stageRef.current) {
      stageRef.current.rotation.y = Math.sin(time * 0.22) * 0.14 + progress * 0.38;
      stageRef.current.rotation.x = -0.08 - progress * 0.1;
      stageRef.current.position.y = 0.22 + Math.sin(time * 0.55) * 0.035;
    }

    state.camera.position.x = Math.sin(ritualTime * 0.65) * progress * 0.36;
    state.camera.position.y = 0.96 + Math.sin(ritualTime * Math.PI) * progress * 0.16;
    state.camera.position.z = 6.35 - progress * 1.35;
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.95, 6.35]} fov={37} />
      <color attach="background" args={["#19130e"]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[2.6, 4.2, 3.5]} intensity={2.5} castShadow />
      <pointLight position={[0, 0.28, 1.2]} intensity={active ? 38 : 18} color="#d9a34e" />
      <pointLight position={[-2.8, 1.2, 2.5]} intensity={14} color="#6f93a7" />
      <Environment preset="warehouse" environmentIntensity={0.38} />

      <group ref={stageRef} scale={1.18}>
        <QuestionMist active={active} phase={phase} />
        <TaijiSmoke active={active} phase={phase} />
        <Furnace active={active} phase={phase} />
        <FallingCoins active={active} phase={phase} />
        <RisingHexagram active={active} phase={phase} />
      </group>

      <Sparkles
        count={active ? 260 : 90}
        speed={active ? 1.55 : 0.38}
        size={active ? 4.5 : 2}
        scale={[5.2, 4.1, 3.2]}
        color="#d8af67"
        opacity={active ? 0.58 : 0.24}
      />
      <Text
        position={[0, -2.55, 0.08]}
        fontSize={0.12}
        letterSpacing={0.2}
        color={active ? "#d9b66a" : "#9a876b"}
        anchorX="center"
        anchorY="middle"
      >
        {active ? "铜炉问天  六爻自明" : "静心 · 一念起卦"}
      </Text>
    </>
  );
}

function Furnace({ active, phase }: { active: boolean; phase: RitualPhase }) {
  const groupRef = useRef<THREE.Group>(null);
  const fireRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = -1.45 + Math.sin(time * 0.75) * 0.025;
      groupRef.current.rotation.y = Math.sin(time * 0.35) * 0.08;
    }
    if (fireRef.current) {
      const glow = active ? 1 + Math.sin(time * 5) * 0.11 : 0.84 + Math.sin(time * 1.6) * 0.04;
      fireRef.current.scale.set(1.05 * glow, 0.58 * glow, 1.05 * glow);
      const material = fireRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = phase === "seal" || phase === "done" ? 0.54 : active ? 0.42 : 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.08, 0.025, 12, 128]} />
        <meshBasicMaterial color="#ffd98b" transparent opacity={active ? 0.72 : 0.46} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={fireRef} position={[0, 0.4, 0]}>
        <sphereGeometry args={[1.1, 48, 24]} />
        <meshBasicMaterial color="#d99d42" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0]} scale={[1.28, 0.46, 0.76]}>
        <sphereGeometry args={[0.92, 64, 24]} />
        <meshStandardMaterial color="#6d4a24" metalness={0.72} roughness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.09, 18, 96]} />
        <meshStandardMaterial color="#c58b3d" metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.018, 10, 96]} />
        <meshStandardMaterial color="#2c2416" metalness={0.28} roughness={0.65} transparent opacity={0.75} />
      </mesh>
      <mesh castShadow position={[-0.95, 0.1, 0]} rotation={[0, 0, 0.34]}>
        <torusGeometry args={[0.28, 0.045, 12, 48]} />
        <meshStandardMaterial color="#9f7135" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh castShadow position={[0.95, 0.1, 0]} rotation={[0, 0, -0.34]}>
        <torusGeometry args={[0.28, 0.045, 12, 48]} />
        <meshStandardMaterial color="#9f7135" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh receiveShadow position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.84, 0.42, 0.24, 64]} />
        <meshStandardMaterial color="#4a321b" metalness={0.65} roughness={0.4} />
      </mesh>
    </group>
  );
}

function TaijiSmoke({ active, phase }: { active: boolean; phase: RitualPhase }) {
  const groupRef = useRef<THREE.Group>(null);
  const goldRef = useRef<THREE.Mesh>(null);
  const blueRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const goldCurve = useMemo(() => makeSmokeCurve(0), []);
  const blueCurve = useMemo(() => makeSmokeCurve(Math.PI), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const intensity = active ? 1 : 0.28;
    if (groupRef.current) {
      groupRef.current.rotation.z = time * (active ? 0.52 : 0.1);
      groupRef.current.position.y = -0.05 + Math.sin(time * 0.7) * 0.05;
    }
    [goldRef.current, blueRef.current].forEach((mesh, index) => {
      if (!mesh) return;
      mesh.rotation.z = Math.sin(time * 0.7 + index) * 0.12;
      const scale = 0.64 + intensity * 0.36 + Math.sin(time * 1.8 + index) * 0.035;
      mesh.scale.setScalar(scale);
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = phase === "cloud" || phase === "coins" || phase === "seal" ? 0.64 : active ? 0.42 : 0.2;
    });
    if (ringRef.current) {
      ringRef.current.rotation.z = -time * (active ? 0.85 : 0.18);
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = active ? 0.58 : 0.22;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.32, 0.05]}>
      <mesh ref={goldRef} geometry={goldCurve}>
        <meshBasicMaterial color="#e9bf69" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={blueRef} geometry={blueCurve}>
        <meshBasicMaterial color="#6f95a8" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.58, -0.05]}>
        <torusGeometry args={[1.42, 0.012, 12, 160]} />
        <meshBasicMaterial color="#d8b46a" transparent opacity={0.24} depthWrite={false} />
      </mesh>
    </group>
  );
}

function QuestionMist({ active, phase }: { active: boolean; phase: RitualPhase }) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => makeMistGeometry(900), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const intensity = active ? 1 : 0.26;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * (0.15 + intensity * 0.65);
      pointsRef.current.rotation.z = Math.sin(time * 0.22) * 0.16;
      pointsRef.current.position.y = -0.12 + intensity * 0.12;
      const material = pointsRef.current.material as THREE.PointsMaterial;
      material.opacity = phase === "done" ? 0.22 : 0.22 + intensity * 0.46;
      material.size = 0.018 + intensity * 0.014;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial vertexColors transparent opacity={0.26} size={0.02} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function FallingCoins({ active, phase }: { active: boolean; phase: RitualPhase }) {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <Coin key={index} index={index} active={active} phase={phase} />
      ))}
    </>
  );
}

function Coin({ index, active, phase }: { index: number; active: boolean; phase: RitualPhase }) {
  const groupRef = useRef<THREE.Group>(null);
  const baseX = [-0.74, 0.74, 0][index];
  const baseZ = [-0.28, -0.15, 0.2][index];

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const activeLift = active ? 1 : 0;
    const dropping = phase === "coins" || phase === "seal" || phase === "done";
    const settled = phase === "seal" || phase === "done";
    if (!groupRef.current) return;

    const fly = dropping ? 1 : 0;
    const y = dropping ? 0.68 + Math.sin(time * 8 + index) * (settled ? 0.06 : 0.42) : 2.15 + Math.sin(time * 0.9 + index) * 0.12;
    const orbit = time * (active ? 2.6 : 0.28) + index * 2.1;
    groupRef.current.position.set(baseX + Math.cos(orbit) * (settled ? 0.05 : 0.24 * fly), y, baseZ + Math.sin(orbit) * (settled ? 0.05 : 0.28));
    groupRef.current.rotation.x = Math.PI / 2 + time * (1.2 + activeLift * 7.8);
    groupRef.current.rotation.y = time * (0.8 + activeLift * 4.5) + index;
    groupRef.current.scale.setScalar(settled ? 0.86 : 0.92 + Math.sin(time * 5 + index) * 0.05);
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 96]} />
        <meshStandardMaterial color={index === 1 ? "#e1b75a" : "#b67c31"} metalness={0.92} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.12, 0.014, 0.12]} />
        <meshStandardMaterial color="#2c2416" metalness={0.15} roughness={0.72} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.01, 10, 96]} />
        <meshStandardMaterial color="#6f4f25" metalness={0.8} roughness={0.34} />
      </mesh>
    </group>
  );
}

function RisingHexagram({ active, phase }: { active: boolean; phase: RitualPhase }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (!groupRef.current) return;
    const lifted = phase === "seal" || phase === "done";
    groupRef.current.position.y = (lifted ? 0.78 : 0.35) + Math.sin(time * 0.9) * 0.035;
    groupRef.current.rotation.z = Math.sin(time * 0.35) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {yaoPattern.map((broken, index) => (
        <YaoLine key={`${broken}-${index}`} index={index} broken={broken} active={active} phase={phase} />
      ))}
    </group>
  );
}

function YaoLine({ index, broken, active, phase }: { index: number; broken: boolean; active: boolean; phase: RitualPhase }) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const fullRef = useRef<THREE.Mesh>(null);
  const y = index * 0.19;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const seal = phase === "seal" || phase === "done";
    const revealTarget = seal ? 1 : active ? 0.2 : 0.05;
    const reveal = clamp(revealTarget - index * 0.035 + Math.sin(time * 4 + index) * (seal ? 0.035 : 0.01), 0.04, 1);
    [leftRef.current, rightRef.current, fullRef.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.scale.x = reveal;
      mesh.position.z = seal ? 0.08 + Math.sin(time * 5 + index) * 0.022 : 0;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = seal ? 0.24 + Math.sin(time * 3.5 + index) * 0.08 : 0.04;
    });
  });

  const material = (
    <meshStandardMaterial color={phase === "seal" || phase === "done" ? "#f1d48a" : "#a99673"} emissive="#b48232" emissiveIntensity={0.08} metalness={0.45} roughness={0.32} />
  );

  if (broken) {
    return (
      <>
        <mesh ref={leftRef} position={[-0.32, y, 0.05]}>
          <boxGeometry args={[0.42, 0.05, 0.055]} />
          {material}
        </mesh>
        <mesh ref={rightRef} position={[0.32, y, 0.05]}>
          <boxGeometry args={[0.42, 0.05, 0.055]} />
          {material}
        </mesh>
      </>
    );
  }

  return (
    <mesh ref={fullRef} position={[0, y, 0.05]}>
      <boxGeometry args={[1.05, 0.05, 0.055]} />
      {material}
    </mesh>
  );
}

function makeSmokeCurve(offset: number) {
  const points = Array.from({ length: 90 }, (_, index) => {
    const t = index / 89;
    const angle = offset + t * Math.PI * 2.35;
    const radius = 0.1 + t * 1.15;
    return new THREE.Vector3(Math.cos(angle) * radius, -0.72 + t * 1.95, Math.sin(angle) * radius * 0.34);
  });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 120, 0.018, 8, false);
}

function makeMistGeometry(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.24 + Math.random() * 2.25;
    const height = -0.2 + Math.random() * 2.7;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = height;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.55;

    const warm = Math.random();
    colors[index * 3] = warm > 0.32 ? 1 : 0.34;
    colors[index * 3 + 1] = warm > 0.32 ? 0.76 : 0.58;
    colors[index * 3 + 2] = warm > 0.32 ? 0.34 : 0.72;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOut(value: number) {
  return 1 - Math.pow(1 - value, 3);
}
