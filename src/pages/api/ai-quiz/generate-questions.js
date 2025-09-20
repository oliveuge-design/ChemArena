export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non supportato' })
  }

  try {
    const { content, config, apiKey } = req.body

    if (!content || !config || !apiKey) {
      return res.status(400).json({
        error: 'Contenuto, configurazione e API Key sono richiesti'
      })
    }

    // Costruisci il prompt per OpenAI basato sulla configurazione
    const prompt = buildPrompt(content, config)

    // Scegli il modello migliore basato sul numero di domande
    const numQuestions = config.numQuestions || 10
    let selectedModel, maxTokens

    if (numQuestions <= 15) {
      selectedModel = 'gpt-3.5-turbo'
      maxTokens = 3000
    } else if (numQuestions <= 30) {
      selectedModel = 'gpt-3.5-turbo-16k'
      maxTokens = 6000
    } else {
      selectedModel = 'gpt-4o-mini'
      maxTokens = 8000
    }

    console.log(`📊 Quiz con ${numQuestions} domande - Usando modello: ${selectedModel} (max_tokens: ${maxTokens})`)

    // Prova modelli in ordine di efficacia per il numero di domande richiesto
    const models = numQuestions > 30
      ? ['gpt-4o-mini', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo']
      : numQuestions > 15
        ? ['gpt-3.5-turbo-16k', 'gpt-4o-mini', 'gpt-3.5-turbo']
        : ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4o-mini']

    let openaiResponse = null
    let lastError = null

    for (const model of models) {
      try {
        console.log(`🔄 Tentativo con modello: ${model}`)

        // Calcola max_tokens dinamicamente in base al modello e numero domande
        const dynamicMaxTokens = model.includes('16k')
          ? Math.min(8000, numQuestions * 200 + 1000)  // ~200 token per domanda + overhead
          : model.includes('4o-mini')
            ? Math.min(10000, numQuestions * 250 + 1000) // GPT-4o-mini può gestire di più
            : Math.min(4000, numQuestions * 180 + 800)   // Modello base

        openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'Sei un esperto creatore di quiz educativi. Generi domande a scelta multipla di alta qualità basate sui contenuti forniti. IMPORTANTE: Genera SEMPRE un JSON valido e completo.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: dynamicMaxTokens
          })
        })

        if (openaiResponse.ok) {
          console.log(`✅ Successo con modello: ${model}`)
          break
        } else {
          const errorData = await openaiResponse.json()
          lastError = errorData.error?.message || 'Errore sconosciuto'
          console.log(`❌ Errore con ${model}: ${lastError}`)
          openaiResponse = null
        }
      } catch (error) {
        lastError = error.message
        console.log(`❌ Errore connessione con ${model}: ${lastError}`)
        openaiResponse = null
      }
    }

    if (!openaiResponse) {
      throw new Error(`Nessun modello OpenAI disponibile. Ultimo errore: ${lastError}`)
    }

    const aiData = await openaiResponse.json()
    const generatedText = aiData.choices[0]?.message?.content

    if (!generatedText) {
      throw new Error('Nessuna risposta generata dall\'AI')
    }

    // Parsing della risposta AI in formato quiz
    const quiz = parseAIResponse(generatedText, config)

    console.log('📝 Quiz generato:', JSON.stringify(quiz, null, 2))

    return res.status(200).json({
      success: true,
      quiz: quiz
    })

  } catch (error) {
    console.error('Errore generate-questions:', error)
    return res.status(500).json({
      error: 'Errore durante la generazione delle domande',
      details: error.message
    })
  }
}

