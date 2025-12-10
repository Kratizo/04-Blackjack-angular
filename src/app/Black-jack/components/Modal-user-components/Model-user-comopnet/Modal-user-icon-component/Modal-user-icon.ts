import { Component, signal } from '@angular/core';
import { ModalUserContianer } from '../Modal-user-container-component/Modal-user-container';


@Component({
  selector: 'modal-user-icon',
  imports: [ModalUserContianer],
  templateUrl: './Modal-user-icon.html',

})
export class ModalUserIcon {

   ModalState = signal<boolean>(false)


  // Cuando le des click al icono:
  mostrarModal() {
    this.ModalState.set(true);
  }


}
