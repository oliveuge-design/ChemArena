import { Server } from "socket.io"
import { GAME_STATE_INIT, WEBSOCKET_SERVER_PORT } from "../config.mjs"
import Manager from "./roles/manager.js"
import Player from "./roles/player.js"
import { abortCooldown } from "./utils/cooldown.js"
import deepClone from "./utils/deepClone.js"
import multiRoomManager from "./multiRoomManager.js"
import roomLimiter from "./utils/roomLimiter.js"

// LEGACY: Mantenuto per backward compatibility temporanea
let gameState = deepClone(GAME_STATE_INIT)
console.log(`🏢 Multi-Room System initialized`)
console.log(`📊 System limits:`, roomLimiter.getCurrentStats())

const io = new Server({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://*.onrender.com", "https://*.render.com"] 
      : "*",
    credentials: true,
  },
})

console.log(`🚀 Socket Server running on port ${WEBSOCKET_SERVER_PORT}`)
console.log(`🎮 Game URL: http://localhost:3000`)
console.log(`👨‍🏫 Dashboard URL: http://localhost:3000/dashboard`)
console.log(`📝 Password Dashboard: admin123`)
console.log(`───────────────────────────────────────`)
io.listen(WEBSOCKET_SERVER_PORT)
console.log(`🔌 Socket server listening on port ${WEBSOCKET_SERVER_PORT}`)

