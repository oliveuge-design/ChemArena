import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// 🔬 TRONSCIENTIFIC CYBERPUNK THEME
const tronColors = [
  "from-cyan-400 via-blue-500 to-purple-600", // 1° posto - Cyan elettrico
  "from-green-400 via-emerald-500 to-teal-600", // 2° posto - Verde matrix
  "from-orange-400 via-red-500 to-pink-600" // 3° posto - Arancione cyber
];

const tronBorders = [
  "border-cyan-300 shadow-cyan-400/50", // 1° posto
  "border-green-300 shadow-green-400/50", // 2° posto
  "border-orange-300 shadow-orange-400/50" // 3° posto
];

const tronGlow = [
  "shadow-cyan-400/80", // 1° posto
  "shadow-green-400/60", // 2° posto
  "shadow-orange-400/60" // 3° posto
];

const scientificIcons = ["🧬", "⚛️", "🔬"]; // DNA, Atomo, Microscopio

export default function AnimatedLeaderboard({ players }) {
  // players: [{ name, score }, ...] già ordinati per punteggio decrescente
  const [displayedScores, setDisplayedScores] = useState(players?.map(p => 0) || []);

  useEffect(() => {
    if (!players || players.length === 0) return;

    // Effetto count-up animato sui punti con stile digitale
    const intervals = players.map((player, i) => {
      let current = 0;
      return setInterval(() => {
        setDisplayedScores(scores =>
          scores.map((s, idx) => idx === i && s < player.score ? s + Math.ceil(player.score / 25) : s)
        );
      }, 15); // Più veloce per effetto cyber
    });

    // Stop quando raggiunto
    const stop = setTimeout(() => setDisplayedScores(players.map(p => p.score)), 600);
    return () => {
      intervals.forEach(clearInterval);
      clearTimeout(stop);
    };
  }, [players]);

  if (!players || players.length === 0) return null;

  return (
    <div className="flex justify-center items-end gap-6 mt-8 px-4">
      {players.slice(0, 3).map((player, i) => (
        <motion.div
          key={player.name || `player-${i}`}
          initial={{ y: 150, opacity: 0, scale: 0.6, rotateX: 90 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: i === 0 ? 1.2 : 1,
            rotateX: 0
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 12,
            delay: i * 0.3
          }}
          className="flex flex-col items-center relative"
        >
          {/* 🔥 CYBER PODIUM BASE */}
          <motion.div
            className={`
              relative w-20 h-20 md:w-28 md:h-28 mb-3
              bg-gradient-to-br ${tronColors[i]}
              rounded-lg border-2 ${tronBorders[i]}
              shadow-2xl ${tronGlow[i]}
              backdrop-blur-sm
              ${i === 0 ? 'animate-pulse' : ''}
            `}
            animate={i === 0 ? {
              boxShadow: [
                "0 0 20px 5px rgba(34, 211, 238, 0.4)",
                "0 0 40px 10px rgba(34, 211, 238, 0.8)",
                "0 0 20px 5px rgba(34, 211, 238, 0.4)"
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* ⚡ INNER GLOW EFFECT */}
            <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-md" />

            {/* 🧬 SCIENTIFIC ICON */}
            <span className="text-3xl md:text-5xl flex items-center justify-center h-full filter drop-shadow-lg">
              {scientificIcons[i]}
            </span>

            {/* 💫 PARTICLE EFFECTS */}
            {i === 0 && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                />
              </>
            )}
          </motion.div>

          {/* 🏷️ PLAYER NAME - CYBER STYLE */}
          <motion.span
            className={`
              font-mono font-bold text-sm md:text-lg mb-2 px-3 py-1 rounded-md
              ${i === 0 ? 'text-cyan-300 bg-cyan-900/30 border border-cyan-500/30' :
                i === 1 ? 'text-green-300 bg-green-900/30 border border-green-500/30' :
                'text-orange-300 bg-orange-900/30 border border-orange-500/30'}
              backdrop-blur-sm shadow-lg
              max-w-[120px] truncate
            `}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.3 + 0.5 }}
          >
            {player.username || player.name || `Player ${i + 1}`}
          </motion.span>

          {/* 💯 ANIMATED SCORE - DIGITAL DISPLAY */}
          <motion.div
            className={`
              relative font-mono text-xl md:text-3xl font-bold px-4 py-2 rounded-lg
              ${i === 0 ? 'text-cyan-100 bg-cyan-900/40 border border-cyan-400/50' :
                i === 1 ? 'text-green-100 bg-green-900/40 border border-green-400/50' :
                'text-orange-100 bg-orange-900/40 border border-orange-400/50'}
              backdrop-blur-sm shadow-xl
              ${i === 0 ? 'animate-pulse' : ''}
            `}
            animate={{
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          >
            {/* 🔢 GLITCH EFFECT FOR SCORE */}
            <motion.span
              animate={{
                textShadow: [
                  "0 0 5px currentColor",
                  "0 0 10px currentColor",
                  "0 0 5px currentColor"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {displayedScores[i] || 0}
            </motion.span>

            {/* ⚡ SCORE SPARKS */}
            {i === 0 && (
              <motion.div
                className="absolute -top-2 -right-2 text-cyan-400 text-xs"
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ⚡
              </motion.div>
            )}
          </motion.div>

          {/* 🏆 RANK INDICATOR - TRON STYLE */}
          <motion.span
            className={`
              uppercase text-xs md:text-sm font-bold mt-2 px-2 py-1 rounded-full
              ${i === 0 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-cyan-100' :
                i === 1 ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-green-100' :
                'bg-gradient-to-r from-orange-600 to-red-600 text-orange-100'}
              shadow-lg border border-white/20
            `}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.3 + 0.8 }}
          >
            {["#1", "#2", "#3"][i]}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}
