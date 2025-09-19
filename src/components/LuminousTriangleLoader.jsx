import React from 'react'

const LuminousTriangleLoader = ({ message = "Elaborazione in corso..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="text-center">
        {/* Triangolo Luminoso Animato */}
        <div className="relative mb-8">
          <div className="triangle-loader">
            <div className="triangle-border"></div>
            <div className="triangle-core"></div>
            <div className="triangle-glow"></div>

            {/* Particelle orbitanti */}
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
          </div>
        </div>

        {/* Messaggio con effetto typing */}
        <div className="text-white text-xl font-semibold mb-4 typing-text">
          {message}
        </div>

        {/* Barra di progresso pulsante */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="progress-wave h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
        </div>
      </div>

      <style jsx>{`
        .triangle-loader {
          position: relative;
          width: 120px;
          height: 104px;
          margin: 0 auto;
        }

        .triangle-border {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 60px solid transparent;
          border-right: 60px solid transparent;
          border-bottom: 104px solid #00ffff;
          filter: blur(1px);
          animation: trianglePulse 2s ease-in-out infinite;
        }

        .triangle-core {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 52px solid transparent;
          border-right: 52px solid transparent;
          border-bottom: 90px solid #0066ff;
          animation: triangleRotate 3s linear infinite;
        }

        .triangle-glow {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 70px solid transparent;
          border-right: 70px solid transparent;
          border-bottom: 121px solid rgba(0, 255, 255, 0.3);
          filter: blur(8px);
          animation: triangleGlow 1.5s ease-in-out infinite alternate;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #00ffff, #0066ff);
          border-radius: 50%;
          box-shadow: 0 0 10px #00ffff;
        }

        .particle-1 {
          top: 20px;
          left: 20px;
          animation: orbit1 4s linear infinite;
        }

        .particle-2 {
          top: 20px;
          right: 20px;
          animation: orbit2 3s linear infinite reverse;
        }

        .particle-3 {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          animation: orbit3 2.5s linear infinite;
        }

        .typing-text {
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #00ffff;
          animation: typing 3s steps(30) infinite, blink 1s infinite;
        }

        .progress-wave {
          animation: progressWave 2s ease-in-out infinite;
          background-size: 200% 100%;
        }

        @keyframes trianglePulse {
          0%, 100% {
            border-bottom-color: #00ffff;
            transform: translateX(-50%) scale(1);
          }
          50% {
            border-bottom-color: #ff00ff;
            transform: translateX(-50%) scale(1.1);
          }
        }

        @keyframes triangleRotate {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }

        @keyframes triangleGlow {
          0% {
            filter: blur(8px);
            border-bottom-color: rgba(0, 255, 255, 0.3);
          }
          100% {
            filter: blur(12px);
            border-bottom-color: rgba(255, 0, 255, 0.5);
          }
        }

        @keyframes orbit1 {
          0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }

        @keyframes orbit2 {
          0% { transform: rotate(0deg) translateX(45px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
        }

        @keyframes orbit3 {
          0% { transform: translateX(-50%) rotate(0deg) translateY(-40px) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg) translateY(-40px) rotate(-360deg); }
        }

        @keyframes typing {
          0%, 50% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes blink {
          0%, 50% { border-color: #00ffff; }
          51%, 100% { border-color: transparent; }
        }

        @keyframes progressWave {
          0% {
            background-position: -200% 0;
            background-image: linear-gradient(90deg, #00ffff, #0066ff, #ff00ff);
          }
          50% {
            background-position: 0% 0;
            background-image: linear-gradient(90deg, #ff00ff, #00ffff, #0066ff);
          }
          100% {
            background-position: 200% 0;
            background-image: linear-gradient(90deg, #0066ff, #ff00ff, #00ffff);
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .triangle-loader {
            width: 80px;
            height: 69px;
          }

          .triangle-border {
            border-left-width: 40px;
            border-right-width: 40px;
            border-bottom-width: 69px;
          }

          .triangle-core {
            top: 5px;
            border-left-width: 35px;
            border-right-width: 35px;
            border-bottom-width: 60px;
          }

          .triangle-glow {
            top: -7px;
            border-left-width: 47px;
            border-right-width: 47px;
            border-bottom-width: 81px;
          }

          .typing-text {
            font-size: 1rem;
          }

          .progress-wave {
            width: 200px;
          }
        }

        /* Accessibilità - Riduce animazioni per utenti sensibili */
        @media (prefers-reduced-motion: reduce) {
          .triangle-border,
          .triangle-core,
          .triangle-glow,
          .particle,
          .typing-text,
          .progress-wave {
            animation: none;
          }

          .triangle-border {
            border-bottom-color: #00ffff;
          }

          .triangle-glow {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}

export default LuminousTriangleLoader