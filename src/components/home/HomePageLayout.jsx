import PWAInstallButton from '@/components/PWAInstallButton'
import styles from '@/styles/homepage.module.css'

export default function HomePageLayout({ children, onAdminClick }) {
  return (
    <div className={`relative min-h-screen ${styles.cyberpunkLabContainer}`}>
      {/* Sfondo Laboratorio Cyberpunk */}
      <div className={styles.labBackground}></div>

      {/* Overlay effetti */}
      <div className={styles.labOverlay}></div>

      {/* Particelle animate */}
      <div className={styles.particlesContainer}>
        <div className={`${styles.particle} ${styles.particle1}`}></div>
        <div className={`${styles.particle} ${styles.particle2}`}></div>
        <div className={`${styles.particle} ${styles.particle3}`}></div>
        <div className={`${styles.particle} ${styles.particle4}`}></div>
        <div className={`${styles.particle} ${styles.particle5}`}></div>
      </div>

      {/* Circuiti animati */}
      <div className={styles.circuitLines}>
        <div className={`${styles.circuitLine} ${styles.circuitTop}`}></div>
        <div className={`${styles.circuitLine} ${styles.circuitBottom}`}></div>
        <div className={`${styles.circuitLine} ${styles.circuitLeft}`}></div>
        <div className={`${styles.circuitLine} ${styles.circuitRight}`}></div>
      </div>

      <div className="min-h-screen flex flex-col relative z-10">
        {/* Header con Logo ChemArena Grande */}
        <header className="text-center py-12 z-20 relative">
          <div className={styles.chemarenaLogoContainer}>
            <h1 className={styles.chemarenaTitle}>
              <span className={styles.chemPart}>CHEM</span>
              <span className={styles.arenaPart}>ARENA</span>
            </h1>
            <div className={styles.logoCircuitFrame}>
              <div className={`${styles.circuitCorner} ${styles.circuitTl}`}></div>
              <div className={`${styles.circuitCorner} ${styles.circuitTr}`}></div>
              <div className={`${styles.circuitCorner} ${styles.circuitBl}`}></div>
              <div className={`${styles.circuitCorner} ${styles.circuitBr}`}></div>
            </div>
            <p className={styles.labSubtitle}>// LABORATORIO DIGITALE CHIMICO //</p>
          </div>

          {/* Pulsante Admin in basso a sinistra */}
          <button onClick={onAdminClick} className={styles.adminButton}>
            <span className={styles.adminIcon}>⚙️</span>
            <span>ADMIN</span>
          </button>

          {/* PWA Install Button in alto a destra */}
          <div className="absolute top-4 right-4 z-30">
            <PWAInstallButton />
          </div>
        </header>

        {/* Contenuto principale */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center p-6 text-cyan-400 opacity-60">
          <p className="text-sm">
            ChemArena © 2025 - Piattaforma di Quiz Chimici Interattivi
          </p>
        </footer>
      </div>
    </div>
  )
}
