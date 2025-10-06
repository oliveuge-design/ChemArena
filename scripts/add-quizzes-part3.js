const fs = require('fs');
const path = require('path');

const timestamp = Date.now();

const newQuizzes = [
  // QUIZ 7: Tecnologie Chimiche Industriali - Processi
  {
    id: `quiz_tecnologie_processi_${timestamp}`,
    title: "Processi Chimici Industriali",
    subject: "Tecnologie Chimiche Industriali",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "tecnologia",
    subcategory: "chimica_industriale",
    difficulty: "avanzata",
    questions: [
      {
        id: `q${timestamp}_7_1`,
        question: "Il processo Haber-Bosch produce:",
        answers: ["Acido solforico", "Ammoniaca", "Metanolo", "Etilene"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_2`,
        question: "Il cracking catalitico serve a:",
        answers: ["Polimerizzare monomeri", "Spezzare idrocarburi pesanti in frazioni leggere", "Separare miscele", "Neutralizzare acidi"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_3`,
        question: "La distillazione frazionata del petrolio sfrutta:",
        answers: ["Differenze di densità", "Differenze di punti di ebollizione", "Differenze di solubilità", "Differenze di colore"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_4`,
        question: "Il processo di contatto produce:",
        answers: ["Ammoniaca", "Acido solforico", "Acido nitrico", "Soda caustica"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_5`,
        question: "La sintesi del metanolo industriale utilizza:",
        answers: ["CO + H₂", "CO₂ + H₂O", "CH₄ + O₂", "C + H₂O"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_6`,
        question: "Il processo Solvay produce:",
        answers: ["Ammoniaca", "Carbonato di sodio", "Cloro", "Idrogeno"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_7`,
        question: "L'elettrolisi della salamoia produce:",
        answers: ["Ossigeno e idrogeno", "Cloro, idrogeno e soda caustica", "Solo cloro", "Acido cloridrico"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_8`,
        question: "Il reforming catalitico serve a:",
        answers: ["Aumentare il numero di ottani della benzina", "Produrre polimeri", "Raffreddare reattori", "Separare i gas"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_9`,
        question: "La polimerizzazione dell'etilene produce:",
        answers: ["PVC", "Polietilene", "Polistirene", "Nylon"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_7_10`,
        question: "Un catalizzatore in un processo industriale:",
        answers: ["Viene consumato", "Accelera la reazione senza essere consumato", "Rallenta la reazione", "Cambia i prodotti"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // QUIZ 8: Tecnologie Chimiche Industriali - Impianti
  {
    id: `quiz_tecnologie_impianti_${timestamp}`,
    title: "Impianti e Operazioni Unitarie",
    subject: "Tecnologie Chimiche Industriali",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "tecnologia",
    subcategory: "chimica_industriale",
    difficulty: "avanzata",
    questions: [
      {
        id: `q${timestamp}_8_1`,
        question: "Un reattore batch è:",
        answers: ["A flusso continuo", "A caricamento discontinuo", "Sempre adiabatico", "Solo per reazioni esotermiche"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_2`,
        question: "L'operazione unitaria di separazione per distillazione si basa su:",
        answers: ["Differenza di densità", "Differenza di volatilità", "Differenza di solubilità", "Differenza di pH"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_3`,
        question: "Un reattore CSTR è:",
        answers: ["Continuo perfettamente miscelato", "Batch", "Tubolare", "Semi-batch"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_4`,
        question: "L'estrazione liquido-liquido sfrutta:",
        answers: ["Differenze di temperatura", "Differenze di coefficiente di ripartizione", "Differenze di pressione", "Differenze di colore"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_5`,
        question: "Gli scambiatori di calore trasferiscono:",
        answers: ["Massa", "Energia termica", "Momento", "Carica elettrica"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_6`,
        question: "La cristallizzazione è un'operazione di:",
        answers: ["Separazione solido-liquido", "Miscelazione", "Reazione chimica", "Combustione"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_7`,
        question: "Un reattore PFR (Plug Flow Reactor) ha:",
        answers: ["Miscelazione perfetta", "Flusso a pistone senza miscelazione radiale", "Funzionamento batch", "Ricircolo totale"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_8`,
        question: "L'assorbimento gas-liquido rimuove:",
        answers: ["Solidi da liquidi", "Gas da correnti gassose", "Liquidi da solidi", "Ioni da soluzioni"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_9`,
        question: "La filtrazione separa:",
        answers: ["Liquidi immiscibili", "Solidi da liquidi o gas", "Gas da gas", "Ioni da soluzioni"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_8_10`,
        question: "Un'operazione adiabatica:",
        answers: ["Scambia calore con l'esterno", "Non scambia calore con l'esterno", "Avviene a temperatura costante", "Avviene a pressione variabile"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // QUIZ 9: Arduino - Programmazione Base
  {
    id: `quiz_arduino_programmazione_${timestamp}`,
    title: "Programmazione Arduino - Fondamenti",
    subject: "Arduino",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "tecnologia",
    subcategory: "elettronica",
    difficulty: "base",
    questions: [
      {
        id: `q${timestamp}_9_1`,
        question: "La funzione setup() in Arduino viene eseguita:",
        answers: ["Una sola volta all'avvio", "Continuamente nel loop", "Solo quando si preme un pulsante", "Mai"],
        solution: 0,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_2`,
        question: "La funzione loop() in Arduino:",
        answers: ["Si esegue una volta sola", "Si ripete continuamente", "Si esegue solo se chiamata", "Non esiste"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_3`,
        question: "Per configurare un pin come OUTPUT si usa:",
        answers: ["pinMode(pin, OUTPUT)", "setPin(pin, OUTPUT)", "configurePin(pin)", "outputPin(pin)"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_4`,
        question: "La funzione digitalWrite(pin, HIGH) serve a:",
        answers: ["Leggere un valore digitale", "Scrivere 5V sul pin", "Leggere un valore analogico", "Configurare il pin"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_5`,
        question: "La funzione delay(1000) causa:",
        answers: ["Un'attesa di 1 secondo", "Un'attesa di 1 millisecondo", "Un'attesa di 1 microsecondo", "Nessuna attesa"],
        solution: 0,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_6`,
        question: "La comunicazione seriale si inizializza con:",
        answers: ["Serial.start()", "Serial.begin(9600)", "Serial.init()", "Serial.open()"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_7`,
        question: "La funzione analogRead() legge valori da:",
        answers: ["0 a 1023", "0 a 255", "0 a 5V", "0 a 100"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_8`,
        question: "PWM (Pulse Width Modulation) permette di:",
        answers: ["Leggere valori analogici", "Simulare uscite analogiche con segnali digitali", "Comunicare via wireless", "Alimentare il board"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_9`,
        question: "Il pin 13 di Arduino UNO ha:",
        answers: ["Un LED integrato", "Un potenziometro", "Un sensore di temperatura", "Nessun componente"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_9_10`,
        question: "La tensione di alimentazione logica di Arduino UNO è:",
        answers: ["3.3V", "5V", "12V", "9V"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      }
    ]
  },

  // QUIZ 10: Arduino - Sensori e Attuatori
  {
    id: `quiz_arduino_sensori_${timestamp}`,
    title: "Arduino - Sensori e Attuatori",
    subject: "Arduino",
    created: new Date().toISOString().split('T')[0],
    author: "Sistema ChemArena",
    category: "tecnologia",
    subcategory: "elettronica",
    difficulty: "media",
    questions: [
      {
        id: `q${timestamp}_10_1`,
        question: "Un sensore di temperatura DHT11 fornisce anche:",
        answers: ["Pressione", "Umidità", "Luminosità", "Suono"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_2`,
        question: "Un sensore ultrasonico HC-SR04 misura:",
        answers: ["Temperatura", "Distanza", "Luminosità", "pH"],
        solution: 1,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_3`,
        question: "Un servomotore è controllato tramite:",
        answers: ["Segnale PWM", "Tensione analogica pura", "Corrente", "Resistenza"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_4`,
        question: "Un fotoresistore (LDR) varia la sua resistenza in base a:",
        answers: ["Temperatura", "Umidità", "Luminosità", "Pressione"],
        solution: 2,
        time: 20,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_5`,
        question: "Un display LCD 16x2 comunica tipicamente tramite:",
        answers: ["Protocollo I2C o parallelo", "Bluetooth", "Wi-Fi", "Infrarossi"],
        solution: 0,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_6`,
        question: "Un relè permette di:",
        answers: ["Misurare temperatura", "Controllare carichi ad alta potenza con segnali a bassa potenza", "Generare suoni", "Leggere sensori analogici"],
        solution: 1,
        time: 30,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_7`,
        question: "Il sensore PIR rileva:",
        answers: ["Temperatura", "Movimento (infrarossi)", "Gas", "Suono"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_8`,
        question: "Un potenziometro collegato a un pin analogico fornisce:",
        answers: ["Un valore digitale 0 o 1", "Un valore tra 0 e 1023", "Una frequenza PWM", "Una tensione costante"],
        solution: 1,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_9`,
        question: "Il modulo Bluetooth HC-05 permette:",
        answers: ["Comunicazione wireless seriale", "Misurare distanze", "Controllare motori", "Generare suoni"],
        solution: 0,
        time: 25,
        cooldown: 5,
        image: ""
      },
      {
        id: `q${timestamp}_10_10`,
        question: "Un buzzer piezoelettrico può:",
        answers: ["Misurare suoni", "Generare toni audio", "Rilevare vibrazioni", "Tutto quanto sopra"],
        solution: 3,
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

console.log(`✅ Aggiunti ${newQuizzes.length} nuovi quiz finali (Tecnologie + Arduino)!`);
console.log(`📊 Totale quiz: ${archiveData.metadata.totalQuizzes}`);
console.log(`📝 Totale domande: ${archiveData.metadata.totalQuestions}`);
console.log(`\n🎉 COMPLETATI TUTTI I 10 NUOVI QUIZ!`);
