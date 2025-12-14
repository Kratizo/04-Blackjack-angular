import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'frame-selection',
  imports: [],
  templateUrl: './frame-selection.html',
})
export class FrameSelectionComponent {
  close = output<void>();
  confirm = output<string>();

  frames = [
    { id: 'frame-default', name: 'Sin Marco', class: 'border-2 border-transparent' },
    { id: 'frame-gold', name: 'Dorado', class: 'border-4 border-yellow-500 shadow-[0_0_10px_#fbbf24]' },
    { id: 'frame-neon', name: 'Neón', class: 'border-4 border-blue-500 shadow-[0_0_15px_#3b82f6]' },
    { id: 'frame-fire', name: 'Fuego', class: 'border-4 border-red-600 border-dashed' },
    { id: 'frame-jungle', name: 'Selva', class: 'border-4 border-green-600 border-double' },
  ];

  selectedFrame = signal<string>('frame-default');

  selectFrame(id: string) {
    this.selectedFrame.set(id);
  }

  onConfirm() {
    this.confirm.emit(this.selectedFrame());
  }

  onClose() {
    this.close.emit();
  }
}
