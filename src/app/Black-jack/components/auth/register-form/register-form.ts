import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'register-form',
  imports: [FormsModule],
  templateUrl: './register-form.html',
})
export class RegisterFormComponent {
  close = output<void>();
  save = output<any>();

  alias = signal('');
  password = signal('');
  confirmPassword = signal('');
  imageUrl = signal('');

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.password() !== this.confirmPassword()) {
      alert('Las contraseñas no coinciden');
      return;
    }
    this.save.emit({
      alias: this.alias(),
      password: this.password(),
      imageUrl: this.imageUrl()
    });
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
}
