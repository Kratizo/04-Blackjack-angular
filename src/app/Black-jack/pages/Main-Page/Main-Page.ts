import { Component, signal } from '@angular/core';
import type { CardPage } from '../../Interfaces/card-page.interface';
import { environment } from '../../../../environments/environment';
import { CardModeComponent } from '../../components/Card-mode-component/Card-mode-component';
import { AuthTriggerComponent } from '../../components/auth/auth-trigger/auth-trigger';

@Component({
  selector: 'main-page',
  imports: [CardModeComponent, AuthTriggerComponent],
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
