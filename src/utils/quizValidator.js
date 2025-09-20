import fs from 'fs';
import path from 'path';

const QUIZ_ARCHIVE_PATH = path.join(process.cwd(), 'data', 'quiz-archive.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 10;

// Schema validation per quiz
const QUIZ_SCHEMA = {
  required: ['id', 'title', 'subject', 'created', 'author', 'questions'],
  optional: ['category', 'subcategory', 'tags', 'difficulty', 'password'],
  types: {
    id: 'string',
    title: 'string',
    subject: 'string',
    created: 'string',
    author: 'string',
    questions: 'array',
    category: 'string',
    subcategory: 'string',
    tags: 'array',
    difficulty: 'string',
    password: 'string'
  }
};

// Schema validation per questions
const QUESTION_SCHEMA = {
  required: ['id', 'question', 'answers', 'solution', 'time', 'cooldown', 'image'],
  types: {
    id: 'string',
    question: 'string',
    answers: 'array',
    solution: 'number',
    time: 'number',
    cooldown: 'number',
    image: 'string'
  }
};

// Schema validation per metadata
const METADATA_SCHEMA = {
  required: ['version', 'lastUpdate', 'totalQuizzes', 'totalQuestions'],
  types: {
    version: 'string',
    lastUpdate: 'string',
    totalQuizzes: 'number',
    totalQuestions: 'number'
  }
};

/**
 * Valida il tipo di una proprietà
 */
function validateType(value, expectedType) {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return false;
  }
}

/**
 * Valida un oggetto contro uno schema
 */
function validateSchema(obj, schema, objectName = 'Object') {
  const errors = [];

  // Controlla proprietà richieste
  for (const prop of schema.required) {
    if (!(prop in obj)) {
      errors.push(`${objectName}: Proprietà richiesta '${prop}' mancante`);
    }
  }

  // Controlla tipi delle proprietà
  for (const [prop, expectedType] of Object.entries(schema.types)) {
    if (prop in obj && !validateType(obj[prop], expectedType)) {
      errors.push(`${objectName}: Proprietà '${prop}' deve essere di tipo ${expectedType}, ricevuto ${typeof obj[prop]}`);
    }
  }

  return errors;
}

/**
 * Valida una domanda singola
 */
function validateQuestion(question, index) {
  const errors = validateSchema(question, QUESTION_SCHEMA, `Domanda ${index + 1}`);

  // Validazioni specifiche per domande
  if ('answers' in question) {
    if (!Array.isArray(question.answers) || question.answers.length < 2 || question.answers.length > 8) {
      errors.push(`Domanda ${index + 1}: 'answers' deve essere un array di 2-8 elementi, ricevuto ${question.answers?.length}`);
    } else {
      question.answers.forEach((answer, i) => {
        if (typeof answer !== 'string') {
          errors.push(`Domanda ${index + 1}: Risposta ${i + 1} deve essere una stringa`);
        }
      });
    }
  }

  if ('solution' in question) {
    const maxSolutionIndex = (question.answers?.length || 4) - 1;
    if (question.solution < 0 || question.solution > maxSolutionIndex) {
      errors.push(`Domanda ${index + 1}: 'solution' deve essere tra 0 e ${maxSolutionIndex} (${question.answers?.length || 4} opzioni), ricevuto ${question.solution}`);
    }
  }

  if ('time' in question) {
    if (question.time <= 0 || question.time > 300) {
      errors.push(`Domanda ${index + 1}: 'time' deve essere tra 1 e 300 secondi`);
    }
  }

  return errors;
}

/**
 * Valida un quiz completo
 */
function validateQuiz(quiz, index) {
  const errors = validateSchema(quiz, QUIZ_SCHEMA, `Quiz ${index + 1}`);

  // Validazioni specifiche per quiz
  if ('questions' in quiz) {
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      errors.push(`Quiz ${index + 1}: 'questions' deve essere un array non vuoto`);
    } else {
      quiz.questions.forEach((question, qIndex) => {
        errors.push(...validateQuestion(question, qIndex));
      });
    }
  }

  // Valida formato data
  if ('created' in quiz) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(quiz.created)) {
      errors.push(`Quiz ${index + 1}: 'created' deve essere in formato YYYY-MM-DD`);
    }
  }

  return errors;
}

/**
 * Valida l'intero archivio quiz
 */
