import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'login-form',
  imports: [FormsModule],
  templateUrl: './login-form.html',
})
export class LoginFormComponent {
  close = output<void>();
  save = output<{alias: string, password: string}>();

  alias = signal('');
  password = signal('');

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit({ alias: this.alias(), password: this.password() });
  }
}
