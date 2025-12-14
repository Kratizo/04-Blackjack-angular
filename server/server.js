const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for LAN
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Game State Management
let waitingPlayer = null;
const rooms = {};

// Deck Helper Functions
const SUITS = ['H', 'D', 'C', 'S'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K', 'A'];

function createDeck() {
    let deck = [];
    for (let suit of SUITS) {
        for (let value of VALUES) {
            deck.push({ code: value + suit, value, suit });
        }
    }
    return shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getCardValue(card, currentTotal) {
    if (['J', 'Q', 'K', '0'].includes(card.value)) return 10;
    if (card.value === 'A') return 11; // Logic for 1/11 handled in hand calculation
    return parseInt(card.value);
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    for (let card of hand) {
        let val = getCardValue(card);
        if (val === 11) aces++;
        score += val;
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

function getImage(card) {
    // Mapping to deckofcardsapi images or local assets if available
    // For now using deckofcardsapi format
    // 0 is 10
    let v = card.value === '0' ? '0' : card.value;
    return `https://deckofcardsapi.com/static/img/${v}${card.suit}.png`;
}

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_game', (playerInfo) => {
        // playerInfo: { alias, frameIcon, etc }
        socket.data.playerInfo = playerInfo;

        if (waitingPlayer) {
            // Pair with waiting player
            const roomID = waitingPlayer.id + '#' + socket.id;
            const player1 = waitingPlayer;
            const player2 = socket;

            waitingPlayer = null;

            player1.join(roomID);
            player2.join(roomID);

            rooms[roomID] = {
                id: roomID,
                players: [player1.id, player2.id],
                playerData: {
                    [player1.id]: player1.data.playerInfo,
                    [player2.id]: player2.data.playerInfo
                },
                deck: createDeck(),
                hands: { [player1.id]: [], [player2.id]: [] },
                turn: player1.id, // Player 1 starts
                status: 'playing',
                stand: [] // IDs of players who stood
            };

            // Deal initial cards (2 each)
            dealCard(roomID, player1.id);
            dealCard(roomID, player2.id);
            dealCard(roomID, player1.id);
            dealCard(roomID, player2.id);

            io.to(roomID).emit('game_start', {
                roomID,
                players: rooms[roomID].playerData,
                turn: rooms[roomID].turn,
                hands: sanitizeHands(roomID),
                scores: {
                    [player1.id]: calculateScore(rooms[roomID].hands[player1.id]),
                    [player2.id]: calculateScore(rooms[roomID].hands[player2.id])
                }
            });

            console.log(`Game started in room ${roomID}`);

        } else {
            waitingPlayer = socket;
            socket.emit('waiting_for_opponent');
            console.log(`Player ${socket.id} waiting`);
        }
    });

    socket.on('hit', () => {
        const roomID = getRoomId(socket);
        if (!roomID || !rooms[roomID]) return;
        const game = rooms[roomID];

        if (game.turn !== socket.id) return;

        dealCard(roomID, socket.id);
        const score = calculateScore(game.hands[socket.id]);

        if (score > 21) {
            // Bust
            game.stand.push(socket.id);
            switchTurn(roomID);
        } else {
             // Continue turn? Or automatic switch?
             // In Blackjack, you can hit multiple times.
             // So turn remains with player until Stand or Bust.
             updateGame(roomID);
        }
    });

    socket.on('stand', () => {
        const roomID = getRoomId(socket);
        if (!roomID || !rooms[roomID]) return;
        const game = rooms[roomID];

        if (game.turn !== socket.id) return;

        game.stand.push(socket.id);
        switchTurn(roomID);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }

        // Handle active games
        const roomID = getRoomId(socket);
        if (roomID && rooms[roomID]) {
            io.to(roomID).emit('player_left');
            delete rooms[roomID];
        }
    });
});

function getRoomId(socket) {
    return Array.from(socket.rooms).find(r => r !== socket.id);
}

function dealCard(roomID, playerId) {
    const game = rooms[roomID];
    const card = game.deck.pop();
    card.image = getImage(card);
    game.hands[playerId].push(card);
    updateGame(roomID);
}

function switchTurn(roomID) {
    const game = rooms[roomID];
    const players = game.players;
    const currentPlayerIndex = players.indexOf(game.turn);
    const nextPlayer = players[(currentPlayerIndex + 1) % 2];

    // Check if next player has already stood
    if (game.stand.includes(nextPlayer)) {
        // Both stood (or one bust one stood) -> Game Over
        if (game.stand.includes(game.turn)) {
            endGame(roomID);
            return;
        }
    }

    // If current player busted, they are done.
    // If current player stood, they are done.
    // If next player hasn't stood, pass turn.

    // Simple Logic:
    // P1 plays until stand/bust.
    // P2 plays until stand/bust.
    // End.

    // If current player just stood or busted:
    game.turn = nextPlayer;

    // If the new current player has already stood (meaning everyone is done)
    if (game.stand.includes(nextPlayer)) {
        endGame(roomID);
    } else {
        updateGame(roomID);
    }
}

function updateGame(roomID) {
    const game = rooms[roomID];
    io.to(roomID).emit('game_update', {
        turn: game.turn,
        hands: sanitizeHands(roomID),
        scores: {
            [game.players[0]]: calculateScore(game.hands[game.players[0]]),
            [game.players[1]]: calculateScore(game.hands[game.players[1]])
        }
    });
}

function sanitizeHands(roomID) {
    // Show all cards? Or hide opponent's?
    // In PvP, usually you see opponent's cards unless it's hidden hole card.
    // For simplicity, let's show all cards face up for now (like open hand blackjack)
    // OR we can hide the first card of opponent.
    // Let's keep it simple: Open hands.
    const game = rooms[roomID];
    return game.hands;
}

function endGame(roomID) {
    const game = rooms[roomID];
    const p1 = game.players[0];
    const p2 = game.players[1];

    const s1 = calculateScore(game.hands[p1]);
    const s2 = calculateScore(game.hands[p2]);

    let winner = null;

    if (s1 > 21 && s2 > 21) {
        winner = 'draw'; // Both bust
    } else if (s1 > 21) {
        winner = p2;
    } else if (s2 > 21) {
        winner = p1;
    } else if (s1 > s2) {
        winner = p1;
    } else if (s2 > s1) {
        winner = p2;
    } else {
        winner = 'draw';
    }

    io.to(roomID).emit('game_over', {
        winner,
        scores: { [p1]: s1, [p2]: s2 },
        hands: game.hands
    });

    // Clean up or allow restart?
    // For now, just leave it. Clients can disconnect to restart.
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
