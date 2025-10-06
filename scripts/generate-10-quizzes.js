const fs = require('fs');
const path = require('path');

const timestamp = Date.now();

const newQuizzes = [
  // QUIZ 1: Chimica Analitica Classica - Titolazioni
  {
    id: `quiz_analitica_titolazioni_${timestamp}`,
    title: "Titolazioni e Analisi Volumetrica",
    subject: "Chimica Analitica",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "chimica",
    difficulty: "media",
    questions: [
      {
        id: `q${timestamp}_1_1`,
        question: "Quale indicatore è più adatto per una titolazione acido forte-base forte?",
        answers: ["Fenolftaleina", "Metilarancio", "Blu di bromotimolo", "Tutti e tre"],
        solution: 3,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_2`,
        question: "Il punto equivalente di una titolazione corrisponde a:",
        answers: ["Il cambio di colore dell'indicatore", "La completa neutralizzazione stechiometrica", "Il pH = 7", "Il punto di semi-neutralizzazione"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_3`,
        question: "In una titolazione acido debole-base forte, il pH al punto equivalente è:",
        answers: ["pH < 7", "pH = 7", "pH > 7", "Dipende dalla temperatura"],
        solution: 2,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_4`,
        question: "La standardizzazione di una soluzione serve a:",
        answers: ["Determinarne la concentrazione esatta", "Verificarne la purezza", "Misurarne il pH", "Controllarne la temperatura"],
        solution: 0,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_5`,
        question: "Il titolante è:",
        answers: ["La soluzione da analizzare", "La soluzione a concentrazione nota", "L'indicatore colorato", "Il catalizzatore della reazione"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_6`,
        question: "Una buretta deve essere lavata con:",
        answers: ["Acqua distillata e asciugata", "La soluzione che conterrà", "Acetone", "Sapone neutro"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_7`,
        question: "Il carbonato di sodio è uno standard primario per:",
        answers: ["Acidi forti", "Basi forti", "Agenti ossidanti", "Agenti riducenti"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_8`,
        question: "L'equazione di Henderson-Hasselbalch è utilizzata per calcolare:",
        answers: ["La concentrazione molare", "Il pH di soluzioni tampone", "La densità delle soluzioni", "La temperatura di ebollizione"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_9`,
        question: "In una titolazione complessometrica con EDTA, l'indicatore metallico:",
        answers: ["Forma un complesso meno stabile del complesso metallo-EDTA", "Forma un complesso più stabile del complesso metallo-EDTA", "Non forma complessi", "Precipita con il metallo"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_1_10`,
        question: "La retrotitolazione è utile quando:",
        answers: ["Il titolante è troppo costoso", "La reazione diretta è troppo lenta o incompleta", "Si vuole risparmiare tempo", "L'indicatore non è disponibile"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // QUIZ 2: Chimica Analitica Classica - Equilibri
  {
    id: `quiz_analitica_equilibri_${timestamp}`,
    title: "Equilibri Chimici in Soluzione",
    subject: "Chimica Analitica",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "chimica",
    difficulty: "media",
    questions: [
      {
        id: `q${timestamp}_2_1`,
        question: "La costante di equilibrio Kw dell'acqua a 25°C vale:",
        answers: ["1.0 × 10⁻⁷", "1.0 × 10⁻¹⁴", "1.0 × 10⁻¹⁰", "1.0 × 10⁻⁵"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_2`,
        question: "Un tampone è efficace quando pH = pKa ±:",
        answers: ["0.5", "1", "2", "3"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_3`,
        question: "Il prodotto di solubilità Kps esprime:",
        answers: ["La solubilità in g/L", "Il prodotto delle concentrazioni ioniche in soluzione satura", "La velocità di dissoluzione", "Il calore di solubilizzazione"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_4`,
        question: "L'effetto del ione comune causa:",
        answers: ["Aumento della solubilità", "Diminuzione della solubilità", "Nessun effetto", "Dipende dalla temperatura"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_5`,
        question: "Una soluzione tampone resiste variazioni di:",
        answers: ["Temperatura", "pH", "Pressione", "Volume"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_6`,
        question: "Il punto isoelettrico di un amminoacido è il pH al quale:",
        answers: ["Predomina la forma cationica", "Predomina la forma anionica", "La carica netta è zero", "Si decompone"],
        solution: 2,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_7`,
        question: "La legge di Le Châtelier afferma che un sistema all'equilibrio reagisce a una perturbazione:",
        answers: ["Spostando l'equilibrio nella direzione che contrasta la perturbazione", "Annullando completamente la perturbazione", "Non reagisce", "Raggiunge un nuovo equilibrio casuale"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_8`,
        question: "Un acido poliprotico rilascia protoni:",
        answers: ["Simultaneamente", "In stadi successivi", "Solo in ambiente basico", "Solo ad alte temperature"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_9`,
        question: "La capacità tampone è massima quando:",
        answers: ["pH = pKa", "pH = 7", "pH = 14", "pH = 0"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_2_10`,
        question: "La formazione di complessi può aumentare la solubilità di un sale poco solubile per:",
        answers: ["Effetto dello ione comune", "Diminuzione del Kps", "Rimozione di uno ione dall'equilibrio", "Aumento della temperatura"],
        solution: 2,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  }
];

// Leggi il file esistente
const archivePath = path.join(__dirname, '..', 'data', 'quiz-archive.json');
const archiveData = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

// Aggiungi i nuovi quiz
archiveData.quizzes.push(...newQuizzes);

// Aggiorna metadata
archiveData.metadata.totalQuizzes = archiveData.quizzes.length;
archiveData.metadata.totalQuestions = archiveData.quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
archiveData.metadata.lastUpdate = new Date().toISOString();

// Salva
fs.writeFileSync(archivePath, JSON.stringify(archiveData, null, 2), 'utf8');

console.log(`✅ Aggiunti ${newQuizzes.length} nuovi quiz!`);
console.log(`📊 Totale quiz: ${archiveData.metadata.totalQuizzes}`);
console.log(`📝 Totale domande: ${archiveData.metadata.totalQuestions}`);
