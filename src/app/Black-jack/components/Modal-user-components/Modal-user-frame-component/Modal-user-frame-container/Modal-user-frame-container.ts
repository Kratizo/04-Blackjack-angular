import { Component, input, output } from '@angular/core';

@Component({
  selector: 'modal-user-frame-container',
  imports: [],
  templateUrl: './Modal-user-frame-container.html',

})
export class ModalUserFrameContainer {

   openFrameModal = input()

   closeFrameModal = output<boolean>();

    closeFrame() {
        this.closeFrameModal.emit(true); // emitimos que se quiere cerrar
    }

}
