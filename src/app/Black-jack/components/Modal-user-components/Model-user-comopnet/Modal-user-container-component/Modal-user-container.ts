import { Component, input, output } from '@angular/core';
import { ModalUserDataComponent } from '../Modal-user-data-component/Modal-user-data-component';


@Component({
  selector: 'modal-user-container',
  imports: [ModalUserDataComponent],
  templateUrl: './Modal-user-container.html',
})
export class ModalUserContianer {

    openModal = input()
     // Output reactivo
    closeModal = output<boolean>();

    close() {
        this.closeModal.emit(true); // emitimos que se quiere cerrar
    }

 }
