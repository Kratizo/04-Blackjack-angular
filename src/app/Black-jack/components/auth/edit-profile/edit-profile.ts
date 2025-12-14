import { Component, output, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { FrameSelectionComponent } from '../frame-selection/frame-selection';

@Component({
  selector: 'edit-profile',
  imports: [FormsModule, FrameSelectionComponent],
  templateUrl: './edit-profile.html',
})
export class EditProfileComponent implements OnInit {
  authService = inject(AuthService);
  close = output<void>();

  alias = signal('');
  password = signal('');
  imageUrl = signal('');
  slogan = signal('');
  frameIcon = signal('frame-default');

  showFrameSelection = signal(false);

  slogans = [
    "¡Apuesto todo!",
    "Rey del Blackjack",
    "La suerte está echada",
    "Nunca me rindo",
    "Calculando probabilidades..."
  ];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.alias.set(user.alias);
      this.password.set(user.password);
      this.imageUrl.set(user.userIcon);
      this.slogan.set(user.slogan || this.slogans[0]);
      this.frameIcon.set(user.frameIcon || 'frame-default');
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    try {
      this.authService.updateUser({
        alias: this.alias(),
        password: this.password(),
        userIcon: this.imageUrl(),
        slogan: this.slogan(),
        frameIcon: this.frameIcon()
      });
      this.close.emit();
    } catch (e) {
      alert(e);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  openFrameSelection() {
    this.showFrameSelection.set(true);
  }

  onFrameSelected(frameId: string) {
    this.frameIcon.set(frameId);
    this.showFrameSelection.set(false);
  }

  getFrameClass(frameId: string) {
      const frames: Record<string, string> = {
        'frame-default': 'border-2 border-transparent',
        'frame-gold': 'border-4 border-yellow-500 shadow-[0_0_10px_#fbbf24]',
        'frame-neon': 'border-4 border-blue-500 shadow-[0_0_15px_#3b82f6]',
        'frame-fire': 'border-4 border-red-600 border-dashed',
        'frame-jungle': 'border-4 border-green-600 border-double',
      };
      return frames[frameId] || frames['frame-default'];
  }
}
