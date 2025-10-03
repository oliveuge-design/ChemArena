import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useRef, useState } from 'react'
import TreasureHuntPanel from './TreasureHuntPanel'

// Componente atomo con PULSING GLOW
function Atom({ position, color, radius, index }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing effect - ogni atomo pulsa con fase diversa
      const time = state.clock.getElapsedTime()
      const phase = index * 0.5  // Sfasa ogni atomo
      const intensity = Math.sin(time * 2 + phase) * 0.15 + 0.35

      meshRef.current.material.emissiveIntensity = intensity

      // Scala leggera per breathe effect
      const scale = 1 + Math.sin(time * 2 + phase) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.35}
      />
    </mesh>
  )
}

// Componente legame con ENERGY FLOW
function Bond({ start, end, index }) {
  const meshRef = useRef()
  const startVec = new THREE.Vector3(...start)
  const endVec = new THREE.Vector3(...end)

  const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
  const direction = new THREE.Vector3().subVectors(endVec, startVec)
  const length = direction.length()

  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  )

  useFrame((state) => {
    if (meshRef.current) {
      // Energy flow pulsing
      const time = state.clock.getElapsedTime()
      const phase = index * 0.7
      const intensity = Math.sin(time * 3 + phase) * 0.2 + 0.5

      meshRef.current.material.emissiveIntensity = intensity

      // Scala leggera per flow effect
      const scaleY = 1 + Math.sin(time * 3 + phase) * 0.03
      meshRef.current.scale.y = scaleY
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={midpoint.toArray()}
      quaternion={quaternion.toArray()}
    >
      <cylinderGeometry args={[0.08, 0.08, length, 16]} />
      <meshStandardMaterial
        color="#00ffff"
        metalness={0.7}
        roughness={0.1}
        emissive="#00ffff"
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

// Componente formula con HTML per supportare pedici
function FormulaDisplay({ formula, position }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#00ffff',
          textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff',
          fontFamily: 'Arial, sans-serif',
          whiteSpace: 'nowrap',
          animation: 'glow-pulse 2s ease-in-out infinite'
        }}
        dangerouslySetInnerHTML={{ __html: formula }}
      />
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff;
          }
          50% {
            text-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff;
          }
        }
      `}</style>
    </Html>
  )
}

// Particelle fluttuanti background (lightweight)
function FloatingParticles() {
  const particlesRef = useRef()
  const particleCount = 20
  const positions = new Float32Array(particleCount * 3)

  // Posizioni random iniziali
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3
  }

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime()

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        // Movimento sinusoidale lento
        particlesRef.current.geometry.attributes.position.array[i3 + 1] +=
          Math.sin(time + i) * 0.001
        particlesRef.current.geometry.attributes.position.array[i3] +=
          Math.cos(time * 0.5 + i) * 0.0005
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Touch ripple effect
function TouchRipple({ position }) {
  const meshRef = useRef()
  const [visible, setVisible] = useState(true)

  useFrame((state, delta) => {
    if (meshRef.current && visible) {
      const scale = meshRef.current.scale.x
      meshRef.current.scale.setScalar(scale + delta * 3)
      meshRef.current.material.opacity -= delta * 2

      if (meshRef.current.material.opacity <= 0) {
        setVisible(false)
      }
    }
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.35, 32]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Componente principale molecola 3D - NEON THEME + ANIMATIONS
export default function Molecule3D({ compound, backgroundColor, onNavigateToMolecule }) {
  const [ripples, setRipples] = useState([])
  const [infoPanelMode, setInfoPanelMode] = useState('compact') // 'compact', 'expanded', 'hidden'
  const [showTreasureHunt, setShowTreasureHunt] = useState(false)

  if (!compound) return null

  const handleClick = (e) => {
    // Aggiungi ripple effect al click
    const newRipple = {
      id: Date.now(),
      position: [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        0
      ]
    }
    setRipples(prev => [...prev, newRipple])

    // Rimuovi dopo 1 secondo
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 1000)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '600px',
        background: 'transparent',
        position: 'relative',
        boxShadow: 'none',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        {/* Luci potenziate per effetto neon */}
        <ambientLight intensity={0.3} color="#4400ff" />
        <pointLight position={[5, 5, 5]} intensity={2} color="#00ffff" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#ff00ff" />
        <pointLight position={[0, 0, 8]} intensity={1.8} color="#00ff88" />
        <spotLight position={[0, 10, 0]} intensity={1.2} color="#ffffff" angle={0.3} />

        {/* Particelle fluttuanti background */}
        <FloatingParticles />

        {/* Controlli */}
        <OrbitControls
          enableZoom
          enableRotate
          enablePan
          touches={{ ONE: 0, TWO: 2 }}
          minDistance={2}
          maxDistance={10}
        />

        {/* Nome molecola - NEON CYAN - posizione alzata per evitare sovrapposizione atomi */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.35}
          color="#00ffff"
          anchorX="center"
          outlineWidth={0.02}
          outlineColor="#0088ff"
        >
          {compound.name}
        </Text>

        {/* Formula con pedice corretto */}
        <FormulaDisplay formula={compound.formula} position={[0, 3.0, 0]} />

        {/* Legami PRIMA (sotto gli atomi) - NEON con ENERGY FLOW */}
        {compound.bonds.map((bond, i) => (
          <Bond
            key={`bond-${i}`}
            index={i}
            start={compound.atoms[bond.from].position}
            end={compound.atoms[bond.to].position}
          />
        ))}

        {/* Atomi DOPO (sopra i legami) - con PULSING */}
        {compound.atoms.map((atom, i) => (
          <Atom
            key={`atom-${i}`}
            index={i}
            position={atom.position}
            color={atom.color}
            radius={atom.radius}
          />
        ))}

        {/* Touch ripples */}
        {ripples.map(ripple => (
          <TouchRipple key={ripple.id} position={ripple.position} />
        ))}
      </Canvas>

      {/* Info Panel Collapsible - 3 modalità: compact, expanded, hidden */}
      {infoPanelMode !== 'hidden' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.85)',
          padding: infoPanelMode === 'compact' ? '16px 20px' : '20px 28px',
          borderRadius: '12px',
          color: '#00ffff',
          backdropFilter: 'blur(10px)',
          border: '3px solid #00ffff',
          boxShadow: '0 0 50px rgba(0,255,255,1), 0 0 80px rgba(0,255,255,0.8), inset 0 0 30px rgba(0,255,255,0.3)',
          fontFamily: 'Arial, sans-serif',
          animation: 'panel-glow 3s ease-in-out infinite',
          maxWidth: infoPanelMode === 'compact' ? '350px' : '800px',
          width: infoPanelMode === 'compact' ? 'auto' : 'calc(100% - 40px)',
          transition: 'all 0.3s ease',
          maxHeight: '70vh',
          overflowY: 'auto',
          textShadow: '0 0 20px rgba(0,255,255,1), 0 0 40px rgba(0,255,255,0.8)'
        }}>
          {/* Header con pulsanti toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: infoPanelMode === 'expanded' ? '16px' : '8px',
            borderBottom: infoPanelMode === 'expanded' ? '1px solid rgba(0,255,255,0.3)' : 'none',
            paddingBottom: infoPanelMode === 'expanded' ? '10px' : '0'
          }}>
            <h3 style={{
              color: '#00ffff',
              fontSize: infoPanelMode === 'compact' ? '16px' : '20px',
              margin: 0,
              textShadow: '0 0 10px rgba(0,255,255,0.6)'
            }}>
              📊 Info Molecola
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setInfoPanelMode('compact')}
                style={{
                  background: infoPanelMode === 'compact' ? '#00ffff' : 'rgba(0,255,255,0.2)',
                  color: infoPanelMode === 'compact' ? '#000' : '#00ffff',
                  border: '1px solid #00ffff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                title="Vista compatta"
              >
                📝
              </button>
              <button
                onClick={() => setInfoPanelMode('expanded')}
                style={{
                  background: infoPanelMode === 'expanded' ? '#00ffff' : 'rgba(0,255,255,0.2)',
                  color: infoPanelMode === 'expanded' ? '#000' : '#00ffff',
                  border: '1px solid #00ffff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                title="Vista espansa"
              >
                📖
              </button>
              <button
                onClick={() => setInfoPanelMode('hidden')}
                style={{
                  background: 'rgba(255,0,255,0.2)',
                  color: '#ff00ff',
                  border: '1px solid #ff00ff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                title="Nascondi info"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Compact Mode - Solo essenziali */}
          {infoPanelMode === 'compact' && (
            <div>
              <p style={{ margin: '4px 0', color: '#ffffff', fontSize: '14px' }}>
                <strong style={{ color: '#00ffff' }}>Formula:</strong> <span dangerouslySetInnerHTML={{ __html: compound.formula }} />
              </p>
              <p style={{ margin: '4px 0', color: '#ffffff', fontSize: '14px' }}>
                <strong style={{ color: '#ff00ff' }}>Peso:</strong> {compound.molWeight} g/mol
              </p>
              {compound.bondAngle && (
                <p style={{ margin: '4px 0', color: '#ffffff', fontSize: '14px' }}>
                  <strong style={{ color: '#00ff88' }}>Angolo:</strong> {compound.bondAngle}°
                </p>
              )}
              <p style={{
                fontSize: '12px',
                marginTop: '8px',
                color: '#00ffff',
                fontStyle: 'italic'
              }}>
                💡 {compound.funFact.substring(0, 80)}...
              </p>
            </div>
          )}

          {/* Expanded Mode - Tutti i dettagli */}
          {infoPanelMode === 'expanded' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Colonna 1: Dati chimici */}
                <div>
                  <p style={{ margin: '6px 0', color: '#ffffff' }}>
                    <strong style={{ color: '#00ffff' }}>Formula:</strong> <span dangerouslySetInnerHTML={{ __html: compound.formula }} />
                  </p>
                  <p style={{ margin: '6px 0', color: '#ffffff' }}>
                    <strong style={{ color: '#ff00ff' }}>Peso molecolare:</strong> {compound.molWeight} g/mol
                  </p>
                  {compound.bondAngle && (
                    <p style={{ margin: '6px 0', color: '#ffffff' }}>
                      <strong style={{ color: '#00ff88' }}>Angolo legame:</strong> {compound.bondAngle}°
                    </p>
                  )}
                  {compound.bondLength && (
                    <p style={{ margin: '6px 0', color: '#ffffff' }}>
                      <strong style={{ color: '#ffff00' }}>Lunghezza legame:</strong> {compound.bondLength} Å
                    </p>
                  )}
                  {compound.category && (
                    <p style={{ margin: '6px 0', color: '#ffffff' }}>
                      <strong style={{ color: '#ff1493' }}>Categoria:</strong> {compound.category === 'organic' ? '🧪 Organica' : '⚗️ Inorganica'}
                    </p>
                  )}
                </div>

                {/* Colonna 2: Proprietà fisiche */}
                <div>
                  {compound.boilingPoint !== undefined && (
                    <p style={{ margin: '6px 0', color: '#ffffff' }}>
                      <strong style={{ color: '#ff6347' }}>Punto ebollizione:</strong> {compound.boilingPoint}°C
                    </p>
                  )}
                  {compound.meltingPoint !== undefined && (
                    <p style={{ margin: '6px 0', color: '#ffffff' }}>
                      <strong style={{ color: '#00bfff' }}>Punto fusione:</strong> {compound.meltingPoint}°C
                    </p>
                  )}
                  {compound.solubility && (
                    <p style={{ margin: '6px 0', color: '#ffffff' }}>
                      <strong style={{ color: '#7fff00' }}>Solubilità:</strong> {compound.solubility}
                    </p>
                  )}
                  {compound.uses && (
                    <p style={{ margin: '6px 0', color: '#ffffff', fontSize: '13px' }}>
                      <strong style={{ color: '#ffa500' }}>Usi:</strong> {compound.uses}
                    </p>
                  )}
                </div>
              </div>

              {/* Fun fact - full width */}
              <p style={{
                fontSize: '13px',
                marginTop: '14px',
                color: '#00ffff',
                lineHeight: '1.6',
                textShadow: '0 0 10px rgba(0,255,255,0.5)',
                borderTop: '1px solid rgba(0,255,255,0.3)',
                paddingTop: '12px'
              }}>
                💡 <strong>Curiosità:</strong> {compound.funFact}
              </p>
            </>
          )}
        </div>
      )}

      {/* Pulsante floating per riaprire info se nascosto */}
      {infoPanelMode === 'hidden' && (
        <button
          onClick={() => setInfoPanelMode('compact')}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0,255,255,0.2)',
            color: '#00ffff',
            border: '2px solid #00ffff',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: '0 0 20px rgba(0,255,255,0.5)',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.4)'
            e.target.style.boxShadow = '0 0 30px rgba(0,255,255,0.8)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.2)'
            e.target.style.boxShadow = '0 0 20px rgba(0,255,255,0.5)'
          }}
          title="Mostra info"
        >
          ℹ️
        </button>
      )}

      {/* Pulsante Caccia al Tesoro - top left */}
      {compound.treasureHunt && (
        <button
          onClick={() => setShowTreasureHunt(!showTreasureHunt)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: showTreasureHunt ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.85)',
            color: '#ff00ff',
            border: '3px solid #ff00ff',
            borderRadius: '12px',
            padding: '12px 20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 0 30px rgba(255,0,255,1), 0 0 50px rgba(255,0,255,0.8)',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textShadow: '0 0 20px rgba(255,0,255,1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,0,0,0.95)'
            e.target.style.boxShadow = '0 0 50px rgba(255,0,255,1), 0 0 80px rgba(255,0,255,1)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = showTreasureHunt ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.85)'
            e.target.style.boxShadow = '0 0 30px rgba(255,0,255,1), 0 0 50px rgba(255,0,255,0.8)'
            e.target.style.transform = 'scale(1)'
          }}
          title="Apri Caccia al Tesoro Alchemica"
        >
          <span style={{ fontSize: '20px' }}>🔮</span>
          <span>{showTreasureHunt ? 'Chiudi' : 'Caccia al Tesoro'}</span>
        </button>
      )}

      {/* Treasure Hunt Panel - sidebar laterale destra */}
      {showTreasureHunt && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          bottom: '20px',
          width: '450px',
          zIndex: 1000,
          overflowY: 'auto',
          backdropFilter: 'blur(20px)',
          boxShadow: '-5px 0 30px rgba(255, 0, 255, 0.5)'
        }}>
          <TreasureHuntPanel
            compound={compound}
            onNavigateToMolecule={onNavigateToMolecule}
          />
        </div>
      )}

      <style>{`
        @keyframes panel-glow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(0,255,255,0.5), inset 0 0 20px rgba(0,255,255,0.1);
          }
          50% {
            box-shadow: 0 0 50px rgba(0,255,255,0.7), inset 0 0 30px rgba(0,255,255,0.2);
          }
        }
      `}</style>
    </div>
  )
}
