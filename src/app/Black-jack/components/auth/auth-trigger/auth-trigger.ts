import { Component, signal } from '@angular/core';
import { LoginFormComponent } from '../login-form/login-form';
import { RegisterFormComponent } from '../register-form/register-form';

@Component({
  selector: 'auth-trigger',
  imports: [LoginFormComponent, RegisterFormComponent],
  templateUrl: './auth-trigger.html',
})
export class AuthTriggerComponent {
  showMenu = signal(false);
  showLogin = signal(false);
  showRegister = signal(false);

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  openLogin() {
    this.showMenu.set(false);
    this.showLogin.set(true);
  }

  openRegister() {
    this.showMenu.set(false);
    this.showRegister.set(true);
  }

  closeLogin() {
    this.showLogin.set(false);
  }

  closeRegister() {
    this.showRegister.set(false);
  }

  onLogin(data: any) {
    console.log('Login data:', data);
    this.closeLogin();
  }

  onRegister(data: any) {
    console.log('Register data:', data);
    this.closeRegister();
  }
}
