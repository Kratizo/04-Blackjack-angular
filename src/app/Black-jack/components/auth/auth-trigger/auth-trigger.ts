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

  // Notification State
  notificationMessage = signal<string | null>(null);

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

  showNotification(msg: string) {
      this.notificationMessage.set(msg);
      setTimeout(() => {
          this.notificationMessage.set(null);
      }, 3000);
  }

  onLogin(data: any) {
    const success = this.authService.login(data.alias, data.password);
    if (success) {
      this.closeLogin();
      this.showNotification(`Bienvenido de nuevo, ${data.alias}!`);
    } else {
      alert('Credenciales incorrectas');
    }
  }

  onRegister(data: any) {
    try {
        const success = this.authService.register({
          alias: data.alias,
          password: data.password,
          userIcon: data.imageUrl,
          slogan: '',
          frameIcon: 'frame-default'
        });

        if (success) {
          this.closeRegister();
          this.showNotification('Cuenta creada exitosamente y accedida');
        } else {
          alert('El usuario ya existe');
        }
    } catch (e: any) {
        console.error("Registration error:", e);
        alert('Error al crear cuenta: ' + (e.message || e));
    }
  }

  getFrameClass(frameId: string | undefined) {
      if (!frameId) return 'border border-white/50'; // Default fallback

      const frames: Record<string, string> = {
        'frame-default': 'border-2 border-transparent',
        'frame-gold': 'border-2 border-yellow-500 shadow-[0_0_10px_#fbbf24]', // Reduced width for small icon
        'frame-neon': 'border-2 border-blue-500 shadow-[0_0_10px_#3b82f6]',
        'frame-fire': 'border-2 border-red-600 border-dashed',
        'frame-jungle': 'border-2 border-green-600 border-double',
      };
      return frames[frameId] || 'border border-white/50';
  }
}
