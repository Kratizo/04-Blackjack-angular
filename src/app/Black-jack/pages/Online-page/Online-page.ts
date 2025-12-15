import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PvpService } from '../../services/pvp.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'online-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Online-page.html',
})
export default class OnlinePage implements OnInit, OnDestroy {
  private pvpService = inject(PvpService);
  public authService = inject(AuthService);
  private router = inject(Router);

  // Initial state: User needs to enter URL
  serverUrl = signal<string>('http://localhost:3000');

  // Game Status: 'input_url' -> 'connecting' -> 'waiting' -> 'playing' -> 'game_over'
  gameStatus = signal<'input_url' | 'connecting' | 'waiting' | 'playing' | 'game_over'>('input_url');

  connectionError = signal<string | null>(null);
  myId = signal<string>('');
  rematchRequested = signal(false);

  // Game State
  players = signal<any>({}); // { [id]: info }
  hands = signal<any>({}); // { [id]: card[] }
  turn = signal<string>('');
  scores = signal<any>({});
  winner = signal<string | null>(null);

  // Computed
  opponentId = computed(() => {
    const ids = Object.keys(this.players());
    return ids.find(id => id !== this.myId());
  });

  myHand = computed(() => this.hands()[this.myId()] || []);
  opponentHand = computed(() => {
      const oid = this.opponentId();
      return oid ? (this.hands()[oid] || []) : [];
  });

  opponentInfo = computed(() => {
      const oid = this.opponentId();
      return oid ? this.players()[oid] : null;
  });

  myScore = computed(() => this.scores()[this.myId()] || 0);
  opponentScore = computed(() => {
      const oid = this.opponentId();
      return oid ? (this.scores()[oid] || 0) : 0;
  });

  isMyTurn = computed(() => this.turn() === this.myId());

  ngOnInit() {
      const user = this.authService.currentUser();
      if (!user) {
          this.router.navigate(['/auth']);
          return;
      }
      // Unlike PvP, we don't connect immediately. We wait for user input.
  }

  connectToServer() {
      const url = this.serverUrl();
      if (!url) {
          this.connectionError.set("Por favor ingresa una URL válida.");
          return;
      }

      this.gameStatus.set('connecting');
      this.connectionError.set(null);

      const user = this.authService.currentUser();
      if (!user) return;

      // Listen for connection errors
      this.pvpService.connectionError$.subscribe(err => {
          this.connectionError.set(err);
          this.gameStatus.set('input_url'); // Go back to input on error
      });

      this.pvpService.connect({
          alias: user.alias,
          frameIcon: user.frameIcon,
          userIcon: user.userIcon,
          slogan: user.slogan
      }, url);

      this.setupListeners();
  }

  setupListeners() {
      this.pvpService.listen('waiting_for_opponent').subscribe(() => {
          console.log('Received waiting_for_opponent');
          this.gameStatus.set('waiting');
          this.myId.set(this.pvpService.getSocketId() || '');
      });

      this.pvpService.listen('game_start').subscribe((data: any) => {
          console.log('Received game_start', data);
          this.myId.set(this.pvpService.getSocketId() || '');
          this.players.set(data.players);
          this.hands.set(data.hands);
          this.turn.set(data.turn);
          if (data.scores) {
             this.scores.set(data.scores);
          }
          this.rematchRequested.set(false);
          this.gameStatus.set('playing');
      });

      this.pvpService.listen('game_update').subscribe((data: any) => {
          this.turn.set(data.turn);
          this.hands.set(data.hands);
          this.scores.set(data.scores);
      });

      this.pvpService.listen('game_over').subscribe((data: any) => {
          this.winner.set(data.winner);
          this.hands.set(data.hands);
          this.scores.set(data.scores);
          this.gameStatus.set('game_over');
      });

      this.pvpService.listen('player_left').subscribe(() => {
          alert('El oponente se desconectó.');
          this.goHome();
      });
  }

  ngOnDestroy() {
      this.pvpService.disconnect();
  }

  hit() {
      if (this.isMyTurn()) {
          this.pvpService.emit('hit');
      }
  }

  stand() {
      if (this.isMyTurn()) {
          this.pvpService.emit('stand');
      }
  }

  rematch() {
      this.rematchRequested.set(true);
      this.pvpService.emit('rematch');
  }

  goHome() {
      this.router.navigate(['/']);
  }

  getFrameClass(frameId: string | undefined): string {
    return frameId || '';
  }
}
