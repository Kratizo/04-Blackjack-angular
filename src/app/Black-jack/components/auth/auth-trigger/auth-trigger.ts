import { Component, signal, inject } from '@angular/core';
import { LoginFormComponent } from '../login-form/login-form';
import { RegisterFormComponent } from '../register-form/register-form';
import { EditProfileComponent } from '../edit-profile/edit-profile';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'auth-trigger',
  imports: [LoginFormComponent, RegisterFormComponent, EditProfileComponent],
  templateUrl: './auth-trigger.html',
})
export class AuthTriggerComponent {
  authService = inject(AuthService);

  showMenu = signal(false);
  showLogin = signal(false);
  showRegister = signal(false);
  showEditProfile = signal(false);

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

  openEditProfile() {
    this.showMenu.set(false);
    this.showEditProfile.set(true);
  }

  logout() {
    this.authService.logout();
    this.showMenu.set(false);
  }

  closeLogin() {
    this.showLogin.set(false);
  }

  closeRegister() {
    this.showRegister.set(false);
  }

  onLogin(data: any) {
    const success = this.authService.login(data.alias, data.password);
    if (success) {
      this.closeLogin();
    } else {
      alert('Credenciales incorrectas');
    }
  }

  onRegister(data: any) {
    const success = this.authService.register({
      alias: data.alias,
      password: data.password,
      userIcon: data.imageUrl,
      slogan: '',
      frameIcon: 'frame-default'
    });

    if (success) {
      this.closeRegister();
    } else {
      alert('El usuario ya existe');
    }
  }
}
