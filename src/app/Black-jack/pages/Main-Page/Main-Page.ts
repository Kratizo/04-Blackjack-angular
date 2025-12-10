import { Component, signal } from '@angular/core';
import type { CartPage } from '../../Interfaces/CartPage-interface';
import { environment } from '../../../../environments/environment';
import { CardModeComponent } from '../../components/Card-mode-component/Card-mode-component';
import { ModalUserIcon } from '../../components/Modal-user-components/Model-user-comopnet/Modal-user-icon-component/Modal-user-icon';




  @Component({
    selector: 'main-page',
    imports: [ CardModeComponent ,ModalUserIcon],
    templateUrl: './Main-Page.html',
  })
  export  default class MainPage {

    env = environment;

    cartPage = signal<CartPage[] >([
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
