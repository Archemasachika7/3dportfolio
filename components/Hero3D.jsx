"use client"

import { Canvas } from "@react-three/fiber"
import { Float, OrbitControls } from "@react-three/drei"

function ResumeCard() {
  return (
    <Float
      speed={2}
      rotationIntensity={0.6}
      floatIntensity={1}
    >
      <mesh>
        <boxGeometry args={[3.2, 4.2, 0.15]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
    </Float>
  )
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ height: "100%", width: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />

      <ResumeCard />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
