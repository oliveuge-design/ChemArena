# 🔄 Sistema Backup Quiz ChemArena

## 🎯 Problema Risolto
Questo sistema previene la **perdita definitiva dei quiz** durante i deploy su Render, assicurando che quiz caricati solo online non vengano mai persi.

## 🚀 Comandi Disponibili

### **Backup Manuale**
```bash
npm run quiz:backup
```
Scarica l'archivio quiz corrente da Render e lo salva localmente.

### **Ripristino da Backup**
```bash
npm run quiz:restore
```
Ripristina l'archivio locale dall'ultimo backup salvato.

### **Merge Intelligente**
```bash
npm run quiz:merge
```
Combina quiz da Render + quiz locali, mantenendo tutto senza duplicati.

### **Deploy Sicuro (RACCOMANDATO)**
```bash
npm run deploy:safe
```
Esegue automaticamente:
1. Backup da Render
2. Commit e push delle modifiche
3. Istruzioni per post-deploy

## 📋 Flusso Deploy Sicuro

### **Prima del Deploy:**
```bash
npm run deploy:safe
```

### **Dopo che Render completa il deploy:**
```bash
npm run post-deploy
```
Questo comando ripristina tutti i quiz che erano su Render + eventuali nuovi quiz locali.

## 📂 File Generati

- `quiz-backup-[timestamp].json` - Backup con data specifica
- `quiz-backup-latest.json` - Ultimo backup (per ripristino rapido)
- `quiz-merge-[timestamp].json` - Log dei merge eseguiti

## ⚡ Funzionalità Intelligenti

### **Merge Non Distruttivo**
- ✅ Mantiene tutti i quiz da Render
- ✅ Aggiunge quiz locali non presenti online
- ✅ Non crea duplicati
- ✅ Aggiorna metadati automaticamente

### **Backup Timestampati**
- ✅ Storico completo dei backup
- ✅ Possibilità di ripristino specifico
- ✅ Tracciamento modifiche

## 🛡️ Protezione Garantita

**Con questo sistema NON perderai mai più quiz**, anche se:
- ❌ Il deploy sovrascrive i file
- ❌ Qualcuno elimina quiz per errore
- ❌ Si verificano problemi tecnici

## 🎓 Esempio d'Uso

```bash
# Prima di aggiungere nuove funzionalità
npm run quiz:backup

# Lavori sul codice...
# Quando sei pronto per il deploy:
npm run deploy:safe

# Attendi che Render completi il deploy
# Poi ripristini tutto:
npm run post-deploy
```

**🎉 Risultato**: Hai il codice aggiornato + TUTTI i quiz preservati!