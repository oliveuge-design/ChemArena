import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Import dinamico del visualizzatore 3D (se esiste)
const Molecule3D = dynamic(() => import('@/components/chemistry/Molecule3D').catch(() => {
  // Fallback se il componente non esiste ancora
  return () => <div className="text-gray-500 italic">Visualizzatore 3D non disponibile</div>
}), { ssr: false })

export default function MoleculeManager() {
  const [molecules, setMolecules] = useState([])
  const [selectedMolecule, setSelectedMolecule] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showImportModal, setShowImportModal] = useState(false)

  // Form state per editing/creazione
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    formula: '',
    category: 'organica',
    atoms: [],
    bonds: [],
    treasureHunt: {
      alchemySymbol: '',
      discoveries: [],
      secrets: []
    },
    quizUses: []
  })

  // Carica molecole dal database (API o localStorage)
  useEffect(() => {
    loadMolecules()
  }, [])

  const loadMolecules = async () => {
    try {
      // Prova a caricare da API
      const response = await fetch('/api/molecules')
      if (response.ok) {
        const data = await response.json()
        setMolecules(data.molecules || [])
      } else {
        // Fallback: carica da localStorage
        const stored = localStorage.getItem('molecules-database')
        if (stored) {
          setMolecules(JSON.parse(stored))
        } else {
          setMolecules([])
        }
      }
    } catch (error) {
      console.error('Errore caricamento molecole:', error)
      // Fallback localStorage
      const stored = localStorage.getItem('molecules-database')
      if (stored) {
        setMolecules(JSON.parse(stored))
      }
    }
  }

  const saveMolecules = async (updatedMolecules) => {
    try {
      // Salva su API
      const response = await fetch('/api/molecules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ molecules: updatedMolecules })
      })

      if (!response.ok) {
        throw new Error('Errore salvataggio API')
      }
    } catch (error) {
      console.error('Errore salvataggio API, uso localStorage:', error)
    }

    // Salva sempre in localStorage come backup
    localStorage.setItem('molecules-database', JSON.stringify(updatedMolecules))
    setMolecules(updatedMolecules)
  }

  const handleImportFromV3 = async () => {
    try {
      // Importa il database da ChemArena-v3
      const response = await fetch('/api/import-molecules-v3')
      if (response.ok) {
        const data = await response.json()
        await saveMolecules(data.molecules)
        alert(`✅ Importate ${data.molecules.length} molecole da ChemArena-v3`)
        setShowImportModal(false)
      } else {
        alert('❌ Errore import. Verifica che il file compounds-database.js esista.')
      }
    } catch (error) {
      console.error('Errore import:', error)
      alert('❌ Errore durante import molecole')
    }
  }

  const handleAddNew = () => {
    setFormData({
      id: `mol_${Date.now()}`,
      name: '',
      formula: '',
      category: 'organica',
      atoms: [],
      bonds: [],
      treasureHunt: {
        alchemySymbol: '',
        discoveries: [],
        secrets: []
      },
      quizUses: []
    })
    setIsEditing(true)
    setSelectedMolecule(null)
  }

  const handleEdit = (molecule) => {
    setFormData({ ...molecule })
    setIsEditing(true)
    setSelectedMolecule(molecule)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.formula) {
      alert('⚠️ Nome e formula sono obbligatori')
      return
    }

    let updatedMolecules
    if (selectedMolecule) {
      // Update esistente
      updatedMolecules = molecules.map(m => m.id === formData.id ? formData : m)
    } else {
      // Nuova molecola
      updatedMolecules = [...molecules, formData]
    }

    await saveMolecules(updatedMolecules)
    setIsEditing(false)
    setSelectedMolecule(null)
    alert('✅ Molecola salvata!')
  }

  const handleDelete = async (moleculeId) => {
    if (!confirm('⚠️ Sei sicuro di voler eliminare questa molecola?')) return

    const updatedMolecules = molecules.filter(m => m.id !== moleculeId)
    await saveMolecules(updatedMolecules)
    if (selectedMolecule?.id === moleculeId) {
      setSelectedMolecule(null)
    }
    alert('✅ Molecola eliminata')
  }

  const filteredMolecules = molecules.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.formula.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'organica', 'inorganica', 'elementi', 'complessi']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Molecole 3D</h2>
          <p className="text-sm text-gray-600">Database: {molecules.length} molecole</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📥 Importa da ChemArena-v3
          </button>
          <button
            onClick={handleAddNew}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ➕ Nuova Molecola
          </button>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cerca</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome o formula..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Tutte' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista molecole */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Molecole ({filteredMolecules.length})
            </h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredMolecules.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Nessuna molecola trovata</p>
                <p className="text-sm mt-2">Importa da ChemArena-v3 o crea una nuova molecola</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredMolecules.map(molecule => (
                  <div
                    key={molecule.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedMolecule?.id === molecule.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedMolecule(molecule)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{molecule.name}</h4>
                        <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: molecule.formula }}></p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {molecule.category || 'Non classificata'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(molecule)
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Modifica"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(molecule.id)
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Elimina"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview / Editor */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">
              {isEditing ? '✏️ Editor Molecola' : '👁️ Preview'}
            </h3>
          </div>
          <div className="p-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Es: Acqua"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formula HTML</label>
                  <input
                    type="text"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Es: H<sub>2</sub>O"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Preview: <span dangerouslySetInnerHTML={{ __html: formData.formula }}></span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="organica">Organica</option>
                    <option value="inorganica">Inorganica</option>
                    <option value="elementi">Elementi</option>
                    <option value="complessi">Complessi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Simbolo Alchemico</label>
                  <input
                    type="text"
                    value={formData.treasureHunt?.alchemySymbol || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      treasureHunt: { ...formData.treasureHunt, alchemySymbol: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Es: 🜄"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    💾 Salva
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedMolecule(null)
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    ❌ Annulla
                  </button>
                </div>
              </div>
            ) : selectedMolecule ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-xl text-gray-900">{selectedMolecule.name}</h4>
                  <p className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: selectedMolecule.formula }}></p>
                </div>

                {/* Visualizzatore 3D */}
                <div className="bg-gray-900 rounded-lg h-[300px] flex items-center justify-center">
                  <Molecule3D compound={selectedMolecule} />
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong>Categoria:</strong> {selectedMolecule.category || 'Non specificata'}</p>
                  <p><strong>Atomi:</strong> {selectedMolecule.atoms?.length || 0}</p>
                  <p><strong>Legami:</strong> {selectedMolecule.bonds?.length || 0}</p>
                  {selectedMolecule.treasureHunt?.alchemySymbol && (
                    <p><strong>Simbolo:</strong> {selectedMolecule.treasureHunt.alchemySymbol}</p>
                  )}
                </div>

                <button
                  onClick={() => handleEdit(selectedMolecule)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ✏️ Modifica
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p>Seleziona una molecola per visualizzarla</p>
                <p className="text-sm mt-2">oppure crea una nuova molecola</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Importa da ChemArena-v3</h3>
            <p className="text-gray-600 mb-6">
              Questa operazione importerà tutte le molecole dal database di ChemArena-v3.
              <br /><br />
              Le molecole esistenti con lo stesso ID verranno sovrascritte.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleImportFromV3}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                📥 Conferma Import
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ❌ Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