function buildPrompt(content, config) {
  const difficultyInstructions = {
    easy: 'Crea domande di livello PRINCIPIANTE: domande dirette dal testo, definizioni base, riconoscimento semplice di concetti espliciti.',
    medium: 'Crea domande di livello INTERMEDIO: richiedi inferenze e collegamenti tra concetti, applicazione pratica delle conoscenze, analisi guidata.',
    hard: 'Crea domande di livello AVANZATO: richiedi analisi critica, sintesi di informazioni complesse, problem solving, valutazione e giudizi motivati.'
  }

  // Ottimizza il prompt per quiz lunghi
  const promptOptimization = config.numQuestions > 30
    ? `
ATTENZIONE: Quiz lungo con ${config.numQuestions} domande richieste.
- Usa un linguaggio conciso ma preciso
- Mantieni le domande brevi e chiare
- Assicurati di completare TUTTE le ${config.numQuestions} domande nel JSON`
    : ""

  return `
CONTENUTO DA ANALIZZARE:
${content}

ISTRUZIONI:
1. Analizza attentamente il contenuto fornito
2. Crea esattamente ${config.numQuestions} domande a scelta multipla in italiano
3. Materia: ${config.subject}
4. ${difficultyInstructions[config.difficulty]}
5. Ogni domanda deve avere esattamente ${config.numAnswers || 4} opzioni di risposta
6. Una sola risposta corretta per domanda
7. Le domande devono essere varie e coprire diversi aspetti del contenuto
8. Evita domande troppo ovvie o troppo oscure
${promptOptimization}

FORMATO RICHIESTO (rispondi SOLO con questo JSON valido, niente altro):
{
  "title": "Quiz ${config.subject}",
  "subject": "${config.subject}",
  "password": "QUIZ123",
  "questions": [
    {
      "id": "q1",
      "question": "Testo della domanda?",
      "answers": [${Array.from({length: config.numAnswers || 4}, (_, i) => `"Opzione ${String.fromCharCode(65 + i)}"`).join(', ')}],
      "solution": 0,
      "time": ${config.difficulty === 'hard' ? 30 : config.difficulty === 'medium' ? 20 : 15},
      "cooldown": 5,
      "image": ""
    }
  ]
}

REGOLE CRITICHE:
- Genera ESATTAMENTE ${config.numQuestions} domande complete
- solution è l'indice (0-${(config.numAnswers || 4) - 1}) della risposta corretta
- JSON deve essere valido e parsabile
- NON aggiungere testo prima o dopo il JSON
- Se il contenuto è lungo, distribuisci le domande su tutti gli argomenti trattati
`
}