io.on("connection", (socket) => {
  console.log(`👋 User connected ${socket.id}`)

  // Log all incoming events for debugging (disabled in production)
  if (process.env.NODE_ENV === 'development') {
    socket.onAny((event, ...args) => {
      console.log(`📨 Event received: ${event}`, args)
    })
  }

  // ============================================
  // MULTI-ROOM PLAYER EVENTS
  // ============================================

  socket.on("player:checkRoom", (roomId) => {
    const roomState = multiRoomManager.getRoomState(roomId);
    if (roomState) {
      Player.checkRoom(roomState, io, socket, roomId);
    } else {
      // Fallback per room non trovate
      socket.emit("player:roomNotFound", { roomId });
    }
  });

  socket.on("player:join", (player) => {
    console.log(`🚀 Player ${socket.id} attempting to join room ${player.room} with username: ${player.username}`);

    const roomState = multiRoomManager.getPlayerRoom(socket.id) ||
                     multiRoomManager.getRoomState(player.room);

    if (roomState) {
      console.log(`✅ Room state found for ${player.room}, checking username...`);

      // Controlla username duplicati PRIMA di aggiungere
      if (roomState.players.find((p) => p.username === player.username)) {
        console.log(`❌ Username already exists: ${player.username}`)
        socket.emit("game:errorMessage", "Username already exists")
        return
      }

      console.log(`✅ Username ${player.username} available, adding to room...`);

      const joinResult = multiRoomManager.addPlayerToRoom(
        roomState.room,
        socket.id,
        player
      );

      if (joinResult.success) {
        console.log(`✅ Player ${player.username} successfully added to MultiRoomManager, calling Player.join...`);
        // Rimuovi il controllo duplicati da Player.join (ora fatto sopra)
        Player.join(roomState, io, socket, player);
      } else {
        console.log(`❌ Failed to add player to room: ${joinResult.error}`);
        socket.emit("player:joinError", {
          error: joinResult.error
        });
      }
    } else {
      console.log(`❌ Room state NOT found for room ${player.room}`);
      socket.emit("player:roomNotFound", { room: player.room });
    }
  });

  // ============================================
  // MULTI-ROOM MANAGER EVENTS
  // ============================================

  socket.on("manager:createRoom", (data = {}, ackCallback) => {
    const teacherId = data.teacherId || `teacher_${socket.id}`;
    console.log(`📍 [SOCKET] manager:createRoom received from ${socket.id}`);
    console.log(`📍 [SOCKET] Data:`, JSON.stringify(data, null, 2));

    try {
      const result = multiRoomManager.createRoom(socket.id, teacherId, data);
      console.log(`📍 [SOCKET] createRoom result:`, result);

      if (result.success) {
        socket.join(result.roomId);

        // 🔧 FIX RENDER: Emit multipli con logging
        console.log(`📤 [SOCKET] Emitting manager:inviteCode with PIN: ${result.roomId}`);
        socket.emit("manager:inviteCode", result.roomId);

        socket.emit("manager:roomCreated", {
          roomId: result.roomId,
          stats: result.stats
        });

        console.log(`✅ Room ${result.roomId} created for ${teacherId}`);

        // 🔧 FIX: Acknowledge immediato
        if (typeof ackCallback === 'function') {
          ackCallback({
            success: true,
            roomId: result.roomId,
            message: 'Room created successfully'
          });
        }

        // 🔧 FIX: Retry emit dopo delay
        setTimeout(() => {
          console.log(`🔁 Retry emit manager:inviteCode: ${result.roomId}`);
          socket.emit("manager:inviteCode", result.roomId);
        }, 200);

      } else {
        console.error(`❌ [SOCKET] Room creation FAILED:`, result.error);
        socket.emit("manager:createRoomError", {
          error: result.error,
          suggestions: result.suggestions,
          stats: result.stats
        });

        console.log(`❌ Room creation failed for ${teacherId}: ${result.error}`);

        if (typeof ackCallback === 'function') {
          ackCallback({
            success: false,
            error: result.error
          });
        }
      }
    } catch (error) {
      console.error(`❌ [SOCKET] EXCEPTION in manager:createRoom:`, error);
      socket.emit("manager:createRoomError", {
        error: "Errore interno del server",
        suggestions: ["Riprova tra qualche secondo", "Contatta il supporto se persiste"],
        details: error.message
      });

      if (typeof ackCallback === 'function') {
        ackCallback({
          success: false,
          error: "Errore interno del server",
          details: error.message
        });
      }
    }
  });
  // Altri eventi manager (multi-room aware)
  socket.on("manager:kickPlayer", (playerId) => {
    const roomState = multiRoomManager.getManagerRoom(socket.id);
    if (roomState) {
      multiRoomManager.removePlayerFromRoom(playerId);
      Manager.kickPlayer(roomState, io, socket, playerId);
    }
  });

  socket.on("manager:startGame", () => {
    const roomState = multiRoomManager.getManagerRoom(socket.id);
    if (roomState) {
      multiRoomManager.updateRoomActivity(roomState.room, 'active');
      Manager.startGame(roomState, io, socket, multiRoomManager);
    }
  });

  socket.on("player:selectedAnswer", (answerKey) => {
    const roomState = multiRoomManager.getPlayerRoom(socket.id);
    if (roomState) {
      Player.selectedAnswer(roomState, io, socket, answerKey);
    }
  });

  socket.on("manager:abortQuiz", () => {
    const roomState = multiRoomManager.getManagerRoom(socket.id);
    if (roomState) {
      Manager.abortQuiz(roomState, io, socket);
      multiRoomManager.removeRoom(roomState.room, 'aborted');
    }
  });

  socket.on("manager:nextQuestion", () => {
    const roomState = multiRoomManager.getManagerRoom(socket.id);
    if (roomState) {
      Manager.nextQuestion(roomState, io, socket, multiRoomManager);
    }
  });

  socket.on("manager:showLeaderboard", () => {
    const roomState = multiRoomManager.getManagerRoom(socket.id);
    if (roomState) {
      Manager.showLeaderboard(roomState, io, socket);
    }
  });

  socket.on("manager:resetGame", () => {
    const roomState = multiRoomManager.getManagerRoom(socket.id);
    if (roomState) {
      Manager.resetGame(roomState, io, socket);
      multiRoomManager.updateRoomActivity(roomState.room, 'waiting');
    }
  });

  socket.on("manager:forceReset", () => {
    const roomState = multiRoomManager.getManagerRoom(socket.id);
    if (roomState) {
      Manager.forceReset(roomState, io, socket);
      multiRoomManager.removeRoom(roomState.room, 'force_reset');
    }
  });

  // ============================================
  // ADMIN & SYSTEM EVENTS
  // ============================================

  // Sistema di aggiornamento per room specifica
  socket.on("admin:updateRoomState", (updateData) => {
    try {
      const roomId = updateData.roomId;
      const roomState = multiRoomManager.getRoomState(roomId);

      if (!roomState) {
        socket.emit("admin:updateError", `Room ${roomId} non trovata`);
        return;
      }

      console.log(`🔄 Aggiornamento room ${roomId}...`);

      if (updateData.password) {
        roomState.password = updateData.password;
        console.log(`🔑 Password aggiornata per room ${roomId}: ${updateData.password}`);
      }

      if (updateData.subject) {
        roomState.subject = updateData.subject;
        console.log(`📚 Materia aggiornata per room ${roomId}: ${updateData.subject}`);
      }

      if (updateData.questions) {
        roomState.questions = updateData.questions;
        console.log(`❓ Domande aggiornate per room ${roomId}: ${updateData.questions.length} domande`);
      }

      socket.emit("admin:roomStateUpdated", {
        roomId,
        password: roomState.password,
        subject: roomState.subject,
        questionsCount: roomState.questions.length
      });

      console.log(`✅ Room ${roomId} aggiornata con successo!`);

    } catch (error) {
      console.error('❌ Errore aggiornamento room:', error);
      socket.emit("admin:updateError", error.message);
    }
  });

  // Ottieni statistiche sistema
  socket.on("admin:getSystemStats", () => {
    socket.emit("admin:systemStats", multiRoomManager.getSystemStats());
  });

  // Ottieni info specifica room
  socket.on("admin:getRoomState", (roomId) => {
    const roomState = multiRoomManager.getRoomState(roomId);
    if (roomState) {
      socket.emit("admin:roomState", {
        roomId,
        password: roomState.password,
        subject: roomState.subject,
        questionsCount: roomState.questions.length,
        started: roomState.started,
        playersCount: roomState.players.length,
        teacherId: roomState.teacherId
      });
    } else {
      socket.emit("admin:roomNotFound", { roomId });
    }
  });

  // Health check sistema
  socket.on("admin:healthCheck", () => {
    socket.emit("admin:healthStatus", multiRoomManager.healthCheck());
  });

  // ============================================
  // DISCONNECT HANDLING (MULTI-ROOM)
  // ============================================

  socket.on("disconnect", () => {
    console.log(`👋 User disconnected ${socket.id}`);

    // Controlla se è un manager
    const managerRoom = multiRoomManager.getManagerRoom(socket.id);
    if (managerRoom) {
      console.log(`🚨 Manager disconnected for room ${managerRoom.room}`);

      // Notifica tutti i player della room
      io.to(managerRoom.room).emit("game:reset");

      // Rimuovi la room completamente
      multiRoomManager.removeRoom(managerRoom.room, 'manager_disconnect');

      // Abort eventuali cooldown per questa room
      abortCooldown(null, io, managerRoom.room);

      return;
    }

    // Controlla se è un player
    const playerRoom = multiRoomManager.getPlayerRoom(socket.id);
    if (playerRoom) {
      console.log(`👤 Player disconnected from room ${playerRoom.room}`);

      // Rimuovi il player dalla room
      multiRoomManager.removePlayerFromRoom(socket.id);

      // Notifica il manager della rimozione
      if (playerRoom.manager) {
        socket.to(playerRoom.manager).emit("manager:removePlayer", socket.id);
      }

      return;
    }

    // LEGACY: Gestione fallback per compatibilità
    if (gameState.manager === socket.id) {
      console.log("🔄 Legacy manager disconnect");
      io.to(gameState.room).emit("game:reset");
      gameState.started = false;
      gameState = deepClone(GAME_STATE_INIT);
      abortCooldown(gameState, io, gameState.room);
      return;
    }

    const player = gameState.players.find((p) => p.id === socket.id);
    if (player) {
      gameState.players = gameState.players.filter((p) => p.id !== socket.id);
      socket.to(gameState.manager).emit("manager:removePlayer", player.id);
    }
  });
})
