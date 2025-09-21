export const WEBSOCKET_PUBLIC_URL = "http://localhost:5505/"
export const WEBSOCKET_SERVER_PORT = 5505

const QUIZZ_CONFIG = {
  password: "CHEMARENA",
  subject: "Medicina",
  questions: [
    {
        "id": "med1_q1",
        "question": "Quale organello cellulare è responsabile della produzione di ATP?",
        "answers": [
            "Ribosomi",
            "Mitocondri",
            "Reticolo endoplasmatico",
            "Apparato di Golgi"
        ],
        "solution": 1,
        "time": 20,
        "cooldown": 5,
        "image": ""
    },
    {
        "id": "med1_q2",
        "question": "Il DNA è costituito da quale tipo di zucchero?",
        "answers": [
            "Ribosio",
            "Saccarosio",
            "Desossiribosio",
            "Fruttosio"
        ],
        "solution": 2,
        "time": 20,
        "cooldown": 5,
        "image": ""
    },
    {
        "id": "med1_q3",
        "question": "Quante camere ha il cuore umano?",
        "answers": [
            "Due",
            "Tre",
            "Quattro",
            "Sei"
        ],
        "solution": 2,
        "time": 15,
        "cooldown": 5,
        "image": ""
    },
    {
        "id": "med1_q4",
        "question": "Quale gas viene eliminato dai polmoni durante l'espirazione?",
        "answers": [
            "Ossigeno",
            "Azoto",
            "Anidride carbonica",
            "Vapore acqueo"
        ],
        "solution": 2,
        "time": 15,
        "cooldown": 5,
        "image": ""
    },
    {
        "id": "med1_q5",
        "question": "Il tessuto che collega i muscoli alle ossa è chiamato:",
        "answers": [
            "Legamento",
            "Tendine",
            "Cartilagine",
            "Fascia"
        ],
        "solution": 1,
        "time": 20,
        "cooldown": 5,
        "image": ""
    }
]
}

// DONT CHANGE
export const GAME_STATE_INIT = {
  started: false,
  players: [],
  playersAnswer: [],
  manager: null,
  room: null,
  currentQuestion: 0,
  roundStartTime: 0,
  ...QUIZZ_CONFIG,
}