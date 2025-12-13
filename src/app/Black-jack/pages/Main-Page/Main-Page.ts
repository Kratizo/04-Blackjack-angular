import { Component, signal } from '@angular/core';
import type { CardPage } from '../../Interfaces/card-page.interface';
import { environment } from '../../../../environments/environment';
import { CardModeComponent } from '../../components/Card-mode-component/Card-mode-component';

@Component({
  selector: 'main-page',
  imports: [CardModeComponent],
  templateUrl: './Main-Page.html',
})
export default class MainPage {
  env = environment;

  cardPages = signal<CardPage[]>([
    {
      imagen: '/assets/img/Player-VS-IA.jpg',
      router: '/PlayerVsPc',
      label: 'Jugador VS Cpu',
    },
    {
      imagen: '/assets/img/Player-VS-Player.jpg',
      router: '/PlayerVsPlayer',
      label: 'Jugador VS Jugador',
    },
    {
      imagen: '/assets/img/online.jpg',
      router: '/Online',
      label: 'En linea',
    },
  ]);
}
