# 🤖 Copilot Instructions for ChemArena

## Overview
ChemArena è una piattaforma Next.js/Node.js per quiz interattivi di chimica, con generazione AI, analytics e gestione real-time tramite Socket.io. Il progetto è strutturato per ambienti enterprise-ready, con focus su modularità, performance e sicurezza dei dati quiz.

## Architettura e Componenti Chiave
- **Frontend**: Next.js 14, React 18, TailwindCSS. Dashboard, pagine studenti, manager e componenti modulari in `src/components/`.
- **Backend**: Node.js + Socket.io (`socket/`). Gestione multi-room, ruoli (manager/player), engine quiz (`QuizModeEngine.js`), round e limiti.
- **Quiz e Dati**: Quiz in JSON in `data/quiz-archive.json` (e backup). Utility in `src/utils/quizArchive.js`.
- **AI Integration**: API REST in `src/pages/api/ai-quiz/` per generazione domande via OpenAI. Prompt e fallback automatico tra modelli.
- **State Management**: Context API centralizzato (`DashboardContext.jsx`).
- **Analytics**: Real-time monitoring e esportazione dati.

## Flussi di Lavoro e Comandi
- **Avvio locale**: `npm run all-dev` (tutto), `npm run dev` (solo web), `npm run socket` (solo socket)
- **Build**: `npm run build` (Next.js)
- **Test**: Validazione manuale, socket su porta 5505, web su 3000
- **Debug**: Logger custom in `src/utils/logger.js`, error boundaries attivi
- **Quiz AI**: POST a `/api/ai-quiz/generate-questions` con payload e API Key OpenAI

## Convenzioni e Regole Critiche
- **Non modificare**: `QuizModeEngine.js`, login flow (`src/pages/game.jsx`, `socket/roles/player.js`), round.js, GameLauncherSliderFixed
- **Protezione quiz**: I file quiz e backup sono critici e vanno sempre committati
- **Componenti**: Usare `<div>` invece di `<p>` per slider launcher
- **Service Worker**: PWA disabilitato in debug, riattivare solo se richiesto
- **Errori**: Usare logger, evitare `console.log` in produzione

## Pattern e Suggerimenti
- **Modularità**: Ogni modalità quiz è un modulo separato, engine backend centralizzato
- **Fallback AI**: Se un modello OpenAI fallisce, fallback automatico su altri modelli
- **Performance**: Lazy loading, memoizzazione, compressione Next.js
- **Sicurezza**: Variabili sensibili in `.env.local` (mai committare)
- **Backup**: I backup quiz sono fondamentali, non ignorarli mai

## File e Directory Chiave
- `PROMEMORIA_UNIFIED.md`: guida completa, regole e architettura
- `src/pages/api/ai-quiz/generate-questions.js`: endpoint AI principale
- `socket/`: logica real-time e ruoli
- `data/quiz-archive.json`: quiz attivi
- `backups/`, `data/backups/`: backup quiz

---
Per dettagli, consultare sempre `PROMEMORIA_UNIFIED.md` e i commenti nei file principali.