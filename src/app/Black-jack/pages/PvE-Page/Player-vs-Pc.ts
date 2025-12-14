import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { BlackjackService, Card } from '../../services/blackjack.service';
import { Router } from '@angular/router';

@Component({
  selector: 'player-vs-pc',
  imports: [CommonModule],
  templateUrl: './Player-vs-Pc.html',
})
export default class PlayerVsPc implements OnInit {
  authService = inject(AuthService);
  blackjackService = inject(BlackjackService);
  router = inject(Router);

  // Game State
  deckId = signal<string | null>(null);
  playerHand = signal<Card[]>([]);
  pcHand = signal<Card[]>([]);

  playerScore = signal(0);
  pcScore = signal(0);

  gameStatus = signal<'loading' | 'playing' | 'player_turn' | 'pc_turn' | 'finished'>('loading');
  winner = signal<'player' | 'pc' | 'draw' | null>(null);

  // UI Helpers
  pcHiddenCard = signal(true);

  ngOnInit() {
    this.startNewGame();
  }

  async startNewGame() {
    this.gameStatus.set('loading');
    this.winner.set(null);
    this.playerHand.set([]);
    this.pcHand.set([]);
    this.pcHiddenCard.set(true);

    try {
        const deck = await this.blackjackService.createNewDeck();
        this.deckId.set(deck.deck_id);

        // Initial Deal: 2 cards each
        const pCards = await this.blackjackService.drawCards(deck.deck_id, 2);
        this.playerHand.set(pCards.cards);

        const pcCards = await this.blackjackService.drawCards(deck.deck_id, 2);
        this.pcHand.set(pcCards.cards);

        this.updateScores();

        // Check for instant Blackjack
        if (this.playerScore() === 21) {
            this.handleBlackjack();
        } else {
            this.gameStatus.set('player_turn');
        }
    } catch (error) {
        console.error("Error starting game", error);
        alert("Error al conectar con el servicio de cartas.");
    }
  }

  updateScores() {
    this.playerScore.set(this.blackjackService.calculateScore(this.playerHand()));

    // PC Score only counts visible cards if hidden? Or we calculate real score but hide display?
    // Logic: calculate real score but don't show it to user if hidden card exists
    // Actually, for AI logic we need the real score.
    this.pcScore.set(this.blackjackService.calculateScore(this.pcHand()));
  }

  get visiblePcScore(): number | string {
      if (this.pcHiddenCard()) {
          // Assuming first card is visible, second is hidden
          // If we want strict logic: calculate score of visible cards only?
          // For simplicity, let's just show "?"
          return "?";
      }
      return this.pcScore();
  }

  async hit() {
      if (this.gameStatus() !== 'player_turn') return;

      const deckId = this.deckId();
      if (!deckId) return;

      const draw = await this.blackjackService.drawCards(deckId, 1);
      this.playerHand.update(hand => [...hand, ...draw.cards]);
      this.updateScores();

      if (this.playerScore() > 21) {
          this.finishGame('pc'); // Bust
      }
  }

  stand() {
      if (this.gameStatus() !== 'player_turn') return;
      this.gameStatus.set('pc_turn');
      this.playPcTurn();
  }

  async playPcTurn() {
      // Reveal card
      this.pcHiddenCard.set(false);

      // AI Logic: Hit until 17
      let currentScore = this.pcScore();

      // Delay loop for visual effect
      while (currentScore < 17) {
          await new Promise(r => setTimeout(r, 1000)); // Wait 1s
          const deckId = this.deckId();
          if (deckId) {
             const draw = await this.blackjackService.drawCards(deckId, 1);
             this.pcHand.update(hand => [...hand, ...draw.cards]);
             this.updateScores();
             currentScore = this.pcScore();
          }
      }

      this.determineWinner();
  }

  determineWinner() {
      const pScore = this.playerScore();
      const dScore = this.pcScore();

      if (dScore > 21) {
          this.finishGame('player');
      } else if (pScore > dScore) {
          this.finishGame('player');
      } else if (dScore > pScore) {
          this.finishGame('pc');
      } else {
          this.finishGame('draw');
      }
  }

  handleBlackjack() {
      // Check if PC also has blackjack
      // If PC has 21 with 2 cards, it's a push?
      // For now, let's just say player wins or reveal pc cards
      this.pcHiddenCard.set(false);
      if (this.pcScore() === 21) {
          this.finishGame('draw');
      } else {
          this.finishGame('player');
      }
  }

  finishGame(winner: 'player' | 'pc' | 'draw') {
      this.pcHiddenCard.set(false); // Ensure revealed
      this.winner.set(winner);
      this.gameStatus.set('finished');
  }

  goHome() {
      this.router.navigate(['/home']);
  }

  getFrameClass(frameId: string | undefined) {
      if (!frameId) return 'border-2 border-transparent';
      const frames: Record<string, string> = {
        'frame-default': 'border-2 border-transparent',
        'frame-gold': 'border-4 border-yellow-500 shadow-[0_0_10px_#fbbf24]',
        'frame-neon': 'border-4 border-blue-500 shadow-[0_0_15px_#3b82f6]',
        'frame-fire': 'border-4 border-red-600 border-dashed',
        'frame-jungle': 'border-4 border-green-600 border-double',
      };
      return frames[frameId] || frames['frame-default'];
  }
}
