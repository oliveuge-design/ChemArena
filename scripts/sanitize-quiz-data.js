#!/usr/bin/env node

/**
 * Script per sanitizzare e pulire i dati dei quiz
 * Converte tutte le risposte in stringhe e rimuove quiz corrotti
 */

const fs = require('fs');
const path = require('path');

// Percorsi dei file
const QUIZ_ARCHIVE_PATH = path.join(process.cwd(), 'data', 'quiz-archive.json');
const BACKUP_PATH = path.join(process.cwd(), 'data', 'quiz-archive-backup-pre-sanitization.json');

// Lista di quiz corrotti da rimuovere
const CORRUPTED_QUIZ_IDS = [
  'quiz_1758303316332'
];

function sanitizeAnswers(answers) {
  if (!Array.isArray(answers)) {
    console.warn('⚠️ Risposte non è un array:', answers);
    return [];
  }

  return answers.map(answer => {
    if (typeof answer === 'string') {
      return answer;
    } else if (typeof answer === 'number') {
      return String(answer);
    } else if (typeof answer === 'object' && answer !== null) {
      return JSON.stringify(answer);
    } else {
      return String(answer || '');
    }
  });
}

function sanitizeQuestion(question, questionIndex) {
  try {
    const sanitized = {
      id: String(question.id || `q_${questionIndex}`),
      question: String(question.question || ''),
      answers: sanitizeAnswers(question.answers || []),
      solution: Number(question.solution) || 0,
      time: Number(question.time) || 15,
      cooldown: Number(question.cooldown) || 5,
      image: String(question.image || '')
    };

    // Valida che solution sia nell'intervallo corretto
    if (sanitized.solution < 0 || sanitized.solution >= sanitized.answers.length) {
      console.warn(`⚠️ Domanda ${questionIndex + 1}: solution ${sanitized.solution} fuori range, impostato a 0`);
      sanitized.solution = 0;
    }

    return sanitized;
  } catch (error) {
    console.error(`❌ Errore sanitizzazione domanda ${questionIndex + 1}:`, error);
    return null;
  }
}

function sanitizeQuiz(quiz, quizIndex) {
  try {
    // Controlla se è un quiz corrotto
    if (CORRUPTED_QUIZ_IDS.includes(quiz.id)) {
      console.log(`🗑️ Rimuovo quiz corrotto: ${quiz.id}`);
      return null;
    }

    const sanitized = {
      id: String(quiz.id || `quiz_${Date.now()}_${quizIndex}`),
      title: String(quiz.title || quiz.subject || 'Quiz Senza Titolo'),
      subject: String(quiz.subject || 'Quiz'),
      created: String(quiz.created || new Date().toISOString().split('T')[0]),
      author: String(quiz.author || 'Sconosciuto'),
      questions: [],
      category: String(quiz.category || 'Generale'),
      subcategory: String(quiz.subcategory || ''),
      tags: Array.isArray(quiz.tags) ? quiz.tags.map(tag => String(tag)) : [],
      difficulty: String(quiz.difficulty || 'Medio'),
      password: String(quiz.password || '')
    };

    // Sanitizza tutte le domande
    if (Array.isArray(quiz.questions)) {
      sanitized.questions = quiz.questions
        .map((question, qIndex) => sanitizeQuestion(question, qIndex))
        .filter(question => question !== null);
    }

    // Valida che ci siano domande
    if (sanitized.questions.length === 0) {
      console.warn(`⚠️ Quiz ${quizIndex + 1} (${sanitized.title}) non ha domande valide, verrà rimosso`);
      return null;
    }

    console.log(`✅ Quiz sanitizzato: ${sanitized.title} (${sanitized.questions.length} domande)`);
    return sanitized;
  } catch (error) {
    console.error(`❌ Errore sanitizzazione quiz ${quizIndex + 1}:`, error);
    return null;
  }
}

