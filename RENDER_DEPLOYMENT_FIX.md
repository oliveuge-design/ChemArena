# 🔧 Fix AI Quiz su Render - Guida Completa

## ⚠️ Problemi Identificati e Risolti

### 1. ✅ Filesystem Access (CRITICO)
**Problema**: Render serverless NON permette creazione di subdirectories custom in `/tmp`

**Fix Applicato**:
- `process-documents.js:124` - Rimosso `path.join(os.tmpdir(), 'chemarena-uploads')`
- Ora usa direttamente `os.tmpdir()` per compatibilità Render
- Ridotto limite file da 50MB a 4MB (limite Render API routes)

### 2. ✅ Timeout OpenAI API (CRITICO)
**Problema**: Quiz con 30+ domande timeout su Render (limite 30s per API route)

**Fix Applicato**:
- `generate-questions.js:56-86` - Aggiunto AbortController con timeout 25s
- Gestione esplicita `AbortError` con messaggio chiaro
- Log specifico per timeout Render

### 3. ✅ API Key Security (IMPORTANTE)
**Problema**: API key passata da client (insicuro, esposta nel browser)

**Fix Applicato**:
- `generate-questions.js:10` - Priorità a `process.env.OPENAI_API_KEY` (server-side)
- `process-documents.js:139` - Stesso sistema di priorità
- Fallback a client API key solo se manca variabile ambiente
- Warning log se si usa client-side API key

---

## 🚀 DEPLOY SU RENDER - Passi Obbligatori

### Step 1: Configurare Variabile Ambiente OPENAI_API_KEY

**Su Render Dashboard:**
1. Vai su https://dashboard.render.com
2. Seleziona il servizio ChemArena
3. Vai su **Environment** → **Environment Variables**
4. Aggiungi nuova variabile:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (la tua API key OpenAI)
   - ✅ Salva

**⚠️ CRITICO**: Senza questa variabile, i quiz AI NON funzioneranno!

### Step 2: Verificare Limiti Render

**Free Plan Limits:**
- Max API route timeout: **30 secondi**
- Max payload size: **4.5MB**
- Filesystem: Solo `/tmp` (effimero, cancellato dopo ogni deploy)

**Paid Plan:**
- Max API route timeout: **60 secondi** (ma consiglio comunque 25s timeout OpenAI)

### Step 3: Deploy

```bash
cd ChemArena-LOCAL-DEV
git add .
git commit -m "Fix AI quiz per Render: filesystem, timeout, API key security"
git push origin main
```

Render farà auto-deploy.

---

## 🧪 TESTING POST-DEPLOY

### Test 1: Generazione Quiz da Testo
1. Vai su `/teacher-dashboard`
2. Tab **Gestione Quiz** → **Crea Quiz AI**
3. Inserisci testo breve (100-200 parole)
4. Config: 5 domande, difficoltà facile
5. Clicca **Genera Quiz**
6. **Aspettati**: Quiz generato in 5-10 secondi

### Test 2: Upload File PDF
1. Stesso percorso
2. Upload PDF < 4MB
3. Config: 10 domande, difficoltà media
4. Clicca **Genera Quiz**
5. **Aspettati**: Processing file + quiz generato in 15-20 secondi

### Test 3: Quiz Lungo (30+ domande)
1. Stesso percorso
2. Testo lungo (500+ parole)
3. Config: 35 domande, difficoltà avanzata
4. Clicca **Genera Quiz**
5. **Aspettati**:
   - Se timeout < 25s → Fallback al modello successivo
   - Se tutti i modelli timeout → Messaggio errore chiaro

---

## 📊 Monitoraggio Errori

### Su Render Dashboard:
1. **Logs** → Cerca:
   - `⏱️ Timeout con gpt-` → Timeout OpenAI
   - `❌ Errore con gpt-` → Errore API OpenAI
   - `⚠️ SECURITY: Usando API key client-side` → Manca OPENAI_API_KEY

### Errori Comuni:

**Errore**: `API Key OpenAI non configurata. Contattare l'amministratore...`
- **Causa**: Variabile `OPENAI_API_KEY` non configurata su Render
- **Fix**: Step 1 sopra

**Errore**: `Timeout - gpt-4o-mini ha impiegato più di 25s`
- **Causa**: Quiz troppo lungo (40+ domande) o contenuto troppo complesso
- **Fix**: Ridurre numero domande a max 30

**Errore**: `Payload too large`
- **Causa**: File upload > 4MB
- **Fix**: Ridurre dimensione file o dividere in più file

---

## 🔐 Security Checklist

✅ `OPENAI_API_KEY` configurata su Render (environment variable)
✅ API key NON presente in codice sorgente
✅ API key NON committata in git
✅ Client API key solo fallback (con warning log)
✅ Timeout 25s per evitare costi eccessivi OpenAI
✅ File upload limitato a 4MB

---

## 📝 Note Tecniche

### Modelli OpenAI Usati:
- **5-15 domande**: `gpt-3.5-turbo` (veloce, economico)
- **16-30 domande**: `gpt-3.5-turbo-16k` (context window più grande)
- **31+ domande**: `gpt-4o-mini` (più potente, necessario per quiz lunghi)

### Fallback Automatico:
Se un modello fallisce (timeout/errore), il sistema prova automaticamente il modello successivo. Se tutti falliscono, restituisce un quiz di esempio.

---

**Data Fix**: 2025-10-03
**Status**: ✅ PRONTO PER DEPLOY
**Testing**: ⏳ DA TESTARE SU RENDER
