const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Variable para guardar al jugador que está esperando rival
let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log('🔗 Nuevo socket conectado:', socket.id);

  socket.on('join_game', (playerInfo) => {
    console.log('👤 Jugador intenta unirse:', playerInfo.alias);

    // ESCENARIO 1: No hay nadie esperando. Este jugador debe esperar.
    if (!waitingPlayer) {
      waitingPlayer = {
        id: socket.id,
        info: playerInfo,
        socket: socket
      };

      // Le decimos a Angular: "Pon la pantalla de Esperando"
      socket.emit('waiting_for_opponent');
      console.log('⏳ Jugador puesto en espera.');

    }
    // ESCENARIO 2: Ya había alguien esperando. ¡A JUGAR!
    else {
      const player1 = waitingPlayer;
      const player2 = {
        id: socket.id,
        info: playerInfo,
        socket: socket
      };

      console.log(`⚔️ PARTIDA INICIADA: ${player1.info.alias} vs ${player2.info.alias}`);

      // Datos iniciales de la partida (Simulados para que arranque)
      const initialGameData = {
        players: {
          [player1.id]: player1.info,
          [player2.id]: player2.info
        },
        hands: {
          [player1.id]: [], // Aquí irían las cartas reales
          [player2.id]: []
        },
        scores: {
          [player1.id]: 0,
          [player2.id]: 0
        },
        turn: player1.id // Empieza el que estaba esperando
      };

      // Enviamos el evento 'game_start' a AMBOS jugadores
      player1.socket.emit('game_start', initialGameData);
      player2.socket.emit('game_start', initialGameData);

      // Limpiamos la sala de espera
      waitingPlayer = null;
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Jugador desconectado:', socket.id);
    // Si el que se fue era el que estaba esperando, limpiamos la variable
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
    // Aquí podrías emitir 'player_left' al oponente si estaban jugando
    io.emit('player_left', { id: socket.id });
  });
});

server.listen(3000, () => {
  console.log('🚀 SERVIDOR CORRIENDO EN PUERTO 3000');
});
