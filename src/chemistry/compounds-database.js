// Database molecole locali - Geometrie accurate da PubChem
export const CHEMISTRY_DB = {
  "H2O": {
    id: "H2O",
    name: "Acqua",
    formula: "H₂O",
    molWeight: 18.015,
    atoms: [
      { element: "O", position: [0, 0, 0], color: "#ff0066", radius: 0.52 },
      { element: "H", position: [0.757, 0.586, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.757, 0.586, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 0, to: 2, type: "single", order: 1 }
    ],
    bondAngle: 104.5,
    bondLength: 0.958,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["stati materia", "legami idrogeno", "polarità", "geometria bent"],
    boilingPoint: 100,
    meltingPoint: 0,
    solubility: "100% miscibile",
    uses: "Solvente universale, essenziale per la vita",
    funFact: "L'angolo di 104.5° tra i legami O-H è dovuto alle due coppie solitarie sull'ossigeno",
    treasureHunt: {
      alchemySymbol: "🜄",
      alchemyName: "Acqua Philosophica",
      alchemyDescription: "Gli alchimisti consideravano l'acqua uno dei 4 elementi primordiali. Associata alla Luna, alla femminilità e alla dissoluzione.",
      relatedMolecules: ["H2O2", "NH3", "CH3OH"],
      discoveries: [
        "🔍 Scopri H₂O₂ (acqua ossigenata) - variante ossidata dell'acqua",
        "🔍 Scopri NH₃ (ammoniaca) - molecola polare simile all'acqua",
        "⚗️ Reazione: 2H₂ + O₂ → 2H₂O (sintesi dell'acqua)"
      ],
      secrets: [
        "💎 L'acqua è l'unica sostanza che si espande congelando",
        "🌊 Il 71% della superficie terrestre è coperta d'acqua",
        "🧬 Il corpo umano è composto dal 60% di acqua"
      ]
    }
  },

  "CH4": {
    id: "CH4",
    name: "Metano",
    formula: "CH₄",
    molWeight: 16.043,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "H", position: [0.629, 0.629, 0.629], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.629, -0.629, 0.629], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.629, 0.629, -0.629], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [0.629, -0.629, -0.629], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 0, to: 2, type: "single", order: 1 },
      { from: 0, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.09,
    category: "organic",
    difficulty: "beginner",
    quizUses: ["geometria tetraedrica", "idrocarburi", "combustibili"],
    boilingPoint: -161,
    meltingPoint: -182,
    solubility: "Poco solubile in acqua",
    uses: "Gas naturale, combustibile, produzione idrogeno",
    funFact: "Geometria tetraedrica perfetta con angoli di 109.5° - esempio VSEPR classico",
    treasureHunt: {
      alchemySymbol: "🜂",
      alchemyName: "Gas delle Paludi",
      alchemyDescription: "Il 'gas infiammabile' scoperto nei paludi. Gli alchimisti lo chiamavano 'spirito delle acque morte'. Associato all'elemento Terra corrotto.",
      relatedMolecules: ["C2H5OH", "CO2", "C6H6"],
      discoveries: [
        "🔍 Scopri C₂H₅OH (etanolo) - catena carbonio più lunga",
        "🔍 Scopri CO₂ - prodotto di combustione del metano",
        "⚗️ Reazione: CH₄ + 2O₂ → CO₂ + 2H₂O (combustione)"
      ],
      secrets: [
        "🔥 Il metano è il principale componente del gas naturale (95%)",
        "🌍 Gas serra 25 volte più potente della CO₂",
        "💨 Prodotto naturale dalla decomposizione organica e dai bovini"
      ]
    }
  },

  "NH3": {
    id: "NH3",
    name: "Ammoniaca",
    formula: "NH₃",
    molWeight: 17.031,
    atoms: [
      { element: "N", position: [0, 0, 0], color: "#ff00ff", radius: 0.38 },
      { element: "H", position: [0.94, 0, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.47, 0.81, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.47, -0.81, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 0, to: 2, type: "single", order: 1 },
      { from: 0, to: 3, type: "single", order: 1 }
    ],
    bondAngle: 107,
    bondLength: 1.01,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["geometria piramidale", "coppia solitaria", "basi"],
    boilingPoint: -33,
    meltingPoint: -78,
    solubility: "Molto solubile in acqua",
    uses: "Fertilizzanti, detergenti, refrigerante",
    funFact: "La coppia solitaria sull'azoto causa la geometria piramidale trigonale",
    treasureHunt: {
      alchemySymbol: "🜔",
      alchemyName: "Spirito Volatile di Sale Ammoniaco",
      alchemyDescription: "Gli alchimisti la estraevano dal sale ammoniaco (cloruro di ammonio). Considerata 'spirito pungente' per l'odore intenso. Associata alla putrefazione e rinascita - fase Nigredo.",
      relatedMolecules: ["H2O", "N2", "CH3OH"],
      discoveries: [
        "🔍 Scopri H₂O - molecola polare simile all'ammoniaca",
        "🔍 Scopri N₂ - azoto molecolare, fonte naturale per sintesi NH₃",
        "⚗️ Reazione di Haber: N₂ + 3H₂ → 2NH₃ (sintesi industriale)",
        "💧 In acqua: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (base debole)"
      ],
      secrets: [
        "🏭 Processo Haber-Bosch: ha rivoluzionato l'agricoltura del XX secolo",
        "🌍 40% del cibo mondiale dipende da fertilizzanti ammoniaci",
        "❄️ Gas refrigerante naturale (R-717), prima dei CFC sintetici",
        "🧬 Base azotata essenziale per DNA e proteine"
      ]
    }
  },

  "CO2": {
    id: "CO2",
    name: "Diossido di Carbonio",
    formula: "CO₂",
    molWeight: 44.01,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [1.16, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-1.16, 0, 0], color: "#ff0066", radius: 0.35 }
    ],
    bonds: [
      { from: 0, to: 1, type: "double", order: 2 },
      { from: 0, to: 2, type: "double", order: 2 }
    ],
    bondAngle: 180,
    bondLength: 1.16,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["geometria lineare", "legami doppi", "gas serra"],
    boilingPoint: -78.5,
    meltingPoint: -56.6,
    solubility: "Solubile in acqua (forma H2CO3)",
    uses: "Fotosintesi, bevande gassate, estintori",
    funFact: "Molecola lineare perfetta (180°) con due legami doppi C=O",
    treasureHunt: {
      alchemySymbol: "🜁",
      alchemyName: "Gas Sylvestre - Spirito del Legno",
      alchemyDescription: "Scoperta come 'aria fissa' da Van Helmont. Gli alchimisti la chiamavano 'spirito selvaggio' o 'gas del legno bruciato'. Associata all'elemento Aria corrotta e alla morte del Fuoco.",
      relatedMolecules: ["O2", "H2O", "C6H12O6"],
      discoveries: [
        "🔍 Scopri O₂ - ossigeno, partner nella combustione e respirazione",
        "🔍 Scopri H₂O - prodotto insieme a CO₂ nella respirazione",
        "🔍 Scopri C₆H₁₂O₆ (glucosio) - fonte energetica che produce CO₂",
        "⚗️ Combustione: CH₄ + 2O₂ → CO₂ + 2H₂O",
        "🌱 Fotosintesi: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂"
      ],
      secrets: [
        "🌍 Principale gas serra: 0.04% atmosfera ma cruciale per effetto serra",
        "🧊 Ghiaccio secco: CO₂ solida a -78.5°C, sublima senza liquido",
        "💨 Nelle bevande: 4 volumi CO₂ dissolti = pressione 4 bar",
        "🔥 Estintori: più densa dell'aria, 'soffoca' il fuoco per privazione O₂"
      ]
    }
  },

  "O2": {
    id: "O2",
    name: "Ossigeno Molecolare",
    formula: "O₂",
    molWeight: 32.00,
    atoms: [
      { element: "O", position: [-0.6, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [0.6, 0, 0], color: "#ff0066", radius: 0.35 }
    ],
    bonds: [
      { from: 0, to: 1, type: "double", order: 2 }
    ],
    bondAngle: 180,
    bondLength: 1.21,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["legami doppi", "respirazione", "ossidazione"],
    boilingPoint: -183,
    meltingPoint: -219,
    solubility: "Poco solubile in acqua",
    uses: "Respirazione, combustione, processi industriali",
    funFact: "Molecola paramagnetica con due elettroni spaiati - unico diatomico con questa proprietà",
    treasureHunt: {
      alchemySymbol: "🜂",
      alchemyName: "Principium Vitae - Aria Vitale",
      alchemyDescription: "Scoperto da Priestley come 'aria deflogisticata'. Gli alchimisti cercavano l'essenza che permetteva la vita. Lavoisier lo battezzò 'ossigeno' (generatore di acidi). Associato al Fuoco e alla vita.",
      relatedMolecules: ["H2O", "CO2", "N2"],
      discoveries: [
        "🔍 Scopri H₂O - ossigeno combinato con idrogeno",
        "🔍 Scopri CO₂ - prodotto dell'ossidazione del carbonio",
        "⚗️ Combustione: 2H₂ + O₂ → 2H₂O (produzione energia)",
        "🫁 Respirazione: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energia"
      ],
      secrets: [
        "🧲 Paramagnetico: unica molecola comune attratta da magneti!",
        "🌍 21% atmosfera terrestre - critico per vita aerobica",
        "🔥 Ozono O₃: forma allotropica che assorbe UV dannosi",
        "💨 Liquido blu pallido a -183°C, usato in razzi criogenici"
      ]
    }
  },

  "N2": {
    id: "N2",
    name: "Azoto Molecolare",
    formula: "N₂",
    molWeight: 28.014,
    atoms: [
      { element: "N", position: [-0.55, 0, 0], color: "#ff00ff", radius: 0.38 },
      { element: "N", position: [0.55, 0, 0], color: "#ff00ff", radius: 0.38 }
    ],
    bonds: [
      { from: 0, to: 1, type: "triple", order: 3 }
    ],
    bondAngle: 180,
    bondLength: 1.10,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["legami tripli", "atmosfera", "inerzia chimica"],
    boilingPoint: -196,
    meltingPoint: -210,
    solubility: "Quasi insolubile in acqua",
    uses: "Atmosfera (78%), fertilizzanti, criogenia",
    funFact: "Legame triplo N≡N estremamente forte (941 kJ/mol) - tra i più forti in chimica",
    treasureHunt: {
      alchemySymbol: "🜄",
      alchemyName: "Azoto - Gas Mephiticum",
      alchemyDescription: "Scoperto da Rutherford come 'aria viziata' che non supporta combustione né vita. Gli alchimisti lo chiamavano 'mofeta' (aria soffocante). Associato all'inerzia e alla morte apparente. Lavoisier: 'generatore di nitro'.",
      relatedMolecules: ["NH3", "O2", "H2O"],
      discoveries: [
        "🔍 Scopri NH₃ - ammoniaca, composto azotato vitale",
        "🔍 Scopri O₂ - ossigeno, suo complemento nell'atmosfera",
        "⚗️ Sintesi Haber: N₂ + 3H₂ → 2NH₃ (fertilizzanti)",
        "💣 Esplosivi: TNT, nitroglicerina - azoto instabile rilascia energia"
      ],
      secrets: [
        "🌍 78% dell'atmosfera terrestre - gas inerte protettivo",
        "⚡ Legame triplo: energia 941 kJ/mol, difficilissimo da rompere",
        "❄️ Azoto liquido: -196°C, criogenia e conservazione cellule",
        "🌱 Ciclo azoto: batteri fissano N₂ per piante (Rhizobium)"
      ]
    }
  },

  "C6H6": {
    id: "C6H6",
    name: "Benzene",
    formula: "C₆H₆",
    molWeight: 78.114,
    atoms: [
      { element: "C", position: [0.866, 0.5, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0, 1, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-0.866, 0.5, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-0.866, -0.5, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0, -1, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0.866, -0.5, 0], color: "#ffff00", radius: 0.40 },
      { element: "H", position: [1.56, 0.9, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [0, 1.8, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-1.56, 0.9, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-1.56, -0.9, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [0, -1.8, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.56, -0.9, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "aromatic", order: 1.5 },
      { from: 1, to: 2, type: "aromatic", order: 1.5 },
      { from: 2, to: 3, type: "aromatic", order: 1.5 },
      { from: 3, to: 4, type: "aromatic", order: 1.5 },
      { from: 4, to: 5, type: "aromatic", order: 1.5 },
      { from: 5, to: 0, type: "aromatic", order: 1.5 },
      { from: 0, to: 6, type: "single", order: 1 },
      { from: 1, to: 7, type: "single", order: 1 },
      { from: 2, to: 8, type: "single", order: 1 },
      { from: 3, to: 9, type: "single", order: 1 },
      { from: 4, to: 10, type: "single", order: 1 },
      { from: 5, to: 11, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.40,
    category: "organic",
    difficulty: "intermediate",
    quizUses: ["aromaticità", "risonanza", "idrocarburi ciclici"],
    boilingPoint: 80,
    meltingPoint: 5.5,
    solubility: "Immiscibile con acqua",
    uses: "Solvente industriale, sintesi chimica, plastica",
    funFact: "Anello aromatico con risonanza perfetta - 6 elettroni π delocalizzati",
    treasureHunt: {
      alchemySymbol: "⬡",
      alchemyName: "Benzolo - Anello di Kekul\u00E9",
      alchemyDescription: "Scoperto nel 1825 da Faraday. Kekul\u00E9 sogn\u00F2 l'Ouroboros (serpente che si morde la coda) e cap\u00EC la struttura ciclica. Gli alchimisti vedevano nel cerchio la perfezione - simbolo dell'Infinito e della Pietra Filosofale.",
      relatedMolecules: ["CH4", "C6H12O6", "C2H5OH"],
      discoveries: [
        "🔍 Scopri CH₄ - metano, idrocarburo semplice non ciclico",
        "🔍 Scopri C₆H₁₂O₆ - glucosio, anche 6 carboni ma diverso",
        "⚗️ Risonanza: 6 elettroni π delocalizzati su anello",
        "💍 Kekulé dream (1865): struttura esagonale da sogno di serpente",
        "🧬 DNA: basi azotate contengono anelli benzenici"
      ],
      secrets: [
        "⬡ Perfetta simmetria esagonale: angoli 120° esatti",
        "🌊 Risonanza quantistica: elettroni π delocalizzati = stabilità",
        "⚠️ Cancerogeno: primo composto organico riconosciuto cancerogeno",
        "🏭 Petrolio: fonte principale, derivato dal cracking catalitico"
      ]
    }
  },

  "CH3OH": {
    id: "CH3OH",
    name: "Metanolo",
    formula: "CH₃OH",
    molWeight: 32.042,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [1.43, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [1.8, 0.8, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, -0.89], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 0, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.43,
    category: "organic",
    difficulty: "intermediate",
    quizUses: ["alcoli", "gruppi funzionali", "legami idrogeno"],
    boilingPoint: 65,
    meltingPoint: -97,
    solubility: "Completamente miscibile con acqua",
    uses: "Combustibile, solvente, antigelo, sintesi chimica",
    funFact: "Il più semplice alcol - gruppo OH conferisce polarità e solubilità in acqua",
    treasureHunt: {
      alchemySymbol: "🍷",
      alchemyName: "Spirito di Legno - Alcol Metilico",
      alchemyDescription: "Distillato dal legno pirolizzato (dry distillation). Gli alchimisti lo chiamavano 'spirito selvaggio del legno' per distinguerlo dallo 'spirito del vino' (etanolo). Veleno potente che causa cecità.",
      relatedMolecules: ["C2H5OH", "H2O", "CH4"],
      discoveries: [
        "🔍 Scopri C₂H₅OH - etanolo, suo 'fratello' con un carbonio in più",
        "🔍 Scopri H₂O - acqua, simile polarità per gruppo OH",
        "⚗️ Ossidazione: CH₃OH + O₂ → HCHO (formaldeide) + H₂O",
        "🌲 Distillazione secca legno: prima fonte industriale"
      ],
      secrets: [
        "☠️ Veleno mortale: 10ml possono causare cecità permanente",
        "🔥 Biodiesel: metanolo + olio vegetale → biodiesel",
        "🏎️ Carburante: Formula 1 e IndyCar (fino anni '90)",
        "🧪 Sintesi: CO + 2H₂ → CH₃OH (processo industriale moderno)"
      ]
    }
  },

  "C2H5OH": {
    id: "C2H5OH",
    name: "Etanolo",
    formula: "C₂H₅OH",
    molWeight: 46.069,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.52, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [2.25, 1.25, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [2.95, 1.6, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.88, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.88, -0.52, -0.89], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 2, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "single", order: 1 },
      { from: 0, to: 6, type: "single", order: 1 },
      { from: 1, to: 7, type: "single", order: 1 },
      { from: 1, to: 8, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.52,
    category: "organic",
    difficulty: "intermediate",
    quizUses: ["alcoli", "fermentazione", "gruppi funzionali"],
    boilingPoint: 78,
    meltingPoint: -114,
    solubility: "Completamente miscibile con acqua",
    uses: "Bevande alcoliche, solvente, disinfettante, biocarburante",
    funFact: "Presente nelle bevande alcoliche - metabolizzato dal fegato a circa 7g/ora",
    treasureHunt: {
      alchemySymbol: "🍇",
      alchemyName: "Spirito del Vino - Aqua Vitae",
      alchemyDescription: "Gli alchimisti medievali distillavano il vino cercando l''essenza della vita' - l'Aqua Vitae. Credevano fosse l'elisir che avvicinava alla Pietra Filosofale. Associato alla gioia, all'estasi e alla trasformazione spirituale.",
      relatedMolecules: ["CH3OH", "C6H12O6", "H2O"],
      discoveries: [
        "🔍 Scopri CH₃OH - metanolo, alcol tossico (mai bere!)",
        "🔍 Scopri C₆H₁₂O₆ - glucosio, fonte per fermentazione alcolica",
        "⚗️ Fermentazione: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ (lieviti)",
        "🍷 Distillazione: aumenta concentrazione da ~15% a 40-95%",
        "💉 Disinfettante: 70% etanolo = optimum antibatterico"
      ],
      secrets: [
        "🧠 Metabolismo: fegato processa 7-10g/ora (1 drink/ora)",
        "🌽 Bioetanolo: E85 = 85% etanolo da mais/canna da zucchero",
        "⚡ Ossidazione: C₂H₅OH → CH₃CHO (acetaldeide) → CH₃COOH (aceto)",
        "🏛️ Più antica droga: fermentazione scoperta 10.000 anni fa in Mesopotamia"
      ]
    }
  },

  "C6H12O6": {
    id: "C6H12O6",
    name: "Glucosio",
    formula: "C₆H₁₂O₆",
    molWeight: 180.156,
    atoms: [
      { element: "C", position: [0.7, 0.4, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0, 1.2, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-0.7, 0.4, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-0.7, -0.8, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0, -1.4, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [0.7, -0.6, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [1.5, 1, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-1.5, 1, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-1.5, -1.4, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [0, -2.8, 0], color: "#ff0066", radius: 0.35 },
      { element: "C", position: [1.5, -0.3, 0], color: "#ffff00", radius: 0.40 },
      { element: "H", position: [2.2, 0.3, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 2, to: 3, type: "single", order: 1 },
      { from: 3, to: 4, type: "single", order: 1 },
      { from: 4, to: 5, type: "single", order: 1 },
      { from: 5, to: 0, type: "single", order: 1 },
      { from: 0, to: 6, type: "single", order: 1 },
      { from: 2, to: 7, type: "single", order: 1 },
      { from: 3, to: 8, type: "single", order: 1 },
      { from: 4, to: 9, type: "single", order: 1 },
      { from: 0, to: 10, type: "single", order: 1 },
      { from: 10, to: 11, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.52,
    category: "organic",
    difficulty: "advanced",
    quizUses: ["carboidrati", "anello piranosico", "chiralità", "biochimica"],
    boilingPoint: 146,
    meltingPoint: 146,
    solubility: "Molto solubile in acqua (909 g/L)",
    uses: "Fonte energia cellulare, fotosintesi, industria alimentare",
    funFact: "Zucchero principale nel sangue - essenziale per produzione ATP tramite respirazione cellulare",
    treasureHunt: {
      alchemySymbol: "🌿",
      alchemyName: "Dulcedo Vitae - Dolcezza della Vita",
      alchemyDescription: "Chiamato 'zucchero d'uva' dai Greci. Gli alchimisti vedevano nel glucosio la trasformazione della luce solare in materia dolce - prova della trasmutazione. Simbolo dell'Opus Alchemicum: Sole (fotosintesi) → Oro Bianco (zucchero).",
      relatedMolecules: ["CO2", "O2", "C2H5OH"],
      discoveries: [
        "🔍 Scopri CO₂ - usato dalle piante per sintetizzare glucosio",
        "🔍 Scopri O₂ - prodotto della fotosintesi insieme al glucosio",
        "🔍 Scopri C₂H₅OH - lieviti fermentano glucosio in alcol",
        "🌱 Fotosintesi: 6CO₂ + 6H₂O + luce → C₆H₁₂O₆ + 6O₂",
        "🫁 Respirazione cellulare: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP"
      ],
      secrets: [
        "🧬 Glicemia: 0.1% sangue (5.5 mmol/L) = equilibrio vitale perfetto",
        "💪 ATP: 1 glucosio → 36-38 molecole ATP (energia cellulare)",
        "🌽 Amido: polimero di glucosio, riserva energetica piante",
        "🧠 Cervello: consuma 120g glucosio/giorno (60% del totale corpo)",
        "🍯 Miele: 80% glucosio + fruttosio, forma naturale più pura"
      ]
    }
  },

  "C3H8": {
    id: "C3H8",
    name: "Propano",
    formula: "C₃H₈",
    molWeight: 44.096,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.52, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [3.04, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "H", position: [-0.36, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.52, 0.61, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.52, 0.61, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [3.40, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [3.40, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [3.40, -0.52, -0.89], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 0, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "single", order: 1 },
      { from: 1, to: 6, type: "single", order: 1 },
      { from: 1, to: 7, type: "single", order: 1 },
      { from: 2, to: 8, type: "single", order: 1 },
      { from: 2, to: 9, type: "single", order: 1 },
      { from: 2, to: 10, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.52,
    category: "organic",
    difficulty: "beginner",
    quizUses: ["idrocarburi", "alcani", "GPL"],
    boilingPoint: -42,
    meltingPoint: -188,
    solubility: "Insolubile in acqua",
    uses: "GPL, riscaldamento, cucina, refrigerante",
    funFact: "Principale componente del GPL insieme al butano",
    treasureHunt: {
      alchemySymbol: "🔥",
      alchemyName: "Gas Liquefatto - Fuoco Compresso",
      alchemyDescription: "Gli alchimisti cercavano di 'imprigionare' il fuoco. Il propano realizza questo sogno: gas infiammabile compresso in forma liquida. Simbolo del dominio umano sull'elemento Fuoco.",
      relatedMolecules: ["CH4", "C4H10", "C2H5OH"],
      discoveries: [
        "🔍 Scopri CH₄ (metano) - alcano più semplice, 1 carbonio",
        "🔍 Scopri C₄H₁₀ (butano) - alcano successivo, 4 carboni",
        "⚗️ Combustione: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O + energia",
        "🏭 Cracking petrolio: idrocarburi lunghi → propano + altri gas"
      ],
      secrets: [
        "🔥 GPL (Gas Petrolio Liquefatto): 60% propano, 40% butano",
        "❄️ Liquido a -42°C o 8 bar di pressione a temperatura ambiente",
        "🚗 Autotrazione: alternativa ecologica a benzina (meno CO e particolato)",
        "🌊 Più pesante dell'aria: pericoloso in ambienti chiusi (si accumula in basso)"
      ]
    }
  },

  "H2O2": {
    id: "H2O2",
    name: "Perossido di Idrogeno",
    formula: "H₂O₂",
    molWeight: 34.015,
    atoms: [
      { element: "O", position: [-0.7, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [0.7, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [-1.1, 0.9, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.1, 0, 0.9], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 0, to: 2, type: "single", order: 1 },
      { from: 1, to: 3, type: "single", order: 1 }
    ],
    bondAngle: 94.8,
    bondLength: 1.48,
    category: "inorganic",
    difficulty: "intermediate",
    quizUses: ["ossidanti", "perossidi", "radicali"],
    boilingPoint: 150,
    meltingPoint: -0.43,
    solubility: "Miscibile con acqua",
    uses: "Disinfettante, sbiancante, propellente razzi",
    funFact: "Molecola instabile che si decompone in H₂O + O₂ rilasciando energia",
    treasureHunt: {
      alchemySymbol: "💧",
      alchemyName: "Acqua Ossigenata - Aqua Ignea",
      alchemyDescription: "Gli alchimisti la chiamavano 'acqua di fuoco'. Simile all'acqua ma con potere ossidante. Simbolo della trasformazione e purificazione attraverso l'ossidazione.",
      relatedMolecules: ["H2O", "O2"],
      discoveries: [
        "🔍 Scopri H₂O - acqua normale, versione ridotta",
        "🔍 Scopri O₂ - ossigeno molecolare, prodotto decomposizione",
        "⚗️ Decomposizione: 2H₂O₂ → 2H₂O + O₂ (catalizzata da MnO₂)"
      ],
      secrets: [
        "💥 Instabile: si decompone spontaneamente (più veloce con luce/calore)",
        "🚀 Propellente: usata nei razzi (concentrazione 90%+)",
        "🦠 Disinfettante: 3% soluzione uccide batteri per ossidazione",
        "👱 Biondo ossigenato: decolorante capelli per ossidazione melanina"
      ]
    }
  },

  "NaCl": {
    id: "NaCl",
    name: "Cloruro di Sodio",
    formula: "NaCl",
    molWeight: 58.443,
    atoms: [
      { element: "Na", position: [-1.4, 0, 0], color: "#ff6b00", radius: 0.97 },
      { element: "Cl", position: [1.4, 0, 0], color: "#00ff99", radius: 0.99 }
    ],
    bonds: [
      { from: 0, to: 1, type: "ionic", order: 1 }
    ],
    bondAngle: 180,
    bondLength: 2.8,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["legame ionico", "sali", "elettronegatività"],
    boilingPoint: 1465,
    meltingPoint: 801,
    solubility: "Molto solubile in acqua (360 g/L)",
    uses: "Sale da cucina, conservante alimentare, industria chimica",
    funFact: "Legame ionico classico: Na+ dona 1 elettrone a Cl- formando ioni stabili",
    treasureHunt: {
      alchemySymbol: "🧂",
      alchemyName: "Sal Commune - Sale della Vita",
      alchemyDescription: "Per gli alchimisti il sale era uno dei 3 principi fondamentali (Zolfo-Mercurio-Sale). Rappresentava il corpo, la materialità, la fissazione. Il 'Sal Sapientiae' simboleggiava la saggezza cristallizzata.",
      relatedMolecules: ["H2O", "HCl", "NaOH"],
      discoveries: [
        "🔍 Scopri H₂O - il sale si dissolve ionizzandosi in acqua",
        "🔍 Scopri HCl - acido cloridrico, fonte di ione Cl-",
        "🔍 Scopri NaOH - soda caustica, fonte di ione Na+",
        "⚗️ Dissociazione: NaCl → Na+ + Cl- (in acqua)",
        "⚡ Elettrolisi: 2NaCl → 2Na + Cl₂ (fuso)"
      ],
      secrets: [
        "💎 Cristalli cubici: reticolo ionico perfettamente ordinato",
        "🌊 Oceani: 3.5% salinità, 35g/L di sali (principalmente NaCl)",
        "🧠 Essenziale per vita: bilancio osmotico, impulsi nervosi",
        "🏛️ Moneta romana: 'salario' deriva da pagamento in sale",
        "❄️ Disgelo stradale: abbassa punto congelamento acqua a -21°C"
      ]
    }
  },

  "HCl": {
    id: "HCl",
    name: "Acido Cloridrico",
    formula: "HCl",
    molWeight: 36.461,
    atoms: [
      { element: "H", position: [-1.27, 0, 0], color: "#00ffff", radius: 0.31 },
      { element: "Cl", position: [1.27, 0, 0], color: "#00ff99", radius: 0.99 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 }
    ],
    bondAngle: 180,
    bondLength: 1.27,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["acidi forti", "pH", "legame covalente polare"],
    boilingPoint: -85,
    meltingPoint: -114,
    solubility: "Molto solubile in acqua (720 g/L)",
    uses: "Acido muriatico, pulizia industriale, digestione gastrica",
    funFact: "Componente principale del succo gastrico (0.5% concentrazione nello stomaco)",
    treasureHunt: {
      alchemySymbol: "🜖",
      alchemyName: "Spirito di Sale - Acidum Salis",
      alchemyDescription: "Scoperto dagli alchimisti arabi distillando sale e vetriolo. Lo chiamavano 'spirito di sale' o 'acido muriatico'. Potente dissolvitore, simbolo della fase Solutio (dissoluzione alchemica).",
      relatedMolecules: ["NaCl", "H2O", "Cl2"],
      discoveries: [
        "🔍 Scopri NaCl - sale da cucina, reagisce con H₂SO₄ per produrre HCl",
        "🔍 Scopri H₂O - in acqua HCl si ionizza completamente",
        "⚗️ Sintesi: H₂ + Cl₂ → 2HCl (combustione idrogeno in cloro)",
        "🧪 Ionizzazione: HCl → H+ + Cl- (acido forte, 100%)",
        "🍋 pH 0: soluzione concentrata, estremamente acida"
      ],
      secrets: [
        "🦠 Stomaco: 0.5% HCl uccide batteri e attiva pepsina",
        "🏭 Industria: pulizia metalli, decapaggio acciaio",
        "⚠️ Corrosivo: attacca metalli liberando H₂ gas",
        "💨 Fumi: in aria umida forma nebbia di HCl acquoso",
        "🧬 Laboratorio: titolazioni, sintesi organiche, idrolisi"
      ]
    }
  },

  "NaOH": {
    id: "NaOH",
    name: "Idrossido di Sodio",
    formula: "NaOH",
    molWeight: 39.997,
    atoms: [
      { element: "Na", position: [-1.8, 0, 0], color: "#ff6b00", radius: 0.97 },
      { element: "O", position: [0.6, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [1.5, 0, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "ionic", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 }
    ],
    bondAngle: 180,
    bondLength: 1.9,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["basi forti", "pH", "idrossidi"],
    boilingPoint: 1388,
    meltingPoint: 318,
    solubility: "Molto solubile in acqua (1110 g/L)",
    uses: "Soda caustica, saponificazione, industria chimica",
    funFact: "Base forte igroscopica - assorbe umidità e CO₂ dall'aria formando carbonati",
    treasureHunt: {
      alchemySymbol: "🜔",
      alchemyName: "Soda Caustica - Alkali Minerale",
      alchemyDescription: "Gli alchimisti la ottenevano dalle ceneri vegetali (alkali = cenere in arabo). Chiamata 'lisciva caustica', era usata per purificare e trasformare. Simbolo della fase Albedo (sbiancamento, purificazione).",
      relatedMolecules: ["NaCl", "H2O", "HCl"],
      discoveries: [
        "🔍 Scopri NaCl - elettrolisi salina produce NaOH",
        "🔍 Scopri H₂O - in acqua forma ioni OH- fortemente basici",
        "🔍 Scopri HCl - neutralizzazione: HCl + NaOH → NaCl + H₂O",
        "⚗️ Elettrolisi: 2NaCl + 2H₂O → 2NaOH + H₂ + Cl₂",
        "🧼 Saponificazione: grasso + NaOH → sapone + glicerina"
      ],
      secrets: [
        "🧼 Sapone: reazione con grassi animali/vegetali da 5000 anni",
        "⚠️ Caustica: dissolve tessuti organici (proteina → amminoacidi)",
        "🏭 Produzione mondiale: 70 milioni tonnellate/anno",
        "📜 Carta: processo Kraft usa NaOH per separare lignina",
        "🍕 Pretzel: lavaggio in NaOH diluita crea crosta croccante"
      ]
    }
  },

  "C4H10": {
    id: "C4H10",
    name: "Butano",
    formula: "C₄H₁₀",
    molWeight: 58.122,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.52, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [3.04, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [4.56, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "H", position: [-0.36, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.52, 0.61, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [1.52, 0.61, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [3.04, 0.61, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [3.04, 0.61, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [4.92, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [4.92, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [4.92, -0.52, -0.89], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 2, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "single", order: 1 },
      { from: 0, to: 6, type: "single", order: 1 },
      { from: 1, to: 7, type: "single", order: 1 },
      { from: 1, to: 8, type: "single", order: 1 },
      { from: 2, to: 9, type: "single", order: 1 },
      { from: 2, to: 10, type: "single", order: 1 },
      { from: 3, to: 11, type: "single", order: 1 },
      { from: 3, to: 12, type: "single", order: 1 },
      { from: 3, to: 13, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.52,
    category: "organic",
    difficulty: "beginner",
    quizUses: ["isomeria", "alcani", "GPL"],
    boilingPoint: -0.5,
    meltingPoint: -138,
    solubility: "Insolubile in acqua",
    uses: "GPL, accendini, refrigerante, aerosol",
    funFact: "Esistono 2 isomeri: n-butano (lineare) e isobutano (ramificato)",
    treasureHunt: {
      alchemySymbol: "🔥",
      alchemyName: "Gas Liquefatto - Catena del Fuoco",
      alchemyDescription: "Quarto della serie alcani. Gli alchimisti osservavano che allungando la catena carboniosa si ottenevano proprietà diverse. Il butano rappresenta la soglia tra gas e liquidi a temperatura ambiente.",
      relatedMolecules: ["C3H8", "CH4", "C2H5OH"],
      discoveries: [
        "🔍 Scopri C₃H₈ (propano) - alcano con 3 carboni, più volatile",
        "🔍 Scopri CH₄ (metano) - capostipite alcani, 1 carbonio",
        "⚗️ Combustione: 2C₄H₁₀ + 13O₂ → 8CO₂ + 10H₂O",
        "🔄 Isomeria: n-butano (lineare) vs iso-butano (ramificato)"
      ],
      secrets: [
        "🔥 GPL: 40% butano, 60% propano (miscela ideale)",
        "🔆 Accendini: liquido sotto pressione, vaporizza all'uso",
        "❄️ Liquefa a -0.5°C o 2 bar (più facile del propano)",
        "🧊 Refrigerante naturale R-600a (isobutano in frigoriferi moderni)",
        "🏕️ Campeggio: bombole portatili, fornelli da campo"
      ]
    }
  },

  "CH3COCH3": {
    id: "CH3COCH3",
    name: "Acetone",
    formula: "C₃H₆O",
    molWeight: 58.08,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.52, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [2.25, 1.2, 0], color: "#ff0066", radius: 0.35 },
      { element: "C", position: [2.25, -1.2, 0], color: "#ffff00", radius: 0.40 },
      { element: "H", position: [-0.36, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [2.61, -1.76, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [2.61, -1.76, -0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [2.61, -1.76, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "double", order: 2 },
      { from: 1, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "single", order: 1 },
      { from: 0, to: 6, type: "single", order: 1 },
      { from: 3, to: 7, type: "single", order: 1 },
      { from: 3, to: 8, type: "single", order: 1 },
      { from: 3, to: 9, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.52,
    category: "organic",
    difficulty: "intermediate",
    quizUses: ["chetoni", "gruppi funzionali", "solventi"],
    boilingPoint: 56,
    meltingPoint: -95,
    solubility: "Miscibile con acqua",
    uses: "Solvente per smalto unghie, plastiche, vernici",
    funFact: "Più semplice chetone - gruppo carbonilico C=O tra due gruppi metilici",
    treasureHunt: {
      alchemySymbol: "💅",
      alchemyName: "Spirito Acetonico - Essenza Volatile",
      alchemyDescription: "Scoperto dalla distillazione secca dell'acetato di calcio. Gli alchimisti lo chiamavano 'spirito del legno dolce'. Solvente universale per sostanze organiche, simbolo della dissoluzione non acquosa.",
      relatedMolecules: ["C2H5OH", "CH3COOH", "CH3OH"],
      discoveries: [
        "🔍 Scopri C₂H₅OH (etanolo) - ossidazione produce acetone",
        "🔍 Scopri CH₃COOH (acido acetico) - struttura correlata",
        "⚗️ Sintesi industriale: cumene process (da benzene + propilene)",
        "🔬 Reazione: 2-propanolo + ossidazione → acetone + H₂O"
      ],
      secrets: [
        "💅 Solvente: rimuove smalto unghie dissolvendo polimeri",
        "🏭 Produzione: 6 milioni tonnellate/anno worldwide",
        "🧪 Laboratorio: solvente apolare-polare, miscibile con acqua e oli",
        "⚡ Volatile: punto ebollizione 56°C, evapora rapidamente",
        "🩺 Metabolismo: chetosi produce acetone (respiro fruttato diabetici)"
      ]
    }
  },

  "HCHO": {
    id: "HCHO",
    name: "Formaldeide",
    formula: "CH₂O",
    molWeight: 30.026,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [1.2, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [-0.6, 0.9, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.6, -0.9, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "double", order: 2 },
      { from: 0, to: 2, type: "single", order: 1 },
      { from: 0, to: 3, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.2,
    category: "organic",
    difficulty: "intermediate",
    quizUses: ["aldeidi", "gruppi carbonilici", "conservanti"],
    boilingPoint: -19,
    meltingPoint: -92,
    solubility: "Molto solubile in acqua (400 g/L)",
    uses: "Conservante (formalina), resine, disinfettante",
    funFact: "Più semplice aldeide - gas pungente usato come conservante in soluzione acquosa (formalina 37%)",
    treasureHunt: {
      alchemySymbol: "⚗️",
      alchemyName: "Aldeide Formica - Spiritus Formicae",
      alchemyDescription: "Scoperta dalla distillazione delle formiche (acido formico + ossidazione). Nome deriva dal latino 'formica'. Gli alchimisti vedevano nella formaldeide il potere di 'fermare il tempo' (conservazione tessuti).",
      relatedMolecules: ["CH3OH", "CH3CHO", "HCOOH"],
      discoveries: [
        "🔍 Scopri CH₃OH (metanolo) - ossidazione produce formaldeide",
        "🔍 Scopri CH₃CHO (acetaldeide) - aldeide successiva (2C)",
        "⚗️ Ossidazione: CH₃OH + ½O₂ → HCHO + H₂O",
        "🔬 Polimerizzazione: nHCHO → (CH₂O)n (polimeri)"
      ],
      secrets: [
        "🧫 Formalina: soluzione 37% in acqua, conserva tessuti biologici",
        "🏗️ Resine: formaldeide + fenolo → bachelite (prima plastica)",
        "⚠️ Cancerogena: IARC gruppo 1, evitare inalazione prolungata",
        "🪵 Legno: colle MDF/truciolato rilasciano formaldeide",
        "🧬 Fissativo: cross-linking proteine preserva struttura cellulare"
      ]
    }
  },

  "CH3COOH": {
    id: "CH3COOH",
    name: "Acido Acetico",
    formula: "CH₃COOH",
    molWeight: 60.052,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.52, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [2.1, 1.1, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [2.1, -1.1, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [2.8, -1.6, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, -0.89], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "double", order: 2 },
      { from: 1, to: 3, type: "single", order: 1 },
      { from: 3, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "single", order: 1 },
      { from: 0, to: 6, type: "single", order: 1 },
      { from: 0, to: 7, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.52,
    category: "organic",
    difficulty: "intermediate",
    quizUses: ["acidi carbossilici", "fermentazione", "gruppi funzionali"],
    boilingPoint: 118,
    meltingPoint: 17,
    solubility: "Miscibile con acqua",
    uses: "Aceto (5%), conservante alimentare, sintesi chimica",
    funFact: "Gruppo carbossilico -COOH rende la molecola acida (pH ~2.4 soluzione 5%)",
    treasureHunt: {
      alchemySymbol: "🍶",
      alchemyName: "Acetum - Spirito Acido del Vino",
      alchemyDescription: "L'aceto era conosciuto fin dall'antichità. Gli alchimisti lo chiamavano 'acetum philosophorum'. Prodotto dalla fermentazione acetica del vino, rappresentava la trasformazione dello spirito (alcol) in acido.",
      relatedMolecules: ["C2H5OH", "CH3CHO"],
      discoveries: [
        "🔍 Scopri C₂H₅OH (etanolo) - precursore dell'acido acetico",
        "🔍 Scopri CH₃CHO (acetaldeide) - intermedio nella fermentazione",
        "⚗️ Fermentazione acetica: C₂H₅OH + O₂ → CH₃COOH + H₂O",
        "💧 In acqua: CH₃COOH ⇌ CH₃COO⁻ + H⁺ (acido debole)"
      ],
      secrets: [
        "🍷 Aceto: 5-8% acido acetico da fermentazione batterica (Acetobacter)",
        "🧊 Acido acetico glaciale: 99% concentrato, cristallizza a 16.6°C",
        "🥒 Conservante: pH basso inibisce crescita batterica",
        "🏭 Industria: sintesi aspirina, acetato di cellulosa, solventi"
      ]
    }
  },

  "CH3CHO": {
    id: "CH3CHO",
    name: "Acetaldeide",
    formula: "CH₃CHO",
    molWeight: 44.053,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.52, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [2.3, 1.1, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [2.0, -0.6, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, 1.03, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, 0.89], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.36, -0.52, -0.89], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "double", order: 2 },
      { from: 1, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "single", order: 1 },
      { from: 0, to: 6, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.52,
    category: "organic",
    difficulty: "intermediate",
    quizUses: ["aldeidi", "metabolismo alcol", "gruppi carbonilici"],
    boilingPoint: 20,
    meltingPoint: -123,
    solubility: "Miscibile con acqua",
    uses: "Sintesi chimica, aromi alimentari, produzione resine",
    funFact: "Intermedio tossico nel metabolismo dell'etanolo - causa postumi sbornia",
    treasureHunt: {
      alchemySymbol: "⚗️",
      alchemyName: "Spirito Acetico Volatile",
      alchemyDescription: "Scoperta nella distillazione dell'alcol. Gli alchimisti notavano lo 'spirito volatile' tra alcol e aceto. Rappresenta la fase di transizione nella Grande Opera della fermentazione.",
      relatedMolecules: ["C2H5OH", "CH3COOH", "HCHO"],
      discoveries: [
        "🔍 Scopri C₂H₅OH - etanolo, si ossida in acetaldeide",
        "🔍 Scopri CH₃COOH - acido acetico, prodotto finale ossidazione",
        "🔍 Scopri HCHO - formaldeide, aldeide più semplice",
        "⚗️ Ossidazione etanolo: C₂H₅OH + ½O₂ → CH₃CHO + H₂O",
        "⚗️ Ossidazione acetaldeide: CH₃CHO + ½O₂ → CH₃COOH"
      ],
      secrets: [
        "🍺 Postumi sbornia: acetaldeide è 10-30× più tossica dell'etanolo",
        "🧬 ALDH: enzima aldeide deidrogenasi metabolizza acetaldeide",
        "🔴 Asian flush: mutazione ALDH causa accumulo acetaldeide → rossore",
        "⚠️ Cancerogeno: IARC gruppo 1, derivato da metabolismo alcol",
        "🍎 Mele: aroma caratteristico contiene acetaldeide"
      ]
    }
  },

  "H2SO4": {
    id: "H2SO4",
    name: "Acido Solforico",
    formula: "H₂SO₄",
    molWeight: 98.079,
    atoms: [
      { element: "S", position: [0, 0, 0], color: "#ffff00", radius: 0.45 },
      { element: "O", position: [1.4, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.7, 1.2, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.7, -0.6, 1.0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.7, -0.6, -1.0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [2.0, 0.7, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-1.1, -1.0, 1.7], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "double", order: 2 },
      { from: 0, to: 2, type: "double", order: 2 },
      { from: 0, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 1, to: 5, type: "single", order: 1 },
      { from: 4, to: 6, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.54,
    category: "inorganic",
    difficulty: "advanced",
    quizUses: ["acidi forti", "ossiacidi", "geometria tetraedrica"],
    boilingPoint: 337,
    meltingPoint: 10,
    solubility: "Miscibile con acqua (reazione esotermica violenta)",
    uses: "Industria chimica, batterie, fertilizzanti, raffinerie",
    funFact: "Acido più prodotto al mondo - indicatore sviluppo industriale di un paese",
    treasureHunt: {
      alchemySymbol: "🜍",
      alchemyName: "Vitriolum - Olio di Vetriolo",
      alchemyDescription: "Gli alchimisti lo chiamavano 'Spirito di Vetriolo' o 'Olio di Vetriolo'. Ottenuto per distillazione del vetriolo verde (solfato ferroso). Considerato lo spirito più potente - dissolveva quasi tutto.",
      relatedMolecules: ["HNO3", "HCl"],
      discoveries: [
        "🔍 Scopri HNO₃ - acido nitrico, altro acido forte",
        "🔍 Scopri HCl - acido cloridrico, acido minerale",
        "⚗️ Aqua regia: H₂SO₄ + HNO₃ dissolve metalli nobili",
        "💧 In acqua: H₂SO₄ → H⁺ + HSO₄⁻ → 2H⁺ + SO₄²⁻ (diacido forte)"
      ],
      secrets: [
        "🏭 Produzione mondiale: 200+ milioni tonnellate/anno",
        "🔋 Batterie piombo-acido: 30-35% H₂SO₄ concentrato",
        "⚠️ Disidratante: toglie H₂O da composti (carbonizza zucchero)",
        "🔥 Esotermico: diluizione rilascia calore (MAI acqua su acido!)",
        "📊 Indice Industriale: consumo H₂SO₄ = sviluppo economico paese"
      ]
    }
  },

  "HNO3": {
    id: "HNO3",
    name: "Acido Nitrico",
    formula: "HNO₃",
    molWeight: 63.012,
    atoms: [
      { element: "N", position: [0, 0, 0], color: "#ff00ff", radius: 0.38 },
      { element: "O", position: [1.2, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.6, 1.0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.6, -1.0, 0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [1.8, 0.7, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 0, to: 2, type: "double", order: 2 },
      { from: 0, to: 3, type: "single", order: 1 },
      { from: 1, to: 4, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.21,
    category: "inorganic",
    difficulty: "advanced",
    quizUses: ["acidi forti", "ossidanti", "risonanza"],
    boilingPoint: 83,
    meltingPoint: -42,
    solubility: "Miscibile con acqua",
    uses: "Fertilizzanti, esplosivi, produzione nitrati",
    funFact: "Acido ossidante forte - 'acqua forte' per incisione metalli",
    treasureHunt: {
      alchemySymbol: "🜄",
      alchemyName: "Aqua Fortis - Acqua Forte",
      alchemyDescription: "Gli alchimisti lo chiamavano 'Aqua Fortis' per il potere di dissolvere argento. Usato per separare oro da argento (processo quartazione). Simbolo del potere dissolvente dell'alchimia.",
      relatedMolecules: ["H2SO4", "N2"],
      discoveries: [
        "🔍 Scopri H₂SO₄ - acido solforico, serve per produrre HNO₃",
        "🔍 Scopri N₂ - azoto atmosferico, fonte per sintesi",
        "⚗️ Aqua regia: HNO₃ + 3HCl dissolve oro e platino",
        "⚗️ Processo Ostwald: NH₃ + O₂ → HNO₃ (sintesi industriale)"
      ],
      secrets: [
        "💰 Quartazione: HNO₃ dissolve argento ma non oro (purificazione)",
        "💥 Esplosivi: TNT, nitroglicerina da nitrazione con HNO₃",
        "🌱 Fertilizzanti: 80% HNO₃ → nitrato di ammonio (NH₄NO₃)",
        "🧪 Reazione xantoproteica: HNO₃ + proteine → giallo (test)",
        "⚠️ Fuma all'aria: HNO₃ concentrato rilascia vapori NO₂ (rossi)"
      ]
    }
  },

  "CaCO3": {
    id: "CaCO3",
    name: "Carbonato di Calcio",
    formula: "CaCO₃",
    molWeight: 100.087,
    atoms: [
      { element: "Ca", position: [0, 1.5, 0], color: "#00ff99", radius: 0.55 },
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [1.2, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.6, -1.0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.6, 0, 1.0], color: "#ff0066", radius: 0.35 }
    ],
    bonds: [
      { from: 1, to: 2, type: "double", order: 2 },
      { from: 1, to: 3, type: "single", order: 1 },
      { from: 1, to: 4, type: "single", order: 1 },
      { from: 0, to: 1, type: "ionic", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.28,
    category: "inorganic",
    difficulty: "intermediate",
    quizUses: ["sali", "minerali", "ciclo del carbonio"],
    boilingPoint: 898,
    meltingPoint: 825,
    solubility: "Poco solubile (0.013 g/L)",
    uses: "Calcare, gesso, cemento, gusci, antiacido",
    funFact: "Forma rocce sedimentarie e gusci di molluschi - principale riserva carbonio Terra",
    treasureHunt: {
      alchemySymbol: "🐚",
      alchemyName: "Calx - Pietra Calcarea Filosofale",
      alchemyDescription: "Il calcare era noto agli alchimisti come 'terra calcarea'. Riscaldato produceva calce viva (CaO) che reagiva violentemente con acqua. Simbolo di trasformazione pietra → polvere → pietra.",
      relatedMolecules: ["CO2", "NaHCO3"],
      discoveries: [
        "🔍 Scopri CO₂ - prodotto della decomposizione termica",
        "🔍 Scopri NaHCO₃ - bicarbonato, carbonato simile",
        "⚗️ Decomposizione: CaCO₃ → CaO + CO₂ (calcinazione >825°C)",
        "💧 Con acido: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂ (effervescenza)"
      ],
      secrets: [
        "🏔️ Rocce: calcari, marmi, gesso formati da depositi marini",
        "🐚 Biomineralizzazione: coralli e molluschi costruiscono gusci CaCO₃",
        "🌊 Ciclo del carbonio: oceani contengono 100.000 Gt di carbonio come CaCO₃",
        "💊 Antiacido: neutralizza HCl gastrico (Tums, Rolaids)",
        "🏗️ Cemento: CaCO₃ + argilla → clinker Portland (calcinato)"
      ]
    }
  },

  "NaHCO3": {
    id: "NaHCO3",
    name: "Bicarbonato di Sodio",
    formula: "NaHCO₃",
    molWeight: 84.007,
    atoms: [
      { element: "Na", position: [0, 1.8, 0], color: "#ff00ff", radius: 0.53 },
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [1.2, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.6, -1.0, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.6, 0, 1.0], color: "#ff0066", radius: 0.35 },
      { element: "H", position: [1.7, 0.8, 0], color: "#00ffff", radius: 0.31 }
    ],
    bonds: [
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 1, to: 3, type: "double", order: 2 },
      { from: 1, to: 4, type: "single", order: 1 },
      { from: 2, to: 5, type: "single", order: 1 },
      { from: 0, to: 1, type: "ionic", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.28,
    category: "inorganic",
    difficulty: "intermediate",
    quizUses: ["tamponi", "basi deboli", "effervescenza"],
    boilingPoint: 851,
    meltingPoint: 50,
    solubility: "Solubile (96 g/L)",
    uses: "Lievito chimico, antiacido, pulizia, estintori",
    funFact: "Lievito chimico: rilascia CO₂ con acidi o calore",
    treasureHunt: {
      alchemySymbol: "🧁",
      alchemyName: "Sal di Soda - Natron Filosofico",
      alchemyDescription: "Il natron era usato dagli Egizi per mummificazione. Gli alchimisti lo chiamavano 'sale alcalino'. Simbolo di purificazione e conservazione.",
      relatedMolecules: ["CaCO3", "CO2", "NaOH"],
      discoveries: [
        "🔍 Scopri CaCO₃ - carbonato di calcio, struttura simile",
        "🔍 Scopri CO₂ - prodotto decomposizione termica",
        "⚗️ Reazione acido: NaHCO₃ + HCl → NaCl + H₂O + CO₂↑",
        "🔥 Decomposizione: 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂"
      ],
      secrets: [
        "🧁 Lievito: reagisce con acidi (limone, yogurt) → CO₂ solleva impasto",
        "💊 Antiacido: neutralizza HCl gastrico (Alka-Seltzer)",
        "🧹 Pulizia: abrasivo delicato + deodorante (assorbe odori)",
        "🔥 Estintori: rilascia CO₂ che soffoca fiamme",
        "🦷 Dentifricio: sbiancante e neutralizza acidi batterici"
      ]
    }
  },

  "NH4Cl": {
    id: "NH4Cl",
    name: "Cloruro di Ammonio",
    formula: "NH₄Cl",
    molWeight: 53.491,
    atoms: [
      { element: "N", position: [0, 0, 0], color: "#ff00ff", radius: 0.38 },
      { element: "H", position: [0.9, 0, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.45, 0.78, 0], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.45, -0.39, 0.67], color: "#00ffff", radius: 0.31 },
      { element: "H", position: [-0.45, -0.39, -0.67], color: "#00ffff", radius: 0.31 },
      { element: "Cl", position: [2.5, 0, 0], color: "#00ff99", radius: 0.50 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 0, to: 2, type: "single", order: 1 },
      { from: 0, to: 3, type: "single", order: 1 },
      { from: 0, to: 4, type: "single", order: 1 },
      { from: 0, to: 5, type: "ionic", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.01,
    category: "inorganic",
    difficulty: "intermediate",
    quizUses: ["sali", "ioni complessi", "sublimazione"],
    boilingPoint: 520,
    meltingPoint: 338,
    solubility: "Molto solubile (383 g/L)",
    uses: "Batterie, saldature, liquirizia salata, fertilizzanti",
    funFact: "Sublima direttamente da solido a gas (come ghiaccio secco)",
    treasureHunt: {
      alchemySymbol: "🧂",
      alchemyName: "Sal Ammoniaco - Sale dei Filosofi",
      alchemyDescription: "Il sale ammoniaco era prezioso per gli alchimisti. Estratto da sterco di cammello o fuliggine. Usato per saldare metalli e purificare oro. Simbolo della volatilità e sublimazione.",
      relatedMolecules: ["NH3", "HCl", "NaCl"],
      discoveries: [
        "🔍 Scopri NH₃ - ammoniaca, base che forma NH₄Cl",
        "🔍 Scopri HCl - acido cloridrico, reagisce con NH₃",
        "⚗️ Sintesi: NH₃ + HCl → NH₄Cl (nube bianca)",
        "🔥 Sublimazione: NH₄Cl(s) → NH₄Cl(g) (senza liquido)"
      ],
      secrets: [
        "⚡ Batterie: elettrolita in pile zinco-carbone (pile comuni)",
        "🔧 Saldatura: flux che pulisce ossidi da metalli",
        "🍬 Liquirizia: liquirizia salata scandinava contiene NH₄Cl",
        "💨 Sublima: 337°C passa da solido a gas direttamente",
        "🌾 Fertilizzante azotato: fonte N solubile per piante"
      ]
    }
  },

  "KCl": {
    id: "KCl",
    name: "Cloruro di Potassio",
    formula: "KCl",
    molWeight: 74.551,
    atoms: [
      { element: "K", position: [-1.2, 0, 0], color: "#ff33cc", radius: 0.60 },
      { element: "Cl", position: [1.2, 0, 0], color: "#00ff99", radius: 0.50 }
    ],
    bonds: [
      { from: 0, to: 1, type: "ionic", order: 1 }
    ],
    bondAngle: 180,
    bondLength: 3.14,
    category: "inorganic",
    difficulty: "beginner",
    quizUses: ["sali", "elettroliti", "legami ionici"],
    boilingPoint: 1420,
    meltingPoint: 770,
    solubility: "Molto solubile (344 g/L)",
    uses: "Fertilizzanti, sale dietetico, iniezioni letali, elettroliti",
    funFact: "Sostituto del sale da cucina per chi deve ridurre sodio",
    treasureHunt: {
      alchemySymbol: "🥔",
      alchemyName: "Potassa - Sale di Potassio",
      alchemyDescription: "La potassa (carbonato di potassio) era estratta da cenere di legno. Il cloruro di potassio era conosciuto come 'muriato di potassa'. Essenziale per la vita vegetale.",
      relatedMolecules: ["NaCl", "NH4Cl"],
      discoveries: [
        "🔍 Scopri NaCl - sale sodio, simile ma Na invece di K",
        "🔍 Scopri NH₄Cl - altro cloruro, azoto invece di metallo",
        "💧 In acqua: KCl → K⁺ + Cl⁻ (elettrolita forte)",
        "🔬 Scoperto: 1807 da Davy per elettrolisi"
      ],
      secrets: [
        "🌱 Fertilizzante: 'muriato di potassa' = fonte K per piante",
        "💉 Iniezioni letali: terzo farmaco (arresta cuore con K+ elevato)",
        "🧂 Sale dietetico: sostituto NaCl per ipertesi (meno Na+)",
        "⚡ Elettrolita: essenziale per potenziali d'azione nervosi",
        "🍌 Banane: ricche di potassio (principalmente come KCl)"
      ]
    }
  },

  "C8H10N4O2": {
    id: "C8H10N4O2",
    name: "Caffeina",
    formula: "C₈H₁₀N₄O₂",
    molWeight: 194.194,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.4, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "N", position: [2.1, 1.2, 0], color: "#ff00ff", radius: 0.38 },
      { element: "C", position: [1.4, 2.4, 0], color: "#ffff00", radius: 0.40 },
      { element: "N", position: [0, 2.4, 0], color: "#ff00ff", radius: 0.38 },
      { element: "C", position: [-0.7, 1.2, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [-2.0, 1.2, 0], color: "#ff0066", radius: 0.35 },
      { element: "N", position: [2.1, 3.6, 0], color: "#ff00ff", radius: 0.38 },
      { element: "C", position: [3.5, 3.6, 0], color: "#ffff00", radius: 0.40 },
      { element: "N", position: [3.5, 1.2, 0], color: "#ff00ff", radius: 0.38 },
      { element: "O", position: [2.1, -1.2, 0], color: "#ff0066", radius: 0.35 },
      { element: "C", position: [-1.0, 3.6, 0], color: "#ffff00", radius: 0.40 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 2, to: 3, type: "single", order: 1 },
      { from: 3, to: 4, type: "single", order: 1 },
      { from: 4, to: 5, type: "single", order: 1 },
      { from: 5, to: 0, type: "single", order: 1 },
      { from: 5, to: 6, type: "double", order: 2 },
      { from: 3, to: 7, type: "double", order: 2 },
      { from: 7, to: 8, type: "single", order: 1 },
      { from: 8, to: 9, type: "double", order: 2 },
      { from: 9, to: 2, type: "single", order: 1 },
      { from: 1, to: 10, type: "double", order: 2 },
      { from: 4, to: 11, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.40,
    category: "organic",
    difficulty: "advanced",
    quizUses: ["alcaloidi", "anelli eterociclici", "farmacologia"],
    boilingPoint: 178,
    meltingPoint: 238,
    solubility: "Moderatamente solubile (21.6 g/L)",
    uses: "Stimolante, bevande (caffè, tè, cola), farmaci",
    funFact: "Alcaloide più consumato al mondo - blocca recettori adenosina nel cervello",
    treasureHunt: {
      alchemySymbol: "☕",
      alchemyName: "Elixir Vigilantiae - Elisir della Vigilanza",
      alchemyDescription: "La caffeina era sconosciuta agli antichi alchimisti, ma le culture orientali usavano tè e caffè come 'elisir di veglia'. Isolata nel 1819 da Runge. Simbolo della coscienza elevata e dell'energia mentale.",
      relatedMolecules: ["C8H9NO2", "C6H12O6"],
      discoveries: [
        "🔍 Scopri C₈H₉NO₂ (paracetamolo) - altro composto azotato medicinale",
        "🔍 Scopri C₆H₁₂O₆ (glucosio) - fonte energia alternativa",
        "⚗️ Isolamento: 1819 da Runge (chicchi caffè)",
        "🧠 Meccanismo: antagonista recettori adenosina → veglia"
      ],
      secrets: [
        "☕ Dose media: 80-100mg per tazza caffè, 40mg tè, 30mg cola",
        "🧠 Emivita: 4-6 ore (variabile per genetica enzima CYP1A2)",
        "⚡ Prestazioni: migliora attenzione, memoria, resistenza fisica",
        "🌍 Consumo mondiale: 120.000 tonnellate/anno",
        "💊 LD50: 150-200mg/kg (10g per adulto 70kg) = 75-100 tazze caffè",
        "🧬 Alcaloide purinico: struttura base adenina/guanina (DNA/RNA)"
      ]
    }
  },

  "C9H8O4": {
    id: "C9H8O4",
    name: "Aspirina",
    formula: "C₉H₈O₄",
    molWeight: 180.158,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.2, 0.7, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.2, 2.1, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0, 2.8, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-1.2, 2.1, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-1.2, 0.7, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [-2.4, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "C", position: [-3.6, 0.7, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [-4.8, 0, 0], color: "#ff0066", radius: 0.35 },
      { element: "C", position: [-3.6, 2.1, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [2.4, 2.8, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [3.6, 2.1, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [2.4, 4.2, 0], color: "#ff0066", radius: 0.35 }
    ],
    bonds: [
      { from: 0, to: 1, type: "aromatic", order: 1.5 },
      { from: 1, to: 2, type: "aromatic", order: 1.5 },
      { from: 2, to: 3, type: "aromatic", order: 1.5 },
      { from: 3, to: 4, type: "aromatic", order: 1.5 },
      { from: 4, to: 5, type: "aromatic", order: 1.5 },
      { from: 5, to: 0, type: "aromatic", order: 1.5 },
      { from: 5, to: 6, type: "single", order: 1 },
      { from: 6, to: 7, type: "single", order: 1 },
      { from: 7, to: 8, type: "double", order: 2 },
      { from: 7, to: 9, type: "single", order: 1 },
      { from: 2, to: 10, type: "single", order: 1 },
      { from: 10, to: 11, type: "single", order: 1 },
      { from: 10, to: 12, type: "double", order: 2 }
    ],
    bondAngle: 120,
    bondLength: 1.40,
    category: "organic",
    difficulty: "advanced",
    quizUses: ["farmaci", "esteri", "gruppi funzionali"],
    boilingPoint: 140,
    meltingPoint: 135,
    solubility: "Poco solubile (3 g/L)",
    uses: "Analgesico, antipiretico, antinfiammatorio, anticoagulante",
    funFact: "Farmaco più usato al mondo - inibisce COX (cicloossigenasi) riducendo prostaglandine",
    treasureHunt: {
      alchemySymbol: "💊",
      alchemyName: "Acidum Acetylsalicylicum - Polvere Miracolosa",
      alchemyDescription: "Derivata dal salice (Salix), pianta sacra agli alchimisti. Ippocrate usava corteccia di salice per febbre. Sintetizzata da Hoffmann (Bayer) nel 1897. Simbolo della medicina moderna.",
      relatedMolecules: ["C8H9NO2", "CH3COOH"],
      discoveries: [
        "🔍 Scopri C₈H₉NO₂ (paracetamolo) - analgesico alternativo",
        "🔍 Scopri CH₃COOH (acido acetico) - gruppo acetile dell'aspirina",
        "⚗️ Sintesi: acido salicilico + anidride acetica → aspirina",
        "🧠 Meccanismo: inibisce COX-1 e COX-2 (blocca prostaglandine)"
      ],
      secrets: [
        "🌳 Origine: corteccia salice contiene salicina (precursore naturale)",
        "💉 Dose: 325-650mg per dolore, 75-100mg per prevenzione cardiaca",
        "🩸 Anticoagulante: blocca COX-1 piastrine (effetto 7-10 giorni)",
        "🏆 Bayer 1899: brevetto aspirina (acido acetilsalicilico)",
        "⚠️ Sindrome Reye: mai dare aspirina a bambini con virus (danno fegato)",
        "📊 Consumo: 40.000 tonnellate/anno prodotte globalmente"
      ]
    }
  },

  "C8H9NO2": {
    id: "C8H9NO2",
    name: "Paracetamolo",
    formula: "C₈H₉NO₂",
    molWeight: 151.163,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.2, 0.7, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.2, 2.1, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0, 2.8, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-1.2, 2.1, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [-1.2, 0.7, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [0, 4.2, 0], color: "#ff0066", radius: 0.35 },
      { element: "N", position: [2.4, 2.8, 0], color: "#ff00ff", radius: 0.38 },
      { element: "C", position: [3.6, 2.1, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [4.8, 2.8, 0], color: "#ff0066", radius: 0.35 },
      { element: "C", position: [3.6, 0.7, 0], color: "#ffff00", radius: 0.40 }
    ],
    bonds: [
      { from: 0, to: 1, type: "aromatic", order: 1.5 },
      { from: 1, to: 2, type: "aromatic", order: 1.5 },
      { from: 2, to: 3, type: "aromatic", order: 1.5 },
      { from: 3, to: 4, type: "aromatic", order: 1.5 },
      { from: 4, to: 5, type: "aromatic", order: 1.5 },
      { from: 5, to: 0, type: "aromatic", order: 1.5 },
      { from: 3, to: 6, type: "single", order: 1 },
      { from: 2, to: 7, type: "single", order: 1 },
      { from: 7, to: 8, type: "single", order: 1 },
      { from: 8, to: 9, type: "double", order: 2 },
      { from: 8, to: 10, type: "single", order: 1 }
    ],
    bondAngle: 120,
    bondLength: 1.40,
    category: "organic",
    difficulty: "advanced",
    quizUses: ["farmaci", "ammidi", "fenoli"],
    boilingPoint: 420,
    meltingPoint: 169,
    solubility: "Moderatamente solubile (14 g/L)",
    uses: "Analgesico, antipiretico (Tachipirina, Efferalgan)",
    funFact: "Antidolorifico più sicuro - non irrita stomaco come aspirina",
    treasureHunt: {
      alchemySymbol: "🌡️",
      alchemyName: "Acetaminophen - Elisir Antipiretico",
      alchemyDescription: "Scoperto nel 1877, ignorato per 70 anni. Riscoperto nel 1946 come metabolita fenacetina. Simbolo della serendipità scientifica - potente ma sicuro se usato correttamente.",
      relatedMolecules: ["C9H8O4", "C8H10N4O2"],
      discoveries: [
        "🔍 Scopri C₉H₈O₄ (aspirina) - analgesico alternativo (FANS)",
        "🔍 Scopri C₈H₁₀N₄O₂ (caffeina) - spesso combinata con paracetamolo",
        "⚗️ Sintesi: p-aminofenolo + anidride acetica → paracetamolo",
        "🧠 Meccanismo: inibisce COX-3 nel sistema nervoso centrale"
      ],
      secrets: [
        "💊 Dose sicura: max 4g/giorno adulti (8 compresse 500mg)",
        "☠️ Sovradosaggio: >10g causa necrosi epatica (danno irreversibile)",
        "🧪 Antidoto: N-acetilcisteina (NAC) entro 8-10 ore da overdose",
        "👶 Pediatrico: 15mg/kg ogni 4-6 ore (più sicuro di aspirina)",
        "🌍 Nomi: Paracetamol (EU), Acetaminophen (USA), Tachipirina (IT)",
        "🏥 OTC: farmaco da banco più venduto al mondo"
      ]
    }
  },

  "C6H8O6": {
    id: "C6H8O6",
    name: "Vitamina C",
    formula: "C₆H₈O₆",
    molWeight: 176.124,
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.4, 0, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [2.1, 1.4, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [1.4, 2.8, 0], color: "#ffff00", radius: 0.40 },
      { element: "C", position: [0, 2.8, 0], color: "#ffff00", radius: 0.40 },
      { element: "O", position: [-0.7, 1.4, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [2.1, 0, -1.2], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [3.5, 1.4, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [2.1, 4.2, 0], color: "#ff0066", radius: 0.35 },
      { element: "O", position: [-0.7, 4.2, 0], color: "#ff0066", radius: 0.35 },
      { element: "C", position: [-0.7, -1.4, 0], color: "#ffff00", radius: 0.40 }
    ],
    bonds: [
      { from: 0, to: 1, type: "single", order: 1 },
      { from: 1, to: 2, type: "single", order: 1 },
      { from: 2, to: 3, type: "double", order: 2 },
      { from: 3, to: 4, type: "single", order: 1 },
      { from: 4, to: 5, type: "single", order: 1 },
      { from: 5, to: 0, type: "single", order: 1 },
      { from: 1, to: 6, type: "single", order: 1 },
      { from: 2, to: 7, type: "single", order: 1 },
      { from: 3, to: 8, type: "single", order: 1 },
      { from: 4, to: 9, type: "double", order: 2 },
      { from: 0, to: 10, type: "single", order: 1 }
    ],
    bondAngle: 109.5,
    bondLength: 1.52,
    category: "organic",
    difficulty: "advanced",
    quizUses: ["vitamine", "antiossidanti", "gruppi funzionali"],
    boilingPoint: 553,
    meltingPoint: 190,
    solubility: "Molto solubile (333 g/L)",
    uses: "Vitamina essenziale, antiossidante, sintesi collagene",
    funFact: "Essenziale per umani - non possiamo sintetizzarla (serve dalla dieta)",
    treasureHunt: {
      alchemySymbol: "🍊",
      alchemyName: "Acidum Ascorbicum - Elisir Anti-Scorbuto",
      alchemyDescription: "Lo scorbuto terrorizzava marinai per secoli. Nel 1747 Lind scoprì che agrumi lo prevengono. Isolata nel 1928 da Szent-Györgyi. Simbolo della connessione nutrizione-salute.",
      relatedMolecules: ["C6H12O6", "H2O2"],
      discoveries: [
        "🔍 Scopri C₆H₁₂O₆ (glucosio) - simile formula ma diversa struttura",
        "🔍 Scopri H₂O₂ - vitamina C è antiossidante (dona elettroni)",
        "⚗️ Sintesi industriale: processo Reichstein (glucosio → vitamina C)",
        "🧬 Biosintesi: umani mancano gene L-gulonolattone ossidasi"
      ],
      secrets: [
        "🍋 Fonti: agrumi (50mg/100g), kiwi (90mg), peperoni (130mg)",
        "💊 RDA: 90mg uomini, 75mg donne (fumatori +35mg)",
        "🧬 Mutazione: 40M anni fa primati persero capacità sintesi",
        "⚓ Scorbuto: carenza causa sanguinamento gengive, denti cadenti",
        "💪 Collagene: vitamina C cofattore per idrossilazione prolina/lisina",
        "🧪 Antiossidante: dona elettroni a radicali liberi (si ossida)"
      ]
    }
  }
}
