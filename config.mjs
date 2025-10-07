export const WEBSOCKET_PUBLIC_URL = "http://localhost:5505/"
export const WEBSOCKET_SERVER_PORT = 5505

const QUIZZ_CONFIG = {
  password: "CHEMARENA",
  subject: "Chimica",
  questions: [
    {
        "id": "q1757435542638_0",
        "question": "Quale principio è alla base della spettrofotometria UV-Vis?",
        "answers": [
            "Risonanza magnetica dei nuclei atomici",
            "Diffusione dei raggi X",
            "Separazione dei componenti in fase liquida",
            "Assorbimento della luce da parte degli elettroni"
        ],
        "solution": 3,
        "time": 15,
        "cooldown": 5,
        "image": "/api/images/arte_monalisa.jpg"
    },
    {
        "id": "q1757435542638_1",
        "question": "Quale tecnica strumentale è più adatta per determinare la concentrazione di metalli in tracce?",
        "answers": [
            "Cromatografia gas-liquido",
            "Spettroscopia di assorbimento atomico (AAS)",
            "Polarimetria",
            "Elettroforesi"
        ],
        "solution": 1,
        "time": 15,
        "cooldown": 5,
        "image": ""
    }
],
  gameMode: "standard",
  gameSettings: {
    "allowLateJoin": true,
    "showLeaderboardBetweenQuestions": true,
    "shuffleQuestions": false,
    "shuffleAnswers": false,
    "gameMode": "standard",
    "bonusForSpeed": true,
    "backgroundTheme": "laboratory",
    "showHints": false,
    "customTime": 10,
    "lives": 1,
    "pointsMultiplier": 1,
    "maxPlayers": 50,
    "autoAdvance": true,
    "playSound": true
},
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
  eliminatedPlayers: [],
  bonusMultiplier: 1,
  currentAnswers: {},
  ...QUIZZ_CONFIG,
}
