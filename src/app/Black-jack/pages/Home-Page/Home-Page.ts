import { Component, signal } from '@angular/core';
import type { CardPage } from '../../Interfaces/Card-Page-interface';
import { environment } from '../../../../environments/environment';
import { CardModeComponent } from '../../components/Card-mode-component/Card-mode-component';





  @Component({
    selector: 'Home-page',
    imports: [CardModeComponent],
    templateUrl: './Home-Page.html',
  })
  export  default class HomePage {

    env = environment;

    cartPage = signal<CardPage[] >([
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

      ])

  }
