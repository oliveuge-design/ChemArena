import Answers from "@/components/game/states/Answers"
import Leaderboard from "@/components/game/states/Leaderboard"
import Prepared from "@/components/game/states/Prepared"
import Question from "@/components/game/states/Question"
import Result from "@/components/game/states/Result"
import Start from "@/components/game/states/Start"
import Wait from "@/components/game/states/Wait"
import Podium from "./components/game/states/Podium"
import Room from "./components/game/states/Room"
import Username from "./components/game/join/Username"

import Circle from "@/components/icons/Circle"
import Rhombus from "@/components/icons/Rhombus"
import Square from "@/components/icons/Square"
import Triangle from "@/components/icons/Triangle"
import Pentagon from "@/components/icons/Pentagon"
import CricleCheck from "@/components/icons/CricleCheck"
import CricleXmark from "@/components/icons/CricleXmark"

export const ANSWERS_COLORS = [
  "answer-blue",
  "answer-orange",
  "answer-yellow",
  "answer-green",
  "answer-purple",
  "answer-pink",
  "answer-cyan",
  "answer-lime",
]

export const ANSWERS_ICONS = [Triangle, Rhombus, Circle, Square, Pentagon, CricleCheck, CricleXmark, Square]

export const GAME_STATES = {
  status: {
    name: "WAIT",
    data: { text: "✅ Sei dentro! Attendi l'inizio del quiz..." },
  },
  question: {
    current: 1,
    total: null,
  },
}

export const GAME_STATE_COMPONENTS = {
  SELECT_ANSWER: Answers,
  SHOW_QUESTION: Question,
  WAIT: Wait,
  SHOW_START: Start,
  SHOW_RESULT: Result,
  SHOW_PREPARED: Prepared,
  ENTER_USERNAME: Username,
  SHOW_LEADERBOARD: Leaderboard,  // 🏆 Classifica parziale
  FINISH: Podium,  // 🥇 Podio finale
}

export const GAME_STATE_COMPONENTS_MANAGER = {
  ...GAME_STATE_COMPONENTS,
  SHOW_ROOM: Room,
  SHOW_RESPONSES: Answers,
  SHOW_LEADERBOARD: Leaderboard,
  FINISH: Podium,
}

export const SFX_ANSWERS_MUSIC = "/sounds/answersMusic.mp3"
export const SFX_ANSWERS_SOUND = "/sounds/answersSound.mp3"
export const SFX_RESULTS_SOUND = "/sounds/results.mp3"
export const SFX_SHOW_SOUND = "/sounds/show.mp3"
export const SFX_BOUMP_SOUND = "/sounds/boump.mp3"
export const SFX_PODIUM_THREE = "/sounds/three.mp3"
export const SFX_PODIUM_SECOND = "/sounds/second.mp3"
export const SFX_PODIUM_FIRST = "/sounds/first.mp3"
export const SFX_SNEAR_ROOL = "/sounds/snearRoll.mp3"
