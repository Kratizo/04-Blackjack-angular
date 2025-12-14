const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const axios = require('axios');

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- HELPER FUNCTIONS FOR CARDS ---
const API_URL = 'https://deckofcardsapi.com/api/deck';

async function createDeck() {
  try {
    const response = await axios.get(`${API_URL}/new/shuffle/?deck_count=6`);
    return response.data.deck_id;
  } catch (error) {
    console.error('Error creating deck:', error);
    return null;
  }
}

async function drawCards(deckId, count = 1) {
  try {
    const response = await axios.get(`${API_URL}/${deckId}/draw/?count=${count}`);
    return response.data.cards;
  } catch (error) {
    console.error('Error drawing cards:', error);
    return [];
  }
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  for (const card of hand) {
    let value = card.value;
    if (['KING', 'QUEEN', 'JACK', '0'].includes(value)) {
      score += 10;
    } else if (value === 'ACE') {
      aces += 1;
      score += 11;
    } else {
      score += parseInt(value);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
}

// Variable para guardar al jugador que está esperando rival
let waitingPlayer = null;

// Mapa de partidas activas: key = socket.id (de cualquiera de los dos), value = gameData
// Mejor: key = roomId (podemos usar el socket.id del player 1 como room id)
const activeGames = {};

io.on('connection', (socket) => {
  console.log('🔗 Nuevo socket conectado:', socket.id);

  socket.on('join_game', async (playerInfo) => {
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

      // Crear mazo nuevo
      const deckId = await createDeck();

      // Robar manos iniciales (2 cartas cada uno)
      const p1Cards = await drawCards(deckId, 2);
      const p2Cards = await drawCards(deckId, 2);

      // Datos iniciales de la partida
      const gameId = player1.id; // Usamos el ID del player 1 como ID de la partida
      const initialGameData = {
        gameId: gameId,
        deckId: deckId,
        players: {
          [player1.id]: player1.info,
          [player2.id]: player2.info
        },
        hands: {
          [player1.id]: p1Cards,
          [player2.id]: p2Cards
        },
        scores: {
          [player1.id]: calculateScore(p1Cards),
          [player2.id]: calculateScore(p2Cards)
        },
        turn: player1.id, // Empieza el que estaba esperando (Player 1)
        playerIds: [player1.id, player2.id],
        status: 'playing' // playing, game_over
      };

      // Guardar partida en memoria
      activeGames[player1.id] = initialGameData;
      activeGames[player2.id] = initialGameData;

      // Unir sockets a una sala
      player1.socket.join(gameId);
      player2.socket.join(gameId);

      // Enviamos el evento 'game_start' a la sala
      io.to(gameId).emit('game_start', initialGameData);

      // Limpiamos la sala de espera
      waitingPlayer = null;
    }
  });

  socket.on('hit', async () => {
    const game = activeGames[socket.id];
    if (!game || game.status !== 'playing') return;

    if (game.turn !== socket.id) {
       console.log(`⚠️ Jugador ${socket.id} intentó jugar fuera de turno.`);
       return;
    }

    // Robar carta
    const newCards = await drawCards(game.deckId, 1);
    if (newCards.length > 0) {
       const card = newCards[0];
       game.hands[socket.id].push(card);
       game.scores[socket.id] = calculateScore(game.hands[socket.id]);

       // Verificar si se pasó (Bust)
       if (game.scores[socket.id] > 21) {
          endGame(game, getOpponentId(game, socket.id)); // Gana el otro
       } else {
          // Sigue jugando el mismo (en Blackjack si pides carta, sigue tu turno hasta plantarte o pasarte)
           io.to(game.gameId).emit('game_update', {
               hands: game.hands,
               scores: game.scores,
               turn: game.turn
           });
       }
    }
  });

  socket.on('stand', () => {
      const game = activeGames[socket.id];
      if (!game || game.status !== 'playing') return;

      if (game.turn !== socket.id) return;

      const p1Id = game.playerIds[0];
      const p2Id = game.playerIds[1];

      // Si el turno era del Player 1, pasa al Player 2
      if (socket.id === p1Id) {
          game.turn = p2Id;
          io.to(game.gameId).emit('game_update', {
              hands: game.hands,
              scores: game.scores,
              turn: game.turn
          });
      }
      // Si el turno era del Player 2, se acaba el juego (ambos jugaron)
      else {
          // Comparar puntajes
          const score1 = game.scores[p1Id];
          const score2 = game.scores[p2Id];

          let winnerId = null;
          // Ya sabemos que P2 no se pasó (si no, hubiera perdido en 'hit').
          // Y P1 tampoco se pasó (si no, hubiera perdido antes).

          if (score1 > score2) winnerId = p1Id;
          else if (score2 > score1) winnerId = p2Id;
          else winnerId = 'draw';

          endGame(game, winnerId);
      }
  });

  socket.on('disconnect', () => {
    console.log('❌ Jugador desconectado:', socket.id);

    // Si estaba esperando
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    // Si estaba en partida
    const game = activeGames[socket.id];
    if (game) {
        io.to(game.gameId).emit('player_left', { id: socket.id });
        // Limpiar referencia para ambos jugadores
        game.playerIds.forEach(pid => delete activeGames[pid]);
    }
  });
});

function getOpponentId(game, myId) {
    return game.playerIds.find(id => id !== myId);
}

function endGame(game, winnerId) {
    game.status = 'game_over';
    io.to(game.gameId).emit('game_over', {
        winner: winnerId,
        hands: game.hands,
        scores: game.scores
    });
    // Limpiar partida
    game.playerIds.forEach(pid => delete activeGames[pid]);
}

server.listen(3000, () => {
  console.log('🚀 SERVIDOR CORRIENDO EN PUERTO 3000');
});
