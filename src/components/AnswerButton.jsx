import clsx from "clsx"
import Triangle from "./icons/Triangle"
import SciFiImageLoader from "./SciFiImageLoader"

export default function AnswerButton({
  className,
  icon: Icon,
  children,
  answerImage,
  autoImage = false,
  imageQuery,
  totalAnswers = 4,
  ...otherProps
}) {
  // Dimensioni adattive basate sul numero di opzioni
  const isMany = totalAnswers > 4
  const isManyPlus = totalAnswers > 6

  return (
    <button
      className={clsx(
        "relative overflow-hidden rounded-xl text-left font-bold text-white transform transition-all duration-300 hover:scale-105 active:scale-95",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        // Dimensioni responsive basate sul numero di opzioni
        isMany ? (
          isManyPlus ?
            "px-3 py-3 md:px-4 md:py-4 min-h-[50px] md:min-h-[60px] text-sm md:text-base lg:text-lg" :
            "px-4 py-4 md:px-5 md:py-5 min-h-[55px] md:min-h-[65px] text-base md:text-lg lg:text-xl"
        ) : (
          "px-4 py-6 md:px-6 md:py-8 min-h-[60px] md:min-h-[70px] lg:min-h-[80px] text-lg md:text-xl lg:text-2xl"
        ),
        // Mobile optimizations
        "touch-manipulation select-none",
        "-webkit-tap-highlight-color-transparent",
        className,
      )}
      {...otherProps}
    >
      {/* Particelle di energia */}
      <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
      <div className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-40" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-1/2 right-8 w-1 h-1 bg-white rounded-full animate-pulse opacity-70"></div>

      {/* Bordi luminosi animati */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>

      {/* Contenuto principale */}
      <div className={clsx("relative z-10 flex items-center", isMany ? "gap-2" : "gap-4")}>
        <div className="relative flex-shrink-0">
          <Icon className={clsx(
            "drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]",
            isManyPlus ? "h-5 w-5 md:h-6 md:w-6" :
            isMany ? "h-6 w-6 md:h-7 md:w-7" :
            "h-8 w-8"
          )} />
          <div className={clsx(
            "absolute inset-0 blur-sm opacity-50",
            isManyPlus ? "h-5 w-5 md:h-6 md:w-6" :
            isMany ? "h-6 w-6 md:h-7 md:w-7" :
            "h-8 w-8"
          )}>
            <Icon className={clsx(
              isManyPlus ? "h-5 w-5 md:h-6 md:w-6" :
              isMany ? "h-6 w-6 md:h-7 md:w-7" :
              "h-8 w-8"
            )} />
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2">
          {/* Immagine statica o auto-generata */}
          {(answerImage || autoImage) && !isManyPlus && (
            <div className="relative flex-shrink-0">
              {autoImage && imageQuery ? (
                <SciFiImageLoader
                  query={imageQuery}
                  category="science"
                  className={clsx(
                    "border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                    isMany ? "h-12 w-12" : "h-16 w-16"
                  )}
                  width={isMany ? 48 : 64}
                  height={isMany ? 48 : 64}
                />
              ) : answerImage ? (
                <div className="relative">
                  <img
                    src={answerImage}
                    alt="Risposta"
                    className={clsx(
                      "object-cover rounded-lg border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                      isMany ? "h-12 w-12" : "h-16 w-16"
                    )}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent to-white/20"></div>
                </div>
              ) : null}
            </div>
          )}
          <span className={clsx(
            "font-bold drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] filter brightness-110 leading-tight",
            isManyPlus ? "text-sm md:text-base" :
            isMany ? "text-base md:text-lg" :
            "text-xl"
          )}>
            {children}
          </span>
        </div>
      </div>

      {/* Effetto glow interno */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none"></div>
    </button>
  )
}
