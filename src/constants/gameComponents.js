/**
 * Game State Components - Separato da constants.js per evitare circular dependencies
 */

import Answers from "@/components/game/states/Answers"
import Leaderboard from "@/components/game/states/Leaderboard"
import Prepared from "@/components/game/states/Prepared"
import Question from "@/components/game/states/Question"
import Result from "@/components/game/states/Result"
import Start from "@/components/game/states/Start"
import Wait from "@/components/game/states/Wait"
import Podium from "@/components/game/states/Podium"
import Room from "@/components/game/states/Room"
import Username from "@/components/game/join/Username"
import UntimedWaiting from "@/components/game/states/UntimedWaiting"

export const GAME_STATE_COMPONENTS = {
  SELECT_ANSWER: Answers,
  SHOW_QUESTION: Question,
  WAIT: Wait,
  SHOW_START: Start,
  SHOW_RESULT: Result,
  SHOW_PREPARED: Prepared,
  ENTER_USERNAME: Username,
  SHOW_LEADERBOARD: Leaderboard,  // 🏆 Classifica parziale per tutti
  FINISH: Podium,  // 🥇 Podio finale per tutti
}

export const GAME_STATE_COMPONENTS_MANAGER = {
  ...GAME_STATE_COMPONENTS,
  SHOW_ROOM: Room,
  SHOW_RESPONSES: Answers,
  SHOW_LEADERBOARD: Leaderboard,
  FINISH: Podium,
  UNTIMED_WAITING: UntimedWaiting,
}