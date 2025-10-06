const fs = require('fs');
const path = require('path');

const timestamp = Date.now();

const newQuizzes = [
  // QUIZ 3: Chimica Analitica Strumentale - Spettroscopia
  {
    id: `quiz_strumentale_spettroscopia_${timestamp}`,
    title: "Spettroscopia e Tecniche Ottiche",
    subject: "Chimica Analitica Strumentale",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "chimica",
    difficulty: "avanzata",
    questions: [
      {
        id: `q${timestamp}_3_1`,
        question: "La legge di Lambert-Beer correla l'assorbanza con:",
        answers: ["Concentrazione e cammino ottico", "Temperatura e pressione", "pH e conducibilità", "Densità e viscosità"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_2`,
        question: "Nella spettroscopia UV-Vis, le transizioni elettroniche coinvolgono:",
        answers: ["Elettroni di core", "Elettroni di valenza", "Protoni nucleari", "Neutroni"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_3`,
        question: "L'IR (infrarosso) rileva:",
        answers: ["Transizioni elettroniche", "Vibrazioni molecolari", "Spin nucleare", "Emissione di elettroni"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_4`,
        question: "Il gruppo carbonilico C=O assorbe in IR a circa:",
        answers: ["3300 cm⁻¹", "1700 cm⁻¹", "2900 cm⁻¹", "1000 cm⁻¹"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_5`,
        question: "Nella spettroscopia di assorbimento atomico (AAS), la sorgente è:",
        answers: ["Lampada al tungsteno", "Lampada a catodo cavo dell'elemento specifico", "Laser", "LED"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_6`,
        question: "La fluorescenza è:",
        answers: ["Emissione dopo assorbimento di energia", "Riflessione della luce", "Diffrazione", "Rifrazione"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_7`,
        question: "Il numero d'onda in spettroscopia IR si esprime in:",
        answers: ["nm", "cm⁻¹", "Hz", "eV"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_8`,
        question: "La spettroscopia NMR studia:",
        answers: ["Transizioni elettroniche", "Vibrazioni molecolari", "Spin nucleare", "Rotazioni molecolari"],
        solution: 2,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_9`,
        question: "Il chemical shift in NMR è influenzato da:",
        answers: ["L'ambiente chimico del nucleo", "La massa molecolare", "Il punto di ebollizione", "La densità del campione"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_3_10`,
        question: "Nella spettrometria di massa, il detector misura:",
        answers: ["La massa assoluta", "Il rapporto massa/carica (m/z)", "La velocità degli ioni", "La temperatura degli ioni"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // QUIZ 4: Chimica Analitica Strumentale - Cromatografia
  {
    id: `quiz_strumentale_cromatografia_${timestamp}`,
    title: "Cromatografia e Tecniche Separative",
    subject: "Chimica Analitica Strumentale",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "chimica",
    difficulty: "avanzata",
    questions: [
      {
        id: `q${timestamp}_4_1`,
        question: "In cromatografia, la fase stazionaria è:",
        answers: ["Il solvente che scorre", "Il supporto fisso che trattiene i composti", "Il detector", "Il campione da analizzare"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_2`,
        question: "Il tempo di ritenzione dipende da:",
        answers: ["Solo dalla temperatura", "Dall'affinità del composto per fase stazionaria e mobile", "Solo dal pH", "Solo dalla pressione"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_3`,
        question: "HPLC significa:",
        answers: ["High Performance Liquid Chromatography", "High Pressure Liquid Chemistry", "High Power Light Calibration", "High Precision Laboratory Chemistry"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_4`,
        question: "Nella gas cromatografia (GC), la fase mobile è:",
        answers: ["Un liquido organico", "Un gas inerte (He, N₂, H₂)", "Acqua", "Una miscela di solventi"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_5`,
        question: "La cromatografia su strato sottile (TLC) utilizza come fase stazionaria:",
        answers: ["Silice o allumina su lastra", "Una colonna di vetro", "Un capillare", "Una membrana polimerica"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_6`,
        question: "L'Rf in TLC rappresenta:",
        answers: ["Il rapporto tra distanza percorsa dal composto e dal solvente", "La risoluzione del picco", "Il fattore di ritardo", "La risposta del detector"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_7`,
        question: "Il detector FID in GC rileva:",
        answers: ["Assorbimento UV", "Ionizzazione di composti organici in fiamma", "Fluorescenza", "Indice di rifrazione"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_8`,
        question: "La cromatografia a scambio ionico separa composti in base a:",
        answers: ["Dimensioni molecolari", "Carica elettrica", "Punto di ebollizione", "Solubilità"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_9`,
        question: "L'efficienza di una colonna cromatografica è espressa da:",
        answers: ["Il numero di piatti teorici (N)", "La lunghezza della colonna", "Il diametro della colonna", "La temperatura di esercizio"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_4_10`,
        question: "La cromatografia di affinità separa molecole in base a:",
        answers: ["Massa molecolare", "Carica", "Interazioni specifiche ligando-recettore", "Idrofobicità"],
        solution: 2,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // QUIZ 5: Chimica Organica - Reazioni
  {
    id: `quiz_organica_reazioni_${timestamp}`,
    title: "Reazioni e Meccanismi in Chimica Organica",
    subject: "Chimica Organica",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "chimica",
    difficulty: "media",
    questions: [
      {
        id: `q${timestamp}_5_1`,
        question: "Una reazione di sostituzione nucleofila (SN2) procede con:",
        answers: ["Inversione di configurazione", "Ritenzione di configurazione", "Racemizzazione", "Nessun cambiamento stereochimico"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_2`,
        question: "Gli alcheni reagiscono con HBr seguendo la regola di:",
        answers: ["Hückel", "Markovnikov", "Zaitsev", "Le Châtelier"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_3`,
        question: "L'addizione di bromo a un alchene è una reazione:",
        answers: ["Di sostituzione", "Di eliminazione", "Di addizione elettrofila", "Di trasposizione"],
        solution: 2,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_4`,
        question: "La regola di Zaitsev prevede che in un'eliminazione si formi:",
        answers: ["L'alchene più sostituito", "L'alchene meno sostituito", "Sempre un alchino", "Un cicloalcano"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_5`,
        question: "I composti carbonilici reagiscono con nucleofili tramite:",
        answers: ["Addizione al carbonio carbonilico", "Sostituzione sull'ossigeno", "Eliminazione", "Raddrizzamento"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_6`,
        question: "La reazione di Grignard utilizza reagenti:",
        answers: ["Acidi forti", "Basi forti", "Organometallici (RMgX)", "Ossidanti"],
        solution: 2,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_7`,
        question: "L'ossidazione di un alcol primario produce:",
        answers: ["Un chetone", "Un'aldeide poi acido carbossilico", "Un etere", "Un estere"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_8`,
        question: "La condensazione aldolica coinvolge:",
        answers: ["Due molecole di aldeide o chetone", "Un alcol e un acido", "Due alcheni", "Un'ammina e un estere"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_9`,
        question: "Un carbocatione è:",
        answers: ["Un intermedio con carica negativa", "Un intermedio con carica positiva sul carbonio", "Un radicale libero", "Un nucleofilo"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_5_10`,
        question: "La riduzione di un chetone con NaBH₄ produce:",
        answers: ["Un alcol secondario", "Un alcol primario", "Un'aldeide", "Un acido"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // QUIZ 6: Chimica Organica - Composti
  {
    id: `quiz_organica_composti_${timestamp}`,
    title: "Composti Organici e Gruppi Funzionali",
    subject: "Chimica Organica",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "scienze",
    subcategory: "chimica",
    difficulty: "media",
    questions: [
      {
        id: `q${timestamp}_6_1`,
        question: "Un alcano è un idrocarburo:",
        answers: ["Saturo con solo legami singoli", "Insaturo con doppi legami", "Aromatico", "Con tripli legami"],
        solution: 0,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_2`,
        question: "Il gruppo funzionale degli alcoli è:",
        answers: ["-COOH", "-OH", "-NH₂", "-CHO"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_3`,
        question: "Un etere ha formula generale:",
        answers: ["R-OH", "R-O-R'", "R-COOH", "R-CHO"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_4`,
        question: "Il benzene è un composto:",
        answers: ["Alifatico", "Aromatico", "Eterociclico", "Polimerico"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_5`,
        question: "Le ammine sono derivati dell':",
        answers: ["Acqua", "Ammoniaca", "Metano", "Etere"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_6`,
        question: "Un estere si forma dalla reazione tra:",
        answers: ["Un acido e un alcol", "Due alcoli", "Due acidi", "Un alcol e un alchene"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_7`,
        question: "Il gruppo carbossilico è caratteristico di:",
        answers: ["Alcoli", "Chetoni", "Acidi carbossilici", "Eteri"],
        solution: 2,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_8`,
        question: "Gli alchini contengono:",
        answers: ["Solo legami singoli", "Un legame doppio C=C", "Un legame triplo C≡C", "Anelli aromatici"],
        solution: 2,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_9`,
        question: "Un'ammide ha il gruppo funzionale:",
        answers: ["-NH₂", "-CONH₂", "-NO₂", "-CN"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_6_10`,
        question: "I composti eterociclici contengono:",
        answers: ["Solo atomi di carbonio nell'anello", "Atomi diversi dal carbonio nell'anello", "Solo legami tripli", "Solo gruppi funzionali esterni"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  }
];

// Leggi, aggiungi e salva
const archivePath = path.join(__dirname, '..', 'data', 'quiz-archive.json');
const archiveData = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
archiveData.quizzes.push(...newQuizzes);
archiveData.metadata.totalQuizzes = archiveData.quizzes.length;
archiveData.metadata.totalQuestions = archiveData.quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
archiveData.metadata.lastUpdate = new Date().toISOString();
fs.writeFileSync(archivePath, JSON.stringify(archiveData, null, 2), 'utf8');

console.log(`✅ Aggiunti ${newQuizzes.length} nuovi quiz (parte 2)!`);
console.log(`📊 Totale quiz: ${archiveData.metadata.totalQuizzes}`);
console.log(`📝 Totale domande: ${archiveData.metadata.totalQuestions}`);
