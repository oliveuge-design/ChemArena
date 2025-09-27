# 🛡️ SISTEMA PROTEZIONE QUIZ - ANTI-PERDITA DEFINITIVO

## ⚠️ REGOLE CRITICHE - NON IGNORARE MAI

### 🚨 DEPLOY SICURO OBBLIGATORIO
```bash
# ✅ CORRETTO - Usa SEMPRE questo comando
npm run deploy:safe

# ❌ MAI FARE QUESTO - Causa perdita quiz
git push
git commit && git push
```

### 🔒 PROTEZIONI ATTIVE

#### **1. Git Hook Pre-Commit**
- **Blocca** automaticamente qualsiasi commit senza backup
- **Scarica** automaticamente quiz da Render prima del commit
- **Aggiunge** backup al commit automaticamente
- **Non può essere disabilitato** accidentalmente

#### **2. Comandi Deploy Protetti**
- `npm run deploy:safe` - Deploy con backup automatico (USA SEMPRE QUESTO)
- `npm run deploy:check` - Verifica backup prima del deploy
- `npm run deploy:force` - Solo per emergenze (richiede backup manuale)

#### **3. Sistema Backup Multiplo**
- **Pre-commit**: Backup automatico ad ogni commit
- **Pre-deploy**: Backup prima di ogni deploy
- **Post-deploy**: Ripristino automatico dopo deploy
- **Storico**: Tutti i backup vengono salvati con timestamp

## 🚀 PROCESSO DEPLOY SICURO

### **1. Prima del Deploy**
```bash
# Il sistema fa tutto automaticamente
npm run deploy:safe
```

### **2. Dopo Deploy Completato**
```bash
# Ripristina tutti i quiz
npm run post-deploy
```

### **3. Verifica (Opzionale)**
```bash
# Controlla che tutto sia a posto
npm run quiz:backup
```

## 🆘 RECOVERY DI EMERGENZA

### **Se Perdi Quiz per Errore**
```bash
# 1. Ripristina dall'ultimo backup
npm run quiz:restore

# 2. Controlla il backup più recente
ls -la backups/

# 3. Ripristina backup specifico
cp backups/quiz-backup-[TIMESTAMP].json data/quiz-archive.json
```

### **Se Hook Git Non Funziona**
```bash
# Reinstalla hook
chmod +x .git/hooks/pre-commit

# Verifica che funzioni
git commit -m "test" # Dovrebbe fare backup automatico
```

## 📊 BACKUP LOCATIONS

### **Backup Automatici**
- `backups/quiz-backup-latest.json` - Ultimo backup
- `backups/quiz-backup-[TIMESTAMP].json` - Backup storici
- `data/quiz-archive.json` - Archivio locale corrente

### **Verifica Backup**
```bash
# Conta quiz nell'ultimo backup
node -e "console.log(JSON.parse(require('fs').readFileSync('backups/quiz-backup-latest.json')).quizzes.length)"

# Lista tutti i backup
ls -la backups/
```

## 🚨 COSA FARE SE...

### **Il Deploy Fallisce**
1. **NON** ripetere git push
2. Verifica backup con `npm run deploy:check`
3. Riprova con `npm run deploy:safe`

### **I Quiz Scompaiono**
1. **STOP** - Non fare altri commit
2. Esegui `npm run quiz:restore`
3. Verifica con localhost:3000/api/quiz-archive
4. Se necessario, ripristina da backup specifico

### **Emergency Override**
```bash
# Solo in caso di emergenza assoluta
npm run deploy:force
# ATTENZIONE: Verifica manualmente che i backup siano aggiornati!
```

## ✅ CONTROLLI AUTOMATICI

Il sistema ora impedisce:
- ❌ Commit senza backup quiz
- ❌ Deploy che perdono dati
- ❌ Sovrascrittura accidentale archivi
- ❌ Git push diretti pericolosi

## 🎯 RISULTATO

**ZERO PERDITE QUIZ GARANTITE** se segui le regole sopra!

---

**🔥 RICORDA: MAI FARE GIT PUSH DIRETTO - USA SEMPRE `npm run deploy:safe`**