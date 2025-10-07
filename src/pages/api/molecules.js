import fs from 'fs'
import path from 'path'

const MOLECULES_FILE = path.join(process.cwd(), 'data', 'molecules-database.json')

// Assicura che la directory data esista
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Leggi molecole dal file
function readMolecules() {
  ensureDataDir()
  try {
    if (fs.existsSync(MOLECULES_FILE)) {
      const data = fs.readFileSync(MOLECULES_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Errore lettura molecole:', error)
    return []
  }
}

// Scrivi molecole nel file
function writeMolecules(molecules) {
  ensureDataDir()
  try {
    fs.writeFileSync(MOLECULES_FILE, JSON.stringify(molecules, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Errore scrittura molecole:', error)
    return false
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Restituisci tutte le molecole
    const molecules = readMolecules()
    res.status(200).json({ success: true, molecules })
  }
  else if (req.method === 'POST') {
    // Salva molecole
    const { molecules } = req.body

    if (!Array.isArray(molecules)) {
      return res.status(400).json({ success: false, error: 'Invalid data format' })
    }

    const success = writeMolecules(molecules)

    if (success) {
      res.status(200).json({ success: true, message: 'Molecole salvate con successo', count: molecules.length })
    } else {
      res.status(500).json({ success: false, error: 'Errore salvataggio molecole' })
    }
  }
  else if (req.method === 'DELETE') {
    // Elimina una molecola specifica
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID molecola mancante' })
    }

    const molecules = readMolecules()
    const filtered = molecules.filter(m => m.id !== id)

    if (filtered.length === molecules.length) {
      return res.status(404).json({ success: false, error: 'Molecola non trovata' })
    }

    const success = writeMolecules(filtered)

    if (success) {
      res.status(200).json({ success: true, message: 'Molecola eliminata' })
    } else {
      res.status(500).json({ success: false, error: 'Errore eliminazione molecola' })
    }
  }
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
