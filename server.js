const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- LÓGICA DE CARTAS ---
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// En tu server.js, reemplaza la función createDeck antigua con esta:

function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      // 1. Calcular peso (Weight)
      let weight = parseInt(value);
      if (['J', 'Q', 'K'].includes(value)) weight = 10;
      if (value === 'A') weight = 11;

      // 2. Generar el CÓDIGO para la imagen (Igual que la API)
      // La API usa la primera letra del palo (H, D, C, S)
      // Y para el 10 usa un '0'. Para el resto usa el valor normal (K, Q, 2, etc.)

      let codeSuit = suit.charAt(0).toUpperCase(); // 'hearts' -> 'H'
      let codeValue = value;
      if (value === '10') codeValue = '0'; // La API usa '0' para el 10

      const code = codeValue + codeSuit; // Ej: "KH", "0D", "AS"

      // 3. Crear el objeto carta COMPLETO (con imagen)
      deck.push({
        code: code,
        value: value,
        suit: suit,
        weight: weight,
        // ESTA ES LA CLAVE: Generamos el link a la imagen oficial
        image: `https://deckofcardsapi.com/static/img/${code}.png`,
        images: {
            svg: `https://deckofcardsapi.com/static/img/${code}.svg`,
            png: `https://deckofcardsapi.com/static/img/${code}.png`
        }
      });
    }
  }
  return deck;
}
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// --- ESTADO DEL JUEGO ---
let waitingPlayer = null;
let games = {};

io.on('connection', (socket) => {
  console.log('🔗 Conectado:', socket.id);

  socket.on('join_game', (playerInfo) => {
    if (!waitingPlayer) {
      waitingPlayer = { id: socket.id, info: playerInfo, socket: socket };
      socket.emit('waiting_for_opponent');
    } else {
      // Iniciar Partida
      const p1 = waitingPlayer;
      const p2 = { id: socket.id, info: playerInfo, socket: socket };

      // 1. Crear y Barajar
      const deck = shuffle(createDeck());

      // 2. Repartir 2 cartas a cada uno
      const hand1 = [deck.pop(), deck.pop()];
      const hand2 = [deck.pop(), deck.pop()];

      const gameId = p1.id + p2.id;

      const gameData = {
        id: gameId,
        deck: deck,
        players: { [p1.id]: p1.info, [p2.id]: p2.info },
        hands: { [p1.id]: hand1, [p2.id]: hand2 },
        scores: {
          [p1.id]: calculateScore(hand1),
          [p2.id]: calculateScore(hand2)
        },
        turn: p1.id, // Empieza jugador 1
        playerStood: null, // NUEVO: Para saber si alguien ya se plantó
        sockets: [p1.socket, p2.socket]
      };

      games[p1.id] = gameData;
      games[p2.id] = gameData;

      const publicData = getPublicData(gameData);
      p1.socket.emit('game_start', publicData);
      p2.socket.emit('game_start', publicData);

      waitingPlayer = null;
      console.log('⚔️ Partida iniciada');
    }
  });

  // --- LÓGICA DE JUEGO MEJORADA ---

  socket.on('hit', () => {
    const game = games[socket.id];
    if (game && game.turn === socket.id) {
      // 1. Dar carta
      const card = game.deck.pop();
      game.hands[socket.id].push(card);
      game.scores[socket.id] = calculateScore(game.hands[socket.id]);

      // 2. Verificar si PERDIÓ (Bust > 21)
      if (game.scores[socket.id] > 21) {
        // El otro jugador gana inmediatamente
        const opponentId = Object.keys(game.players).find(id => id !== socket.id);
        finishGame(game, opponentId);
      } else {
        // Sigue jugando
        emitGameUpdate(game);
      }
    }
  });

  socket.on('stand', () => {
    const game = games[socket.id];
    if (game && game.turn === socket.id) {

      const opponentId = Object.keys(game.players).find(id => id !== socket.id);

      // CASO 1: Soy el primero en plantarme
      if (!game.playerStood) {
        game.playerStood = socket.id;
        game.turn = opponentId; // Le toca al otro
        emitGameUpdate(game);
      }
      // CASO 2: El otro ya se había plantado (Fin del juego)
      else {
        determineWinner(game);
      }
    }
  });

  socket.on('disconnect', () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) waitingPlayer = null;
    const game = games[socket.id];
    if (game) {
       game.sockets.forEach(s => s.emit('player_left'));
       delete games[game.sockets[0].id];
       if(game.sockets[1]) delete games[game.sockets[1].id];
    }
  });
});

// --- FUNCIONES AUXILIARES ---

function calculateScore(hand) {
  let score = 0;
  let aces = 0;
  for (let card of hand) {
    score += card.weight;
    if (card.value === 'A') aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

// Nueva función para calcular quién ganó al final
function determineWinner(game) {
  const ids = Object.keys(game.scores);
  const p1 = ids[0];
  const p2 = ids[1];

  const s1 = game.scores[p1];
  const s2 = game.scores[p2];

  let winnerId = null;

  if (s1 > s2) winnerId = p1;
  else if (s2 > s1) winnerId = p2;
  else winnerId = 'draw'; // Empate

  finishGame(game, winnerId);
}

// Nueva función para terminar y avisar
function finishGame(game, winnerId) {
  const publicData = getPublicData(game);
  publicData.winner = winnerId; // Agregamos el ganador

  game.sockets.forEach(s => s.emit('game_over', publicData));

  // Limpieza
  delete games[game.sockets[0].id];
  if(game.sockets[1]) delete games[game.sockets[1].id];
}

function getPublicData(game) {
  return {
    players: game.players,
    hands: game.hands,
    scores: game.scores,
    turn: game.turn
  };
}

function emitGameUpdate(game) {
  const publicData = getPublicData(game);
  game.sockets.forEach(s => s.emit('game_update', publicData));
}

server.listen(3000, () => console.log('🚀 Server listo con Lógica Completa'));
