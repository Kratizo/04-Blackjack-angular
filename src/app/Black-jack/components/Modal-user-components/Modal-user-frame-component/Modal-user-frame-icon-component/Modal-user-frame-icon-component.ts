import { Component, signal } from '@angular/core';
import { ModalUserFrameContainer } from '../Modal-user-frame-container/Modal-user-frame-container';


@Component({
  selector: 'modal-user-frame-icon-component',
  imports: [ModalUserFrameContainer],
  templateUrl: './Modal-user-frame-icon-component.html',
})
export class ModalUserFrameIconComponent {

   openFrameModal = signal<boolean>(false)


  // Cuando le des click al icono:
  mostrarFrameModal() {
    this.openFrameModal.set(true);
  }

}
