import clsx from "clsx"

/**
 * 📱 Componente ottimizzato per smartphone
 * Mostra solo l'icona colorata senza testo per massima praticità mobile
 */
export default function MobileAnswerButton({
  className,
  icon: Icon,
  totalAnswers = 4,
  children, // Testo (nascosto su mobile, visibile in tooltip)
  ...otherProps
}) {
  // Dimensioni adattive basate sul numero di opzioni (mobile-first)
  const getSizeClasses = () => {
    if (totalAnswers <= 4) {
      return "w-20 h-20 md:w-24 md:h-24"; // Grandi per 4 opzioni o meno
    } else if (totalAnswers <= 6) {
      return "w-16 h-16 md:w-20 md:h-20"; // Medie per 5-6 opzioni
    } else {
      return "w-14 h-14 md:w-16 md:h-16"; // Piccole per 7-8 opzioni
    }
  };

  const getIconSize = () => {
    if (totalAnswers <= 4) {
      return "h-10 w-10 md:h-12 md:w-12";
    } else if (totalAnswers <= 6) {
      return "h-8 w-8 md:h-10 md:w-10";
    } else {
      return "h-6 w-6 md:h-8 md:w-8";
    }
  };

  return (
    <button
      className={clsx(
        // Base styling - Design circolare per mobile
        "relative overflow-hidden rounded-full flex items-center justify-center",
        "font-bold text-white transform transition-all duration-300",
        "hover:scale-110 active:scale-95 touch-manipulation select-none",
        "-webkit-tap-highlight-color-transparent",

        // Effetti luminosi
        "shadow-lg hover:shadow-2xl",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

        // Dimensioni responsive
        getSizeClasses(),

        // Border glow effetto
        "border-2 border-white/30 hover:border-white/60",

        className,
      )}
      title={children} // Tooltip con il testo completo
      aria-label={children}
      {...otherProps}
    >
      {/* Icona principale */}
      <div className="relative z-10 flex items-center justify-center">
        <Icon className={clsx(
          "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
          getIconSize()
        )} />

        {/* Effetto glow dell'icona */}
        <div className={clsx(
          "absolute inset-0 blur-sm opacity-40",
          getIconSize()
        )}>
          <Icon className={getIconSize()} />
        </div>
      </div>

      {/* Testo nascosto per mobile, visibile solo in tooltip */}
      <span className="sr-only">{children}</span>
    </button>
  )
}