function sanitizeQuizArchive() {
  try {
    console.log('🧹 Inizio sanitizzazione archivio quiz...\n');

    // Leggi il file corrente
    if (!fs.existsSync(QUIZ_ARCHIVE_PATH)) {
      console.error('❌ File quiz-archive.json non trovato:', QUIZ_ARCHIVE_PATH);
      process.exit(1);
    }

    const rawData = fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8');
    const data = JSON.parse(rawData);

    // Crea backup
    console.log('💾 Creazione backup...');
    fs.writeFileSync(BACKUP_PATH, rawData);
    console.log('✅ Backup creato:', BACKUP_PATH);

    // Sanitizza i quiz
    console.log('\n🔧 Sanitizzazione quiz...');
    const originalQuizCount = data.quizzes?.length || 0;

    if (!Array.isArray(data.quizzes)) {
      console.error('❌ Proprietà quizzes non è un array');
      process.exit(1);
    }

    const sanitizedQuizzes = data.quizzes
      .map((quiz, index) => sanitizeQuiz(quiz, index))
      .filter(quiz => quiz !== null);

    // Calcola statistiche
    const totalQuestions = sanitizedQuizzes.reduce((total, quiz) =>
      total + quiz.questions.length, 0);

    // Aggiorna metadata
    const sanitizedData = {
      quizzes: sanitizedQuizzes,
      metadata: {
        version: "2.0.0",
        lastUpdate: new Date().toISOString(),
        totalQuizzes: sanitizedQuizzes.length,
        totalQuestions: totalQuestions
      }
    };

    // Scrivi il file sanitizzato
    fs.writeFileSync(QUIZ_ARCHIVE_PATH, JSON.stringify(sanitizedData, null, 2));

    // Report finale
    console.log('\n📊 Report Sanitizzazione:');
    console.log(`  Quiz originali: ${originalQuizCount}`);
    console.log(`  Quiz rimossi: ${originalQuizCount - sanitizedQuizzes.length}`);
    console.log(`  Quiz finali: ${sanitizedQuizzes.length}`);
    console.log(`  Domande totali: ${totalQuestions}`);
    console.log('\n✅ Sanitizzazione completata con successo!');

    // Verifica finale
    try {
      const verificationData = JSON.parse(fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8'));
      console.log('✅ Verifica finale: file JSON valido');

      // Test validazione basic
      let validationErrors = 0;
      verificationData.quizzes.forEach((quiz, qIndex) => {
        if (!quiz.questions || !Array.isArray(quiz.questions)) {
          console.error(`❌ Quiz ${qIndex + 1}: questions non valide`);
          validationErrors++;
          return;
        }

        quiz.questions.forEach((question, questionIndex) => {
          if (!Array.isArray(question.answers)) {
            console.error(`❌ Quiz ${qIndex + 1}, Domanda ${questionIndex + 1}: answers non è array`);
            validationErrors++;
            return;
          }

          question.answers.forEach((answer, answerIndex) => {
            if (typeof answer !== 'string') {
              console.error(`❌ Quiz ${qIndex + 1}, Domanda ${questionIndex + 1}, Risposta ${answerIndex + 1}: non è stringa`);
              validationErrors++;
            }
          });
        });
      });

      if (validationErrors === 0) {
        console.log('✅ Validazione: tutti i dati sono corretti');
      } else {
        console.error(`❌ Trovati ${validationErrors} errori di validazione`);
      }

    } catch (verifyError) {
      console.error('❌ Errore verifica finale:', verifyError.message);
    }

  } catch (error) {
    console.error('❌ Errore durante sanitizzazione:', error);

    // Ripristina backup se disponibile
    if (fs.existsSync(BACKUP_PATH)) {
      console.log('🔄 Ripristino backup...');
      fs.copyFileSync(BACKUP_PATH, QUIZ_ARCHIVE_PATH);
      console.log('✅ Backup ripristinato');
    }

    process.exit(1);
  }
}

// Esegui sanitizzazione
if (require.main === module) {
  sanitizeQuizArchive();
}

module.exports = { sanitizeQuizArchive, sanitizeQuiz, sanitizeQuestion };