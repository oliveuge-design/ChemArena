import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import os from 'os'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Funzioni di parsing per diversi tipi di file
const parseDocument = async (file) => {
  const ext = path.extname(file.originalFilename).toLowerCase()

  try {
    switch (ext) {
      case '.txt':
        return await parseTXT(file.filepath)
      case '.pdf':
        return await parsePDF(file.filepath)
      case '.doc':
      case '.docx':
        return await parseDOC(file.filepath)
      case '.ppt':
      case '.pptx':
        return await parsePPT(file.filepath)
      case '.jpg':
      case '.jpeg':
      case '.png':
        return await parseImage(file.filepath)
      default:
        throw new Error(`Formato file non supportato: ${ext}`)
    }
  } catch (error) {
    console.error(`Errore parsing ${file.originalFilename}:`, error)
    return { content: '', error: error.message }
  }
}

const parseTXT = async (filepath) => {
  const content = await fs.promises.readFile(filepath, 'utf-8')
  return { content, type: 'text' }
}

const parsePDF = async (filepath) => {
  try {
    const dataBuffer = await fs.promises.readFile(filepath)
    const data = await pdfParse(dataBuffer)

    return {
      content: data.text || 'Nessun testo estratto dal PDF',
      type: 'pdf'
    }
  } catch (error) {
    console.error('Errore parsing PDF:', error)
    return {
      content: '',
      type: 'pdf',
      error: `Errore parsing PDF: ${error.message}`
    }
  }
}

const parseDOC = async (filepath) => {
  try {
    // Leggi il file come buffer
    const buffer = await fs.promises.readFile(filepath)

    // Usa mammoth per estrarre il testo
    const result = await mammoth.extractRawText({ buffer })

    return {
      content: result.value || 'Nessun testo estratto dal documento',
      type: 'doc',
      warnings: result.messages?.length ? result.messages.map(m => m.message) : null
    }
  } catch (error) {
    console.error('Errore parsing DOC/DOCX:', error)
    return {
      content: '',
      type: 'doc',
      error: `Errore parsing DOC/DOCX: ${error.message}`
    }
  }
}

const parsePPT = async (filepath) => {
  // Per ora implementazione semplificata - da estendere con node-pptx
  try {
    return {
      content: 'Contenuto PPT estratto (implementare node-pptx per funzionalità completa)',
      type: 'ppt',
      error: 'PPT parsing non ancora implementato - installare node-pptx'
    }
  } catch (error) {
    return { content: '', type: 'ppt', error: 'Errore parsing PPT' }
  }
}

const parseImage = async (filepath) => {
  // Per ora implementazione semplificata - da estendere con tesseract.js per OCR
  try {
    return {
      content: 'Contenuto immagine estratto via OCR (implementare tesseract.js per funzionalità completa)',
      type: 'image',
      error: 'OCR non ancora implementato - installare tesseract.js'
    }
  } catch (error) {
    return { content: '', type: 'image', error: 'Errore OCR immagine' }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non supportato' })
  }

  try {
    // Usa direttamente /tmp per compatibilità Render serverless
    // Render NON permette creazione di subdirectories custom
    const uploadDir = os.tmpdir()

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 4 * 1024 * 1024, // 4MB - limite Render API routes
      multiples: true
    })

    const [fields, files] = await form.parse(req)

    const config = JSON.parse(fields.config[0])
    const clientApiKey = fields.apiKey?.[0]

    // Priorità: API key server-side (sicura) > client-side (fallback)
    const apiKey = process.env.OPENAI_API_KEY || clientApiKey

    if (!apiKey) {
      return res.status(400).json({
        error: 'API Key OpenAI non configurata. Contattare l\'amministratore per configurare OPENAI_API_KEY su Render.'
      })
    }

    // Log warning se si usa API key client-side (insicuro)
    if (!process.env.OPENAI_API_KEY && clientApiKey) {
      console.warn('⚠️ SECURITY: Usando API key client-side. Configurare OPENAI_API_KEY su Render.')
    }

    // Processa tutti i file caricati
    const extractedContents = []
    const fileEntries = Object.entries(files)

    for (const [key, fileArray] of fileEntries) {
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray
      if (file) {
        console.log(`Processing file: ${file.originalFilename}`)
        const parsed = await parseDocument(file)
        extractedContents.push({
          filename: file.originalFilename,
          type: parsed.type,
          content: parsed.content,
          error: parsed.error || null
        })

        // Cleanup file temporaneo
        try {
          await fs.promises.unlink(file.filepath)
        } catch (cleanupError) {
          console.warn('Errore cleanup file temporaneo:', cleanupError)
        }
      }
    }

    // Combina tutto il contenuto estratto
    const combinedContent = extractedContents
      .filter(item => item.content && !item.error)
      .map(item => `=== ${item.filename} ===\n${item.content}`)
      .join('\n\n')

    const errors = extractedContents
      .filter(item => item.error)
      .map(item => `${item.filename}: ${item.error}`)

    const warnings = extractedContents
      .filter(item => item.warnings)
      .map(item => `${item.filename}: ${item.warnings.join(', ')}`)

    if (!combinedContent && errors.length > 0) {
      return res.status(400).json({
        error: 'Nessun contenuto estratto dai documenti. Verifica che i file siano leggibili e non protetti da password.',
        details: errors,
        supportedFormats: 'PDF, DOC, DOCX, TXT'
      })
    }

    return res.status(200).json({
      success: true,
      extractedContent: combinedContent,
      processedFiles: extractedContents.length,
      successfulFiles: extractedContents.filter(item => item.content && !item.error).length,
      errors: errors.length > 0 ? errors : null,
      warnings: warnings.length > 0 ? warnings : null,
      contentLength: combinedContent.length
    })

  } catch (error) {
    console.error('Errore process-documents:', error)
    return res.status(500).json({
      error: 'Errore interno durante l\'elaborazione dei documenti',
      details: error.message
    })
  }
}