function parseAIResponse(response, config) {
  try {
    console.log(`🔍 Parsing AI response (${response.length} caratteri)`)

    // Cerca il JSON nella risposta dell'AI con varie strategie
    let jsonString = null

    // Strategia 1: JSON completo
    let jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonString = jsonMatch[0]
    } else {
      // Strategia 2: Cerca JSON parziale e prova a completarlo
      const startMatch = response.match(/\{[\s\S]*/)
      if (startMatch) {
        jsonString = startMatch[0]
        // Aggiungi chiusure mancanti se necessario
        const openBraces = (jsonString.match(/\{/g) || []).length
        const closeBraces = (jsonString.match(/\}/g) || []).length
        const missingBraces = openBraces - closeBraces
        for (let i = 0; i < missingBraces; i++) {
          jsonString += '}'
        }
      }
    }

    if (!jsonString) {
      throw new Error('Formato JSON non trovato nella risposta AI')
    }

    // Prova il parsing con diversi metodi di pulizia
    let quiz = null

    try {
      // Tentativo 1: JSON diretto
      quiz = JSON.parse(jsonString)
    } catch (firstError) {
      try {
        // Tentativo 2: Pulisci caratteri problematici
        const cleanedJson = jsonString
          .replace(/[\u0000-\u0019]+/g, '') // Rimuovi caratteri di controllo
          .replace(/,\s*}/g, '}') // Rimuovi virgole prima delle chiusure
          .replace(/,\s*]/g, ']') // Rimuovi virgole prima delle chiusure array

        quiz = JSON.parse(cleanedJson)
      } catch (secondError) {
        // Tentativo 3: Parsing più aggressivo per quiz troncati
        try {
          const truncatedMatch = jsonString.match(/\{[\s\S]*"questions":\s*\[[\s\S]*\][\s\S]*/)
          if (truncatedMatch) {
            // Cerca di riparare JSON troncato
            let repairedJson = truncatedMatch[0]
            if (!repairedJson.endsWith('}')) {
              repairedJson += '}'
            }
            quiz = JSON.parse(repairedJson)
          } else {
            throw secondError
          }
        } catch (thirdError) {
          console.error('Tutti i tentativi di parsing falliti:', {
            firstError: firstError.message,
            secondError: secondError.message,
            thirdError: thirdError.message,
            jsonLength: jsonString.length,
            jsonPreview: jsonString.substring(0, 500)
          })
          throw new Error(`JSON parsing fallito: ${firstError.message}`)
        }
      }
    }

    // Validazione e normalizzazione
    if (!quiz || typeof quiz !== 'object') {
      throw new Error('Risposta AI non è un oggetto valido')
    }

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Formato quiz non valido: questions mancanti o non array')
    }

    // Genera ID unico per il quiz
    quiz.id = `ai_quiz_${Date.now()}`

    // Normalizza le domande e filtra quelle incomplete
    const validQuestions = quiz.questions
      .filter(q => q && q.question && q.answers)
      .map((q, index) => ({
        id: q.id || `q${index + 1}`,
        question: q.question || 'Domanda non valida',
        answers: Array.isArray(q.answers) && q.answers.length >= 2
          ? (q.answers.length === (config.numAnswers || 4)
              ? q.answers
              : q.answers.length > (config.numAnswers || 4)
                ? q.answers.slice(0, config.numAnswers || 4)
                : [...q.answers, ...Array((config.numAnswers || 4) - q.answers.length).fill('Opzione aggiuntiva')])
          : Array.from({length: config.numAnswers || 4}, (_, i) => `Opzione ${String.fromCharCode(65 + i)}`),
        solution: typeof q.solution === 'number' && q.solution >= 0 && q.solution < (config.numAnswers || 4)
          ? q.solution
          : 0,
        time: q.time || (config.difficulty === 'hard' ? 30 : config.difficulty === 'medium' ? 20 : 15),
        cooldown: q.cooldown || 5,
        image: q.image || ''
      }))

    quiz.questions = validQuestions

    // Log statistiche
    console.log(`📊 Quiz processato: ${validQuestions.length}/${config.numQuestions} domande valide`)

    // Se abbiamo meno della metà delle domande richieste, genera fallback
    if (validQuestions.length < config.numQuestions / 2) {
      console.warn(`⚠️ Troppe poche domande valide (${validQuestions.length}), usando fallback`)
      return generateFallbackQuiz(config)
    }

    // Aggiorna il titolo se mancante
    if (!quiz.title) {
      quiz.title = `Quiz ${config.subject} - ${validQuestions.length} domande`
    }

    if (!quiz.subject) {
      quiz.subject = config.subject
    }

    if (!quiz.password) {
      quiz.password = 'QUIZ123'
    }

    return quiz

  } catch (error) {
    console.error('Errore parsing risposta AI:', error)
    console.error('Risposta AI problematica:', response.substring(0, 1000))

    // Fallback: genera quiz di esempio
    return generateFallbackQuiz(config)
  }
}

function generateFallbackQuiz(config) {
  return {
    id: `fallback_quiz_${Date.now()}`,
    title: `Quiz ${config.subject} (Generato automaticamente)`,
    subject: config.subject,
    password: 'QUIZ123',
    questions: [
      {
        id: 'q1',
        question: `Quale dei seguenti concetti è fondamentale in ${config.subject}?`,
        answers: Array.from({length: config.numAnswers || 4}, (_, i) => `Concetto ${String.fromCharCode(65 + i)}`),
        solution: 0,
        time: 20,
        cooldown: 5,
        image: ''
      }
    ]
  }
}