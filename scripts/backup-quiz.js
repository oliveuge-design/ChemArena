#!/usr/bin/env node

/**
 * 🔄 SCRIPT BACKUP AUTOMATICO QUIZ CHEMARENA
 *
 * Questo script previene la perdita dei quiz durante i deploy:
 * 1. Scarica l'archivio quiz attuale da Render
 * 2. Lo salva come backup locale
 * 3. Può ripristinarlo dopo il deploy
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const RENDER_URL = 'https://chemarena.onrender.com/api/quiz-archive';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DATA_DIR = path.join(__dirname, '..', 'data');
const ARCHIVE_FILE = path.join(DATA_DIR, 'quiz-archive.json');

// Assicura che la directory backup esista
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Funzione per scaricare dati da URL
function downloadData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`Errore parsing JSON: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Errore download: ${error.message}`));
        });
    });
}

// Backup dell'archivio quiz da Render
async function backupFromRender() {
    try {
        console.log('🔄 Scaricando archivio quiz da Render...');

        const quizData = await downloadData(RENDER_URL);

        if (!quizData.quizzes || !Array.isArray(quizData.quizzes)) {
            throw new Error('Formato archivio quiz non valido');
        }

        // Salva backup con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(BACKUP_DIR, `quiz-backup-${timestamp}.json`);

        fs.writeFileSync(backupFile, JSON.stringify(quizData, null, 2));

        // Salva anche come backup "latest"
        const latestBackup = path.join(BACKUP_DIR, 'quiz-backup-latest.json');
        fs.writeFileSync(latestBackup, JSON.stringify(quizData, null, 2));

        console.log(`✅ Backup salvato: ${quizData.quizzes.length} quiz trovati`);
        console.log(`📁 File: ${backupFile}`);
        console.log(`📁 Latest: ${latestBackup}`);

        return quizData;

    } catch (error) {
        console.error('❌ Errore durante il backup:', error.message);
        throw error;
    }
}

// Ripristina archivio da backup
function restoreFromBackup() {
    try {
        const latestBackup = path.join(BACKUP_DIR, 'quiz-backup-latest.json');

        if (!fs.existsSync(latestBackup)) {
            throw new Error('Nessun backup trovato da ripristinare');
        }

        console.log('🔄 Ripristinando archivio quiz da backup...');

        const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));

        // Assicura che la directory data esista
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        // Ripristina l'archivio
        fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(backupData, null, 2));

        console.log(`✅ Archivio ripristinato: ${backupData.quizzes.length} quiz`);
        console.log(`📁 File: ${ARCHIVE_FILE}`);

        return backupData;

    } catch (error) {
        console.error('❌ Errore durante il ripristino:', error.message);
        throw error;
    }
}

// Combina archivio locale con backup (merge intelligente)
async function mergeArchives() {
    try {
        console.log('🔄 Eseguendo merge intelligente degli archivi...');

        // Scarica archivio da Render
        const renderData = await downloadData(RENDER_URL);

        // Leggi archivio locale se esiste
        let localData = { quizzes: [], metadata: { version: "1.0", totalQuizzes: 0, totalQuestions: 0, lastUpdate: new Date().toISOString() } };

        if (fs.existsSync(ARCHIVE_FILE)) {
            localData = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
        }

        // Merge: prende i quiz da Render + quelli locali non presenti online
        const renderQuizIds = renderData.quizzes.map(q => q.id);
        const localOnlyQuizzes = localData.quizzes.filter(q => !renderQuizIds.includes(q.id));

        const mergedQuizzes = [...renderData.quizzes, ...localOnlyQuizzes];

        const mergedData = {
            ...renderData,
            quizzes: mergedQuizzes,
            metadata: {
                ...renderData.metadata,
                totalQuizzes: mergedQuizzes.length,
                totalQuestions: mergedQuizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0),
                lastUpdate: new Date().toISOString(),
                mergeInfo: {
                    renderQuizzes: renderData.quizzes.length,
                    localOnlyQuizzes: localOnlyQuizzes.length,
                    totalMerged: mergedQuizzes.length
                }
            }
        };

        // Salva backup del merge
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const mergeBackup = path.join(BACKUP_DIR, `quiz-merge-${timestamp}.json`);
        fs.writeFileSync(mergeBackup, JSON.stringify(mergedData, null, 2));

        // Aggiorna archivio locale
        fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(mergedData, null, 2));

        console.log(`✅ Merge completato:`);
        console.log(`   📊 Quiz da Render: ${renderData.quizzes.length}`);
        console.log(`   📊 Quiz solo locali: ${localOnlyQuizzes.length}`);
        console.log(`   📊 Totale merged: ${mergedQuizzes.length}`);
        console.log(`   📁 Backup: ${mergeBackup}`);

        return mergedData;

    } catch (error) {
        console.error('❌ Errore durante il merge:', error.message);
        throw error;
    }
}

// Comando principale
async function main() {
    const command = process.argv[2] || 'backup';

    try {
        switch (command) {
            case 'backup':
                await backupFromRender();
                break;

            case 'restore':
                restoreFromBackup();
                break;

            case 'merge':
                await mergeArchives();
                break;

            default:
                console.log('📚 Uso: node backup-quiz.js [comando]');
                console.log('   backup  - Scarica e salva archivio da Render');
                console.log('   restore - Ripristina da backup locale');
                console.log('   merge   - Merge intelligente Render + locale');
                break;
        }
    } catch (error) {
        console.error('💥 Operazione fallita:', error.message);
        process.exit(1);
    }
}

// Esegui se chiamato direttamente
if (require.main === module) {
    main();
}

module.exports = { backupFromRender, restoreFromBackup, mergeArchives };