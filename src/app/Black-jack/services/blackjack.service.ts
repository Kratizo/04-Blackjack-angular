import { Injectable, signal } from '@angular/core';

export interface Card {
  code: string;
  image: string;
  images: { svg: string; png: string };
  value: string;
  suit: string;
}

export interface DeckResponse {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

export interface DrawResponse {
  success: boolean;
  deck_id: string;
  cards: Card[];
  remaining: number;
}

@Injectable({
  providedIn: 'root'
})
export class BlackjackService {
  private apiUrl = 'https://deckofcardsapi.com/api/deck';

  constructor() {}

  async createNewDeck(): Promise<DeckResponse> {
    const response = await fetch(`${this.apiUrl}/new/shuffle/?deck_count=1`);
    return await response.json();
  }

  async drawCards(deckId: string, count: number): Promise<DrawResponse> {
    const response = await fetch(`${this.apiUrl}/${deckId}/draw/?count=${count}`);
    return await response.json();
  }

  async shuffleDeck(deckId: string): Promise<DeckResponse> {
      const response = await fetch(`${this.apiUrl}/${deckId}/shuffle/`);
      return await response.json();
  }

  calculateScore(cards: Card[]): number {
    let score = 0;
    let aces = 0;

    for (const card of cards) {
      if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
        score += 10;
      } else if (card.value === 'ACE') {
        aces += 1;
        score += 11;
      } else {
        score += parseInt(card.value);
      }
    }

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  }
}
