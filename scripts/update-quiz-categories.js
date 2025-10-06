#!/usr/bin/env node

/**
 * Script per aggiornare le categorie dei quiz per testare i filtri
 */

const fs = require('fs');
const path = require('path');

const QUIZ_ARCHIVE_PATH = path.join(process.cwd(), 'data', 'quiz-archive.json');
const BACKUP_PATH = path.join(process.cwd(), 'data', 'quiz-archive-backup-before-categories.json');

// Mappa di categorie per diversi tipi di quiz
const CATEGORY_MAPPINGS = [
  // Medicina
  {
    subjects: ['Medicina'],
    category: 'Medicina',
    subcategory: 'Test Ingresso'
  },

  // Arduino e Elettronica
  {
    subjects: ['Arduino', 'Elettronica'],
    category: 'Tecnologia',
    subcategory: 'Programmazione'
  },

  // Chimica
  {
    subjects: ['Chimica Analitica', 'Chimica'],
    category: 'Scienze',
    subcategory: 'Chimica'
  },

  // Quiz base
  {
    subjects: ['Geografia', 'Arte', 'Scienze', 'Informatica', 'Sport', 'Cultura'],
    category: 'Cultura Generale',
    subcategory: 'Base'
  }
];

function updateQuizCategories() {
  try {
    console.log('🔄 Inizio aggiornamento categorie quiz...\n');

    // Leggi il file
    if (!fs.existsSync(QUIZ_ARCHIVE_PATH)) {
      console.error('❌ File quiz-archive.json non trovato');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8'));

    // Crea backup
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2));
    console.log('💾 Backup creato:', BACKUP_PATH);

    let updatedCount = 0;

    // Aggiorna ogni quiz
    data.quizzes.forEach((quiz, index) => {
      // Trova la categoria appropriata
      let foundMapping = null;

      for (const mapping of CATEGORY_MAPPINGS) {
        if (mapping.subjects.some(subject =>
          quiz.subject?.toLowerCase().includes(subject.toLowerCase()) ||
          quiz.title?.toLowerCase().includes(subject.toLowerCase())
        )) {
          foundMapping = mapping;
          break;
        }
      }

      if (foundMapping) {
        const oldCategory = quiz.category;
        const oldSubcategory = quiz.subcategory;

        quiz.category = foundMapping.category;
        quiz.subcategory = foundMapping.subcategory;

        if (oldCategory !== foundMapping.category || oldSubcategory !== foundMapping.subcategory) {
          console.log(`✅ Quiz "${quiz.title}": ${oldCategory}/${oldSubcategory} → ${foundMapping.category}/${foundMapping.subcategory}`);
          updatedCount++;
        }
      } else {
        // Default per quiz non classificati
        if (!quiz.category || quiz.category === 'Generale') {
          quiz.category = 'Varie';
          quiz.subcategory = 'Misto';
          console.log(`🔄 Quiz "${quiz.title}": → Varie/Misto`);
          updatedCount++;
        }
      }
    });

    // Aggiorna metadata
    data.metadata.lastUpdate = new Date().toISOString().split('T')[0];

    // Salva il file aggiornato
    fs.writeFileSync(QUIZ_ARCHIVE_PATH, JSON.stringify(data, null, 2));

    console.log(`\n📊 Aggiornamento completato:`);
    console.log(`  Quiz aggiornati: ${updatedCount}`);
    console.log(`  Quiz totali: ${data.quizzes.length}`);

    // Mostra le categorie finali
    const categories = [...new Set(data.quizzes.map(q => q.category))];
    const subcategories = [...new Set(data.quizzes.map(q => q.subcategory))];

    console.log(`\n🏷️ Categorie disponibili: ${categories.join(', ')}`);
    console.log(`🏷️ Sottocategorie disponibili: ${subcategories.join(', ')}`);

    console.log('\n✅ Aggiornamento categorie completato!');

  } catch (error) {
    console.error('❌ Errore durante aggiornamento:', error);

    // Ripristina backup se disponibile
    if (fs.existsSync(BACKUP_PATH)) {
      console.log('🔄 Ripristino backup...');
      fs.copyFileSync(BACKUP_PATH, QUIZ_ARCHIVE_PATH);
      console.log('✅ Backup ripristinato');
    }

    process.exit(1);
  }
}

// Esegui aggiornamento
if (require.main === module) {
  updateQuizCategories();
}

module.exports = { updateQuizCategories };