/**
 * MULTI-ROOM MANAGER
 * Gestisce multiple room quiz contemporanee con sicurezza
 */

import { GAME_STATE_INIT } from "../config.mjs";
import roomLimiter from "./utils/roomLimiter.js";
import deepClone from "./utils/deepClone.js";

class MultiRoomManager {
  constructor() {
    // Map di tutte le room attive: roomId -> gameState
    this.gameRooms = new Map();

    // Map di manager socket -> roomId per lookup veloce
    this.managerToRoom = new Map();

    // Map di player socket -> roomId per lookup veloce
    this.playerToRoom = new Map();

    console.log('🏢 MultiRoomManager inizializzato');
  }

  /**
   * Crea una nuova room per un quiz
   */
  createRoom(managerId, teacherId, roomData = {}) {
    // 🔍 DEBUG COMPLETO: Log di TUTTO roomData ricevuto
    console.log(`\n========== 🔍 CREATE ROOM DEBUG ==========`);
    console.log(`Manager ID: ${managerId}`);
    console.log(`Teacher ID: ${teacherId}`);
    console.log(`RoomData keys:`, Object.keys(roomData));
    console.log(`RoomData completo:`, JSON.stringify(roomData, null, 2));
    console.log(`Has questions:`, !!roomData.questions);
    console.log(`Questions count:`, roomData.questions?.length || 0);
    console.log(`Quiz ID:`, roomData.quizId);
    console.log(`Quiz Title:`, roomData.quizTitle);
    console.log(`Subject:`, roomData.subject);
    if (roomData.questions && roomData.questions.length > 0) {
      console.log(`First question preview:`, roomData.questions[0].question?.substring(0, 80));
    }
    console.log(`Global currentQuizConfig exists:`, !!global.currentQuizConfig);
    if (global.currentQuizConfig) {
      console.log(`Global quiz subject:`, global.currentQuizConfig.subject);
      console.log(`Global quiz questions:`, global.currentQuizConfig.questions?.length);
    }
    console.log(`==========================================\n`);

    // 1. Controllo limiti di sicurezza
    const limitCheck = roomLimiter.canCreateRoom(teacherId);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.reason,
        suggestions: limitCheck.suggestions,
        stats: limitCheck.currentStats
      };
    }

    try {
      // 2. Genera room ID unico
      const roomId = this.generateRoomId();

      // 3. Crea gameState per la room
      const gameState = deepClone(GAME_STATE_INIT);
      gameState.room = roomId;
      gameState.manager = managerId;
      gameState.teacherId = teacherId;
      gameState.createdAt = Date.now();

      // ✅ PRIORITÀ 1: Applica dati quiz da roomData (da localStorage)
      if (roomData.questions && roomData.questions.length > 0) {
        // Quiz fornito direttamente - USA QUESTO (da localStorage)
        gameState.password = roomData.password || 'CHEMARENA';
        gameState.subject = roomData.subject || 'Quiz';
        gameState.questions = roomData.questions;
        gameState.quizTitle = roomData.quizTitle;
        gameState.quizId = roomData.quizId;

        console.log(`🎯 QUIZ CARICATO DA ROOMDATA (localStorage):`);
        console.log(`   📝 Titolo: ${roomData.quizTitle}`);
        console.log(`   🆔 Quiz ID: ${roomData.quizId}`);
        console.log(`   📚 Materia: ${roomData.subject}`);
        console.log(`   🔢 Domande: ${roomData.questions.length}`);
        console.log(`   ❓ Prima domanda: ${roomData.questions[0].question?.substring(0, 60)}...`);

      } else if (global.currentQuizConfig && global.currentQuizConfig.questions) {
        // ⚠️ FALLBACK: Usa global config solo se roomData non ha quiz
        console.log(`⚠️ WARNING: No quiz in roomData, using global.currentQuizConfig as fallback`);
        gameState.password = global.currentQuizConfig.password || 'CHEMARENA';
        gameState.subject = global.currentQuizConfig.subject || 'Quiz';
        gameState.questions = global.currentQuizConfig.questions;
        gameState.quizTitle = global.currentQuizConfig.quizTitle;
        gameState.quizId = global.currentQuizConfig.quizId;

        console.log(`📦 Quiz caricato da global config (fallback):`);
        console.log(`   📚 Materia: ${gameState.subject}`);
        console.log(`   🔢 Domande: ${gameState.questions.length}`);
      }

      // CRITICO: Applica gameMode e gameSettings (sempre da roomData se presente)
      if (roomData.gameMode) {
        gameState.gameMode = roomData.gameMode;
        console.log(`   🎮 Modalità: ${roomData.gameMode}`);
      } else if (global.currentQuizConfig && global.currentQuizConfig.gameMode) {
        gameState.gameMode = global.currentQuizConfig.gameMode;
        console.log(`   🎮 Modalità (da global): ${global.currentQuizConfig.gameMode}`);
      }

      if (roomData.gameSettings) {
        gameState.gameSettings = roomData.gameSettings;
        console.log(`   ⚙️ Impostazioni: ${JSON.stringify(roomData.gameSettings)}`);
      } else if (global.currentQuizConfig && global.currentQuizConfig.gameSettings) {
        gameState.gameSettings = global.currentQuizConfig.gameSettings;
        console.log(`   ⚙️ Impostazioni (da global): ${JSON.stringify(global.currentQuizConfig.gameSettings)}`);
      }

      // 4. Registra la room
      this.gameRooms.set(roomId, gameState);
      this.managerToRoom.set(managerId, roomId);

      // 5. Registra nel RoomLimiter
      roomLimiter.registerRoom(roomId, teacherId, {
        quizData: {
          password: gameState.password,
          subject: gameState.subject,
          questionsCount: gameState.questions.length
        }
      });

      console.log(`✅ Room ${roomId} creata per teacher ${teacherId}`);

      return {
        success: true,
        roomId: roomId,
        stats: roomLimiter.getCurrentStats()
      };

    } catch (error) {
      console.error('❌ Errore creazione room:', error);
      return {
        success: false,
        error: 'Errore interno del server',
        suggestions: ['Riprova tra qualche secondo']
      };
    }
  }

  /**
   * Ottiene il gameState di una room
   */
  getRoomState(roomId) {
    return this.gameRooms.get(roomId) || null;
  }

  /**
   * Ottiene la room di un manager
   */
  getManagerRoom(managerId) {
    const roomId = this.managerToRoom.get(managerId);
    return roomId ? this.gameRooms.get(roomId) : null;
  }

  /**
   * Ottiene la room di un player
   */
  getPlayerRoom(playerId) {
    const roomId = this.playerToRoom.get(playerId);
    return roomId ? this.gameRooms.get(roomId) : null;
  }

  /**
   * Aggiunge un player a una room
   */
  addPlayerToRoom(roomId, playerId, playerData) {
    const gameState = this.gameRooms.get(roomId);
    if (!gameState) {
      return {
        success: false,
        error: 'Room non trovata'
      };
    }

    // Controllo limite studenti per room
    if (gameState.players.length >= 100) { // Limite hardcoded per sicurezza
      return {
        success: false,
        error: 'Room piena (max 100 studenti)'
      };
    }

    try {
      // Aggiungi il player
      gameState.players.push({
        id: playerId,
        ...playerData,
        joinedAt: Date.now()
      });

      // Registra il player
      this.playerToRoom.set(playerId, roomId);

      // Aggiorna statistiche room
      roomLimiter.updateRoomActivity(roomId, {
        studentsCount: gameState.players.length
      });

      console.log(`👤 Player ${playerId} aggiunto a room ${roomId} (${gameState.players.length} studenti)`);

      return {
        success: true,
        studentsCount: gameState.players.length
      };

    } catch (error) {
      console.error('❌ Errore aggiunta player:', error);
      return {
        success: false,
        error: 'Errore interno'
      };
    }
  }

  /**
   * Rimuove un player da una room
   */
  removePlayerFromRoom(playerId) {
    const roomId = this.playerToRoom.get(playerId);
    if (!roomId) {
      return false;
    }

    const gameState = this.gameRooms.get(roomId);
    if (!gameState) {
      return false;
    }

    try {
      // Rimuovi il player
      gameState.players = gameState.players.filter(p => p.id !== playerId);
      this.playerToRoom.delete(playerId);

      // Aggiorna statistiche
      roomLimiter.updateRoomActivity(roomId, {
        studentsCount: gameState.players.length
      });

      console.log(`👤 Player ${playerId} rimosso da room ${roomId}`);
      return true;

    } catch (error) {
      console.error('❌ Errore rimozione player:', error);
      return false;
    }
  }

  /**
   * Rimuove una room completamente
   */
  removeRoom(roomId, reason = 'completed') {
    const gameState = this.gameRooms.get(roomId);
    if (!gameState) {
      return false;
    }

    try {
      // IMPORTANTE: Invalida il gameState per interrompere funzioni async in corso
      gameState.started = false;
      gameState.room = null;
      gameState.manager = null;

      // Rimuovi tutti i player mappings
      for (const player of gameState.players) {
        this.playerToRoom.delete(player.id);
      }

      // Rimuovi manager mapping
      this.managerToRoom.delete(gameState.manager);

      // Rimuovi dal RoomLimiter
      roomLimiter.unregisterRoom(roomId);

      // Rimuovi la room
      this.gameRooms.delete(roomId);

      console.log(`🗑️ Room ${roomId} rimossa (${reason}) - gameState invalidato`);
      return true;

    } catch (error) {
      console.error('❌ Errore rimozione room:', error);
      return false;
    }
  }

  /**
   * Aggiorna l'attività di una room
   */
  updateRoomActivity(roomId, status = null) {
    roomLimiter.updateRoomActivity(roomId, {
      status: status
    });
  }

  /**
   * Ottieni statistiche del sistema
   */
  getSystemStats() {
    const stats = roomLimiter.getCurrentStats();

    // Aggiungi info aggiuntive
    stats.roomsDetails = [];
    for (const [roomId, gameState] of this.gameRooms.entries()) {
      stats.roomsDetails.push({
        roomId,
        teacherId: gameState.teacherId,
        studentsCount: gameState.players.length,
        status: gameState.started ? 'active' : 'waiting',
        subject: gameState.subject,
        questionsCount: gameState.questions.length
      });
    }

    return stats;
  }

  /**
   * Pulisce le room di un insegnante (per disconnect)
   */
  cleanupTeacherRooms(teacherId) {
    const rooms = [];

    for (const [roomId, gameState] of this.gameRooms.entries()) {
      if (gameState.teacherId === teacherId) {
        rooms.push(roomId);
      }
    }

    let cleanedCount = 0;
    for (const roomId of rooms) {
      if (this.removeRoom(roomId, 'teacher_disconnect')) {
        cleanedCount++;
      }
    }

    console.log(`🧹 Cleanup teacher ${teacherId}: ${cleanedCount} room rimosse`);
    return cleanedCount;
  }

  /**
   * Genera un room ID univoco
   */
  generateRoomId() {
    let roomId;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      // Genera PIN numerico a 4 cifre (1000-9999)
      roomId = (Math.floor(Math.random() * 9000) + 1000).toString();
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Impossibile generare room ID unico');
      }
    } while (this.gameRooms.has(roomId));

    return roomId;
  }

  /**
   * Ottieni tutte le room attive
   */
  getAllRooms() {
    return Array.from(this.gameRooms.entries()).map(([roomId, gameState]) => ({
      roomId,
      teacherId: gameState.teacherId,
      studentsCount: gameState.players.length,
      started: gameState.started,
      subject: gameState.subject
    }));
  }

  /**
   * Health check del sistema
   */
  healthCheck() {
    const stats = this.getSystemStats();
    const isHealthy = !stats.isNearLimit && this.gameRooms.size < 50;

    return {
      healthy: isHealthy,
      activeRooms: this.gameRooms.size,
      totalPlayers: stats.totalStudents,
      memoryUsage: `${stats.estimatedMemoryMB}/${stats.maxMemoryMB} MB`,
      warnings: stats.isNearLimit ? ['Sistema vicino ai limiti di capacità'] : []
    };
  }
}

// Export singleton
const multiRoomManager = new MultiRoomManager();
export default multiRoomManager;