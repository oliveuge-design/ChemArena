const fs = require('fs');
const path = require('path');

const timestamp = Date.now();

// 🎯 4 QUIZ TECNICI SUI SENSORI INDUSTRIALI
// Basati su: Tecnologie chimiche industriali Vol. 1 (Edisco) + Video Endress+Hauser

const newQuizzes = [
  // ========================================
  // QUIZ 1: SENSORI DI PORTATA
  // ========================================
  {
    id: `quiz_sensori_portata_${timestamp}`,
    title: "Sensori di Portata - Principi di Funzionamento",
    subject: "Tecnologie Chimiche Industriali",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "tecnologie_chimiche",
    difficulty: "media",
    isPublic: true,
    questions: [
      {
        id: `q${timestamp}_portata_1`,
        question: "Nel misuratore di portata a diaframma, la riduzione della sezione di passaggio provoca:",
        answers: [
          "Un aumento della pressione statica e riduzione della velocità",
          "Una riduzione della pressione statica e aumento della velocità",
          "Un aumento sia della pressione che della velocità",
          "Nessuna variazione di pressione e velocità"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_2`,
        question: "L'equazione di Bernoulli, fondamentale per i misuratori di portata a pressione differenziale, mette in relazione:",
        answers: [
          "Pressione, velocità ed energia potenziale del fluido",
          "Solo pressione e temperatura",
          "Densità e viscosità del fluido",
          "Portata volumetrica e massica"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_3`,
        question: "Il misuratore di portata elettromagnetico (induttivo) funziona secondo:",
        answers: [
          "Il principio di Archimede",
          "La legge di Faraday dell'induzione elettromagnetica",
          "Il principio di Bernoulli",
          "L'effetto Doppler"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_4`,
        question: "Per utilizzare un misuratore di portata elettromagnetico, il fluido deve essere:",
        answers: [
          "Trasparente e incolore",
          "Elettricamente conduttivo (conducibilità minima ≥5 μS/cm)",
          "Assolutamente puro",
          "A bassa viscosità"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_5`,
        question: "Il misuratore di portata a vortici (vortex) sfrutta:",
        answers: [
          "La formazione di vortici di Kármán dietro un corpo immerso nel flusso",
          "L'effetto Coriolis",
          "La pressione differenziale",
          "Le onde ultrasoniche"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_6`,
        question: "Nel misuratore di portata ad ultrasuoni (tempo di transito), il principio di misura si basa su:",
        answers: [
          "La riflessione delle onde sulla superficie del fluido",
          "La differenza di tempo di transito tra ultrasuoni inviati a favore e contro il flusso",
          "L'assorbimento delle onde ultrasoniche",
          "La rifrazione delle onde nel fluido"
        ],
        solution: 1,
        time: 35,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_7`,
        question: "Il misuratore di portata massico Coriolis misura direttamente:",
        answers: [
          "La portata volumetrica",
          "La velocità del fluido",
          "La portata massica e la densità del fluido",
          "Solo la temperatura del fluido"
        ],
        solution: 2,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_8`,
        question: "Quale tipo di misuratore di portata è più adatto per fluidi contenenti particelle solide in sospensione?",
        answers: [
          "Misuratore a diaframma",
          "Misuratore elettromagnetico",
          "Misuratore ad ultrasuoni (tempo di transito)",
          "Misuratore a turbina"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_9`,
        question: "Il coefficiente di efflusso (Cd) di un diaframma tiene conto di:",
        answers: [
          "Solo della temperatura del fluido",
          "Delle perdite di carico e degli attriti reali rispetto al modello ideale",
          "Della densità del fluido",
          "Del diametro della tubazione"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_portata_10`,
        question: "Il numero di Reynolds (Re) in un sistema di misura di portata serve a determinare:",
        answers: [
          "La temperatura del fluido",
          "Il regime di flusso (laminare, turbolento o di transizione)",
          "La densità del fluido",
          "La conducibilità elettrica"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // ========================================
  // QUIZ 2: SENSORI DI LIVELLO
  // ========================================
  {
    id: `quiz_sensori_livello_${timestamp}`,
    title: "Sensori di Livello - Principi di Funzionamento",
    subject: "Tecnologie Chimiche Industriali",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "tecnologie_chimiche",
    difficulty: "media",
    isPublic: true,
    questions: [
      {
        id: `q${timestamp}_livello_1`,
        question: "Il principio di funzionamento di un sensore di livello a pressione idrostatica si basa su:",
        answers: [
          "La misura della temperatura del liquido",
          "La relazione P = ρ × g × h (pressione proporzionale ad altezza liquido)",
          "L'effetto capacitivo",
          "La riflessione delle onde radar"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_2`,
        question: "Un sensore di livello capacitivo misura il livello attraverso:",
        answers: [
          "La variazione di capacità elettrica tra le armature causata dal dielettrico (liquido)",
          "La conducibilità del fluido",
          "La pressione esercitata dal liquido",
          "Il peso del serbatoio"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_3`,
        question: "Il sensore di livello a ultrasuoni (ecometrico) misura il livello mediante:",
        answers: [
          "Il tempo di volo (ToF) dell'impulso ultrasonico riflesso dalla superficie del liquido",
          "La frequenza delle onde",
          "L'assorbimento delle onde dal liquido",
          "La temperatura della superficie"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_4`,
        question: "Il sensore di livello radar (a microonde) presenta il vantaggio di:",
        answers: [
          "Essere economico",
          "Funzionare anche in presenza di vapori, polveri e condizioni di vuoto",
          "Richiedere contatto diretto con il liquido",
          "Essere adatto solo per liquidi conduttivi"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_5`,
        question: "Un sensore di livello a galleggiante (float) funziona secondo:",
        answers: [
          "Il principio di Archimede (spinta idrostatica)",
          "L'effetto Doppler",
          "La legge di Ohm",
          "Il principio di Bernoulli"
        ],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_6`,
        question: "Il sensore di livello a conduttività (elettrodi) è adatto per:",
        answers: [
          "Liquidi non conduttivi come oli e solventi organici",
          "Liquidi conduttivi come acqua, acidi e basi",
          "Gas compressi",
          "Solidi granulari"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_7`,
        question: "Il sensore di livello a vibrazione (diapason) rileva il livello quando:",
        answers: [
          "La temperatura aumenta",
          "Le pale vibranti entrano in contatto con il materiale, smorzando la vibrazione",
          "La pressione supera un valore critico",
          "Il pH cambia"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_8`,
        question: "La tecnica TDR (Time Domain Reflectometry) per la misura di livello si basa su:",
        answers: [
          "Impulsi elettromagnetici lungo una sonda e misurazione del tempo di riflessione",
          "Onde ultrasoniche",
          "Pressione idrostatica",
          "Galleggianti magnetici"
        ],
        solution: 0,
        time: 35,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_9`,
        question: "Per misurare il livello di interfaccia tra due liquidi non miscibili (es. olio/acqua), è più indicato:",
        answers: [
          "Un sensore a ultrasuoni",
          "Un sensore a pressione differenziale o TDR con costanti dielettriche diverse",
          "Un sensore a galleggiante semplice",
          "Un termometro"
        ],
        solution: 1,
        time: 35,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_livello_10`,
        question: "Il sensore di livello radiometrico (a raggi gamma) viene utilizzato quando:",
        answers: [
          "Il costo non è un problema e servono misure senza contatto in condizioni estreme",
          "Il liquido è trasparente",
          "La temperatura è bassa",
          "Il serbatoio è di piccole dimensioni"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // ========================================
  // QUIZ 3: SENSORI DI TEMPERATURA
  // ========================================
  {
    id: `quiz_sensori_temperatura_${timestamp}`,
    title: "Sensori di Temperatura - Principi di Funzionamento",
    subject: "Tecnologie Chimiche Industriali",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "tecnologie_chimiche",
    difficulty: "media",
    isPublic: true,
    questions: [
      {
        id: `q${timestamp}_temp_1`,
        question: "Una termocoppia genera una forza elettromotrice (fem) quando:",
        answers: [
          "È collegata a una batteria",
          "Esiste una differenza di temperatura tra la giunzione calda e quella fredda (effetto Seebeck)",
          "È immersa in un liquido",
          "La pressione aumenta"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_2`,
        question: "La termocoppia di tipo K (Chromel-Alumel) ha un range di temperatura tipico di:",
        answers: [
          "-200°C a +1370°C",
          "0°C a +100°C",
          "-50°C a +200°C",
          "+500°C a +3000°C"
        ],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_3`,
        question: "Una termoresistenza Pt100 è costituita da:",
        answers: [
          "Platino con resistenza di 100 Ω a 0°C",
          "Rame con resistenza di 100 Ω a 25°C",
          "Nichel-cromo con resistenza variabile",
          "Tungsteno a 100 kΩ"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_4`,
        question: "Il coefficiente di temperatura α (alpha) di una Pt100 standard è:",
        answers: [
          "0,00385 Ω/Ω/°C (resistenza aumenta di 0,385% per °C)",
          "0,1 Ω/°C",
          "10 Ω/°C",
          "100 Ω/°C"
        ],
        solution: 0,
        time: 35,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_5`,
        question: "I termoregistri (RTD) presentano rispetto alle termocoppie:",
        answers: [
          "Maggiore precisione e linearità ma range di temperatura inferiore",
          "Costo inferiore e installazione più semplice",
          "Tempo di risposta più veloce",
          "Capacità di lavorare a temperature superiori a 2000°C"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_6`,
        question: "Un termistore NTC (Negative Temperature Coefficient) ha una resistenza che:",
        answers: [
          "Aumenta all'aumentare della temperatura",
          "Diminuisce all'aumentare della temperatura",
          "Rimane costante",
          "Varia in modo casuale"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_7`,
        question: "Un pirometro a radiazione (IR) misura la temperatura:",
        answers: [
          "Senza contatto, rilevando l'energia termica irradiata dal corpo",
          "Attraverso il contatto diretto con la superficie",
          "Misurando la conducibilità termica",
          "Utilizzando termocoppie interne"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_8`,
        question: "L'emissività (ε) di un materiale nel contesto della pirometria è:",
        answers: [
          "La capacità di riflettere la radiazione",
          "Il rapporto tra radiazione emessa dal corpo e quella di un corpo nero alla stessa temperatura",
          "La temperatura massima raggiungibile",
          "La conducibilità termica"
        ],
        solution: 1,
        time: 35,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_9`,
        question: "Il collegamento a 3 o 4 fili di una Pt100 serve a:",
        answers: [
          "Aumentare la potenza",
          "Compensare la resistenza dei cavi di collegamento ed eliminare errori di misura",
          "Raffreddare il sensore",
          "Proteggere da sovratensioni"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_temp_10`,
        question: "Il pozzetto termoprotettivo (thermowell) serve a:",
        answers: [
          "Aumentare la sensibilità del sensore",
          "Proteggere il sensore da pressione, corrosione e abrasione del processo",
          "Accelerare il tempo di risposta",
          "Ridurre il costo dell'installazione"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // ========================================
  // QUIZ 4: SENSORI DI PRESSIONE
  // ========================================
  {
    id: `quiz_sensori_pressione_${timestamp}`,
    title: "Sensori di Pressione - Principi di Funzionamento",
    subject: "Tecnologie Chimiche Industriali",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "tecnologie_chimiche",
    difficulty: "media",
    isPublic: true,
    questions: [
      {
        id: `q${timestamp}_press_1`,
        question: "Un sensore di pressione piezoresistivo funziona secondo:",
        answers: [
          "La variazione di resistenza elettrica di un materiale sottoposto a deformazione meccanica",
          "L'effetto fotoelettrico",
          "La variazione di capacità",
          "L'induzione magnetica"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_2`,
        question: "La cella di carico estensimetrica (strain gauge) misura:",
        answers: [
          "Solo la temperatura",
          "La deformazione meccanica causata dalla pressione tramite variazione di resistenza",
          "La conduttività del fluido",
          "La portata massica"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_3`,
        question: "Un sensore di pressione capacitivo misura la pressione rilevando:",
        answers: [
          "La variazione di capacità tra due armature causata dalla deformazione del diaframma",
          "La temperatura del fluido",
          "La conducibilità elettrica",
          "La densità del gas"
        ],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_4`,
        question: "Il sensore di pressione piezoelettrico (cristallo di quarzo) genera:",
        answers: [
          "Una carica elettrica proporzionale alla pressione applicata",
          "Una variazione di colore",
          "Un campo magnetico",
          "Calore"
        ],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_5`,
        question: "Un trasduttore di pressione assoluta misura:",
        answers: [
          "La pressione relativa all'atmosfera",
          "La pressione rispetto al vuoto assoluto (0 bar assoluti)",
          "Solo la pressione differenziale",
          "La pressione idrostatica"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_6`,
        question: "Un trasduttore di pressione differenziale misura:",
        answers: [
          "La temperatura differenziale",
          "La differenza di pressione tra due punti del processo",
          "La pressione assoluta",
          "Il livello assoluto"
        ],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_7`,
        question: "Il diaframma (membrana) di un sensore di pressione può essere realizzato in:",
        answers: [
          "Solo plastica",
          "Materiali metallici (acciaio inox, Hastelloy), ceramica o silicio",
          "Solo vetro",
          "Legno compensato"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_8`,
        question: "Il separatore a diaframma (diaphragm seal) nei sensori di pressione serve a:",
        answers: [
          "Aumentare la pressione",
          "Isolare il sensore da fluidi corrosivi, viscosi o ad alta temperatura",
          "Ridurre il costo",
          "Accelerare la risposta"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_9`,
        question: "Il segnale di uscita standard di un trasmettitore di pressione industriale è tipicamente:",
        answers: [
          "0-5 V DC",
          "4-20 mA (corrente in loop)",
          "220 V AC",
          "Segnale digitale RS232"
        ],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_press_10`,
        question: "Il fenomeno dell'overpressure (sovrapressione) può:",
        answers: [
          "Migliorare la precisione del sensore",
          "Danneggiare irreversibilmente il diaframma se supera il limite di burst pressure",
          "Raffreddare il sensore",
          "Non ha alcun effetto"
        ],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  }
];

// ========================================
// FUNZIONI DI SICUREZZA E BACKUP
// ========================================

function createBackup() {
  const dataPath = path.join(__dirname, '..', 'data', 'quiz-archive.json');
  const backupPath = path.join(__dirname, '..', 'data', `quiz-archive-backup-sensori-${Date.now()}.json`);

  if (fs.existsSync(dataPath)) {
    fs.copyFileSync(dataPath, backupPath);
    console.log(`✅ Backup creato: ${backupPath}`);
    return true;
  }
  console.warn('⚠️ File quiz-archive.json non trovato, sarà creato');
  return false;
}

function validateQuizStructure(quiz) {
  const required = ['id', 'title', 'subject', 'questions'];
  for (const field of required) {
    if (!quiz[field]) {
      throw new Error(`Campo obbligatorio mancante: ${field}`);
    }
  }

  if (quiz.questions.length !== 10) {
    throw new Error(`Quiz ${quiz.title} deve avere 10 domande, trovate: ${quiz.questions.length}`);
  }

  quiz.questions.forEach((q, idx) => {
    if (!q.question || !q.answers || q.answers.length !== 4 || q.solution === undefined) {
      throw new Error(`Domanda ${idx + 1} del quiz ${quiz.title} non valida`);
    }
  });

  return true;
}

function addQuizzesToArchive() {
  try {
    // 1. Backup
    console.log('📦 Creazione backup...');
    createBackup();

    // 2. Validazione
    console.log('🔍 Validazione struttura quiz...');
    newQuizzes.forEach(quiz => {
      validateQuizStructure(quiz);
      console.log(`✅ ${quiz.title} - OK (10 domande)`);
    });

    // 3. Carica archivio esistente
    const dataPath = path.join(__dirname, '..', 'data', 'quiz-archive.json');
    let archive = { quizzes: [] };

    if (fs.existsSync(dataPath)) {
      archive = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    const initialCount = archive.quizzes.length;

    // 4. Aggiungi nuovi quiz
    archive.quizzes.push(...newQuizzes);

    // 5. Salva
    fs.writeFileSync(dataPath, JSON.stringify(archive, null, 2));

    console.log('\n🎉 QUIZ SENSORI AGGIUNTI CON SUCCESSO!');
    console.log(`📊 Quiz totali: ${initialCount} → ${archive.quizzes.length} (+${newQuizzes.length})`);
    console.log('\n📚 Nuovi quiz:');
    newQuizzes.forEach((quiz, idx) => {
      console.log(`${idx + 1}. ${quiz.title} (${quiz.questions.length} domande)`);
    });

    return true;
  } catch (error) {
    console.error('❌ ERRORE:', error.message);
    console.log('\n🔄 Ripristina backup se necessario da data/quiz-archive-backup-sensori-*.json');
    return false;
  }
}

// Esegui
if (require.main === module) {
  addQuizzesToArchive();
}

module.exports = { newQuizzes, addQuizzesToArchive };
