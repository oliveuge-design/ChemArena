import { useEffect, useRef } from 'react';

const AnimatedEuropiumAtom = ({ size = 400 }) => {
  const atomRef = useRef(null);

  // Configurazione con nucleo di qualità + animazione precedente
  const atomConfig = {
    nucleus: {
      radius: 20, // Nucleo prominente mantenuto
      protons: 16, // Protoni visibili
      neutrons: 20, // Neutroni visibili
      colors: {
        proton: {
          base: '#FF4500',
          highlight: '#FF6B35',
          shadow: '#CC3300'
        },
        neutron: {
          base: '#E8E8E8',
          highlight: '#FFFFFF',
          shadow: '#CCCCCC'
        }
      }
    },
    electrons: {
      count: [2, 8, 18, 25], // Semplificato come prima
      colors: ['#00FFFF', '#8A2BE2', '#00FF7F', '#FF69B4'], // Colori semplificati
      speeds: [3, 2.5, 2, 1.5] // Velocità più semplici
    },
    orbits: [60, 90, 130, 170] // Orbite semplificate
  };

  return (
    <div className="premium-atom" style={{ width: size + 'px', height: size + 'px' }}>
      <div className="atom-core-premium" ref={atomRef}>

        {/* Nucleo con protoni e neutroni texturizzati */}
        <div className="nucleus-premium">
          {/* Bagliore nucleare ambientale */}
          <div className="nucleus-ambient-glow"></div>

          {/* Protoni con texture realistica */}
          {Array.from({length: atomConfig.nucleus.protons}, (_, i) => {
            const angle = (i / atomConfig.nucleus.protons) * 360;
            const radius = 4 + (i % 3) * 3;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;
            const z = (Math.sin(i * 0.5) * 2);

            return (
              <div
                key={`proton-${i}`}
                className="proton-premium"
                style={{
                  '--x': x + 'px',
                  '--y': y + 'px',
                  '--z': z + 'px',
                  '--delay': (i * 0.15) + 's',
                  '--angle': angle + 'deg'
                }}
              >
                <div className="proton-core"></div>
                <div className="proton-highlight"></div>
              </div>
            );
          })}

          {/* Neutroni con texture realistica */}
          {Array.from({length: atomConfig.nucleus.neutrons}, (_, i) => {
            const angle = (i / atomConfig.nucleus.neutrons) * 360 + 18;
            const radius = 3 + (i % 4) * 2.5;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;
            const z = (Math.cos(i * 0.7) * 2);

            return (
              <div
                key={`neutron-${i}`}
                className="neutron-premium"
                style={{
                  '--x': x + 'px',
                  '--y': y + 'px',
                  '--z': z + 'px',
                  '--delay': (i * 0.12) + 's',
                  '--angle': angle + 'deg'
                }}
              >
                <div className="neutron-core"></div>
                <div className="neutron-highlight"></div>
              </div>
            );
          })}
        </div>

        {/* Sistema elettroni semplificato con animazione precedente */}
        {atomConfig.orbits.map((radius, index) => {
          const electronCount = atomConfig.electrons.count[index];
          const color = atomConfig.electrons.colors[index];
          const speed = atomConfig.electrons.speeds[index];

          return (
            <div key={index} className="orbit-layer" style={{
              '--radius': radius + 'px',
              '--speed': speed + 's'
            }}>
              {Array.from({ length: electronCount }, (_, i) => (
                <div
                  key={i}
                  className="electron-orbit"
                  style={{
                    '--start-angle': (i * 360 / electronCount) + 'deg',
                    '--color': color,
                    animationDelay: (i * 0.2) + 's',
                    transform: `rotate(${i * 360 / electronCount}deg)`
                  }}
                >
                  <div className="electron-simple"></div>
                </div>
              ))}
            </div>
          );
        })}

      </div>


      <style jsx>{`
        .premium-atom {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1500px;
          overflow: hidden;
        }


        .atom-core-premium {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform: rotateX(25deg) rotateY(0deg);
        }

        /* === NUCLEO TEXTURIZZATO === */
        .nucleus-premium {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50px;
          height: 50px;
          transform: translate3d(-50%, -50%, 0);
          border-radius: 50%;
        }

        .nucleus-ambient-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 70px;
          height: 70px;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(255, 69, 0, 0.4) 0%,
            rgba(255, 69, 0, 0.2) 40%,
            rgba(255, 165, 0, 0.1) 70%,
            transparent 100%
          );
          border-radius: 50%;
          animation: nucleusAmbientPulse 4s ease-in-out infinite;
        }

        /* === PROTONI TEXTURIZZATI === */
        .proton-premium {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          transform: translate3d(
            calc(-50% + var(--x)),
            calc(-50% + var(--y)),
            var(--z)
          );
          animation: nucleonOrbitPremium 10s linear infinite;
          animation-delay: var(--delay);
        }

        .proton-core {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at 30% 30%,
            ${atomConfig.nucleus.colors.proton.highlight} 0%,
            ${atomConfig.nucleus.colors.proton.base} 50%,
            ${atomConfig.nucleus.colors.proton.shadow} 100%
          );
          border-radius: 50%;
          box-shadow:
            0 0 8px ${atomConfig.nucleus.colors.proton.base}CC,
            inset 1px 1px 2px rgba(255, 255, 255, 0.3),
            inset -1px -1px 2px rgba(0, 0, 0, 0.3);
        }

        .proton-highlight {
          position: absolute;
          top: 1px;
          left: 1px;
          width: 2px;
          height: 2px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
          border-radius: 50%;
        }

        /* === NEUTRONI TEXTURIZZATI === */
        .neutron-premium {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4.5px;
          height: 4.5px;
          transform: translate3d(
            calc(-50% + var(--x)),
            calc(-50% + var(--y)),
            var(--z)
          );
          animation: nucleonOrbitPremium 12s linear infinite reverse;
          animation-delay: var(--delay);
        }

        .neutron-core {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at 30% 30%,
            ${atomConfig.nucleus.colors.neutron.highlight} 0%,
            ${atomConfig.nucleus.colors.neutron.base} 50%,
            ${atomConfig.nucleus.colors.neutron.shadow} 100%
          );
          border-radius: 50%;
          box-shadow:
            0 0 6px ${atomConfig.nucleus.colors.neutron.base}AA,
            inset 1px 1px 2px rgba(255, 255, 255, 0.4),
            inset -1px -1px 2px rgba(0, 0, 0, 0.2);
        }

        .neutron-highlight {
          position: absolute;
          top: 1px;
          left: 1px;
          width: 2px;
          height: 2px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent);
          border-radius: 50%;
        }

        @keyframes nucleusAmbientPulse {
          0%, 100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes nucleonOrbitPremium {
          0% {
            transform: translate3d(
              calc(-50% + var(--x)),
              calc(-50% + var(--y)),
              var(--z)
            ) rotate(0deg);
          }
          100% {
            transform: translate3d(
              calc(-50% + var(--x)),
              calc(-50% + var(--y)),
              var(--z)
            ) rotate(360deg);
          }
        }

        /* === SISTEMA ELETTRONI SEMPLIFICATO === */
        .orbit-layer {
          position: absolute;
          top: 50%;
          left: 50%;
          width: calc(var(--radius) * 2);
          height: calc(var(--radius) * 2);
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .electron-orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform-origin: center;
          animation: electronOrbit linear infinite;
          animation-duration: var(--speed);
        }

        .electron-simple {
          position: absolute;
          top: -3px;
          left: 50%;
          width: 6px;
          height: 6px;
          background: var(--color);
          border-radius: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 10px var(--color);
          animation: electronGlow 1.5s ease-in-out infinite alternate;
        }

        @keyframes electronGlow {
          0% {
            box-shadow: 0 0 10px var(--color);
            opacity: 0.8;
          }
          100% {
            box-shadow: 0 0 20px var(--color), 0 0 30px var(--color);
            opacity: 1;
          }
        }

        @keyframes electronOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }



        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .nucleus-premium {
            width: 40px;
            height: 40px;
          }

          .electron-premium {
            width: 4px;
            height: 4px;
          }

          .trail-segment-premium {
            width: 2px;
            height: 2px;
          }

          .symbol-premium {
            font-size: 32px;
          }

          .electromagnetic-field-premium {
            width: 500px;
            height: 500px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedEuropiumAtom;