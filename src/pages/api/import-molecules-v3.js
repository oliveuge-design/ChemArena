import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // Percorso del database molecole da ChemArena-v3
    const sourceFile = path.join(process.cwd(), 'src', 'chemistry', 'compounds-database.js')

    // Verifica che il file esista
    if (!fs.existsSync(sourceFile)) {
      return res.status(404).json({
        success: false,
        error: 'File compounds-database.js non trovato. Assicurati di averlo copiato da ChemArena-v3.'
      })
    }

    // Leggi il file JavaScript
    const fileContent = fs.readFileSync(sourceFile, 'utf-8')

    // Estrai l'array compoundsDatabase usando regex
    // Cerca: export const compoundsDatabase = [...]
    const match = fileContent.match(/export\s+const\s+compoundsDatabase\s*=\s*(\[[\s\S]*?\n\])/m)

    if (!match || !match[1]) {
      return res.status(500).json({
        success: false,
        error: 'Impossibile estrarre compoundsDatabase dal file. Formato non riconosciuto.'
      })
    }

    // Converti la stringa in oggetto JavaScript usando eval (ATTENZIONE: solo in ambiente controllato!)
    // In produzione usare un parser sicuro
    let molecules
    try {
      // eslint-disable-next-line no-eval
      molecules = eval(`(${match[1]})`)
    } catch (evalError) {
      console.error('Errore parsing compounds:', evalError)
      return res.status(500).json({
        success: false,
        error: 'Errore parsing database molecole. Verifica la sintassi del file.'
      })
    }

    if (!Array.isArray(molecules) || molecules.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Il database molecole è vuoto o non è un array valido.'
      })
    }

    // Salva nel file JSON di destinazione
    const destDir = path.join(process.cwd(), 'data')
    const destFile = path.join(destDir, 'molecules-database.json')

    // Crea directory se non esiste
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    // Scrivi il file JSON
    fs.writeFileSync(destFile, JSON.stringify(molecules, null, 2), 'utf-8')

    res.status(200).json({
      success: true,
      message: `Import completato: ${molecules.length} molecole importate`,
      molecules,
      count: molecules.length
    })

  } catch (error) {
    console.error('Errore import molecole v3:', error)
    res.status(500).json({
      success: false,
      error: 'Errore durante import molecole: ' + error.message
    })
  }
}