export function validateQuizArchive(archive) {
  const errors = [];

  // Valida struttura principale
  if (!archive || typeof archive !== 'object') {
    errors.push('Archivio deve essere un oggetto');
    return { isValid: false, errors };
  }

  if (!('quizzes' in archive)) {
    errors.push('Proprietà "quizzes" mancante');
  } else if (!Array.isArray(archive.quizzes)) {
    errors.push('"quizzes" deve essere un array');
  } else {
    archive.quizzes.forEach((quiz, index) => {
      errors.push(...validateQuiz(quiz, index));
    });
  }

  // Valida metadata
  if (!('metadata' in archive)) {
    errors.push('Proprietà "metadata" mancante');
  } else {
    errors.push(...validateSchema(archive.metadata, METADATA_SCHEMA, 'Metadata'));

    // Valida coerenza metadata
    if ('quizzes' in archive && Array.isArray(archive.quizzes)) {
      const actualTotalQuizzes = archive.quizzes.length;
      const actualTotalQuestions = archive.quizzes.reduce((total, quiz) =>
        total + (Array.isArray(quiz.questions) ? quiz.questions.length : 0), 0
      );

      if (archive.metadata.totalQuizzes !== actualTotalQuizzes) {
        errors.push(`Metadata: totalQuizzes (${archive.metadata.totalQuizzes}) non corrisponde al numero effettivo (${actualTotalQuizzes})`);
      }

      if (archive.metadata.totalQuestions !== actualTotalQuestions) {
        errors.push(`Metadata: totalQuestions (${archive.metadata.totalQuestions}) non corrisponde al numero effettivo (${actualTotalQuestions})`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Crea la directory di backup se non esiste
 */
function ensureBackupDir() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('📁 Directory backup creata:', BACKUP_DIR);
    }
    return true;
  } catch (error) {
    console.error('❌ Errore creazione directory backup:', error);
    return false;
  }
}

/**
 * Genera nome file backup con timestamp
 */
function generateBackupName() {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];
  return `quiz-archive-backup_${timestamp}.json`;
}

/**
 * Crea backup automatico del file corrente
 */
export function createBackup() {
  try {
    if (!ensureBackupDir()) {
      return { success: false, error: 'Impossibile creare directory backup' };
    }

    if (!fs.existsSync(QUIZ_ARCHIVE_PATH)) {
      return { success: false, error: 'File quiz-archive.json non trovato' };
    }

    const backupName = generateBackupName();
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Copia file
    fs.copyFileSync(QUIZ_ARCHIVE_PATH, backupPath);

    // Gestione retention policy
    cleanupOldBackups();

    console.log('✅ Backup creato:', backupName);
    return { success: true, backupPath, backupName };
  } catch (error) {
    console.error('❌ Errore creazione backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pulisce backup vecchi mantenendo solo gli ultimi MAX_BACKUPS
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('quiz-archive-backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        stats: fs.statSync(path.join(BACKUP_DIR, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime);

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log('🗑️ Backup vecchio eliminato:', file.name);
      });
    }
  } catch (error) {
    console.error('⚠️ Errore pulizia backup vecchi:', error);
  }
}

/**
 * Ripristina da backup più recente
 */
export function restoreFromBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return { success: false, error: 'Directory backup non trovata' };
    }

    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('quiz-archive-backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        stats: fs.statSync(path.join(BACKUP_DIR, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime);

    if (backupFiles.length === 0) {
      return { success: false, error: 'Nessun backup disponibile' };
    }

    const latestBackup = backupFiles[0];

    // Valida il backup prima del restore
    const backupData = JSON.parse(fs.readFileSync(latestBackup.path, 'utf8'));
    const validation = validateQuizArchive(backupData);

    if (!validation.isValid) {
      return {
        success: false,
        error: 'Backup corrotto',
        validationErrors: validation.errors
      };
    }

    // Ripristina
    fs.copyFileSync(latestBackup.path, QUIZ_ARCHIVE_PATH);

    console.log('✅ Ripristino completato da:', latestBackup.name);
    return { success: true, restoredFrom: latestBackup.name };
  } catch (error) {
    console.error('❌ Errore ripristino backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Valida e salva archivio quiz con backup automatico
 */
export function safeWriteQuizArchive(archive) {
  try {
    // 1. Validazione schema
    const validation = validateQuizArchive(archive);
    if (!validation.isValid) {
      console.error('❌ Validazione fallita:', validation.errors);
      return {
        success: false,
        error: 'Dati non validi',
        validationErrors: validation.errors
      };
    }

    // 2. Backup automatico
    const backup = createBackup();
    if (!backup.success) {
      console.warn('⚠️ Backup fallito, procedo comunque:', backup.error);
    }

    // 3. Scrittura file
    const dir = path.dirname(QUIZ_ARCHIVE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(QUIZ_ARCHIVE_PATH, JSON.stringify(archive, null, 2));

    console.log('✅ Archivio quiz salvato con successo');
    return {
      success: true,
      backupCreated: backup.success,
      backupName: backup.backupName
    };
  } catch (error) {
    console.error('❌ Errore scrittura archivio:', error);

    // Tentativo di rollback automatico
    console.log('🔄 Tentativo rollback automatico...');
    const rollback = restoreFromBackup();

    return {
      success: false,
      error: error.message,
      rollbackAttempted: true,
      rollbackSuccess: rollback.success
    };
  }
}

/**
 * Lista tutti i backup disponibili
 */
export function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return { success: true, backups: [] };
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('quiz-archive-backup_') && file.endsWith('.json'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          name: file,
          created: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.created - a.created);

    return { success: true, backups };
  } catch (error) {
    return { success: false, error: error.message };
  }
}