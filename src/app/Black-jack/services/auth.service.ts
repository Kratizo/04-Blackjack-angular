import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { User } from '../Interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  private usersKey = 'blackjack_users';
  private sessionKey = 'blackjack_session';
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Load session on init only if in browser
    if (isPlatformBrowser(this.platformId)) {
        const savedSession = localStorage.getItem(this.sessionKey);
        if (savedSession) {
          try {
              this.currentUser.set(JSON.parse(savedSession));
          } catch (e) {
              console.error("Failed to parse session", e);
              localStorage.removeItem(this.sessionKey);
          }
        }
    }

    // Effect to sync session to local storage
    effect(() => {
      const user = this.currentUser();
      if (isPlatformBrowser(this.platformId)) {
          try {
            if (user) {
              localStorage.setItem(this.sessionKey, JSON.stringify(user));
            } else {
              localStorage.removeItem(this.sessionKey);
            }
          } catch (e) {
            console.error("Failed to save session:", e);
          }
      }
    });
  }

  getUsers(): User[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const usersStr = localStorage.getItem(this.usersKey);
    try {
        return usersStr ? JSON.parse(usersStr) : [];
    } catch (e) {
        return [];
    }
  }

  saveUsers(users: User[]) {
    if (isPlatformBrowser(this.platformId)) {
        try {
            localStorage.setItem(this.usersKey, JSON.stringify(users));
        } catch (e) {
            console.error("Failed to save users database:", e);
            throw new Error("No se pudo guardar el usuario. Es posible que el almacenamiento esté lleno.");
        }
    }
  }

  register(user: User): boolean {
    const users = this.getUsers();
    if (users.find(u => u.alias === user.alias)) {
      return false; // User already exists
    }

    users.push(user);

    // logic moved here to handle potential error from saveUsers
    this.saveUsers(users);

    this.currentUser.set(user);
    return true;
  }

  login(alias: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.alias === alias && u.password === password);
    if (user) {
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
  }

  updateUser(updatedUser: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.alias === this.currentUser()?.alias);

    if (index !== -1) {
      if (updatedUser.alias !== this.currentUser()?.alias) {
         if (users.find(u => u.alias === updatedUser.alias)) {
             throw new Error("Alias ya existe");
         }
      }

      users[index] = updatedUser;
      this.saveUsers(users);
      this.currentUser.set(updatedUser);
    }
  }
}
