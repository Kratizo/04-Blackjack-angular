import { Injectable, signal, effect, PLATFORM_ID, inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { User } from '../Interfaces/User.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  private usersKey = 'blackjack_users';
  private sessionKey = 'blackjack_session';
  private lastActivityKey = 'blackjack_last_activity';
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  // Timeout in milliseconds (e.g., 15 minutes = 15 * 60 * 1000)
  private readonly TIMEOUT_MS = 15 * 60 * 1000;
  private activityTimer: any;

  constructor() {
    // Load session on init only if in browser
    if (isPlatformBrowser(this.platformId)) {
        this.checkSessionValidity();
        this.setupActivityListeners();
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
              localStorage.removeItem(this.lastActivityKey);
            }
          } catch (e) {
            console.error("Failed to save session:", e);
          }
      }
    });
  }

  private checkSessionValidity() {
    const savedSession = localStorage.getItem(this.sessionKey);
    const lastActivity = localStorage.getItem(this.lastActivityKey);
    const now = Date.now();

    if (savedSession) {
        if (lastActivity && (now - parseInt(lastActivity, 10) > this.TIMEOUT_MS)) {
            // Expired
            console.warn("Session expired due to inactivity");
            this.logout();
        } else {
            // Valid
            try {
                this.currentUser.set(JSON.parse(savedSession));
                this.updateActivityTimestamp();
            } catch (e) {
                console.error("Failed to parse session", e);
                this.logout();
            }
        }
    }
  }

  private setupActivityListeners() {
      // Listen to events to reset timer
      const events = ['mousemove', 'click', 'keydown', 'scroll', 'touchstart'];

      // Run outside Angular to avoid excessive change detection cycles
      this.ngZone.runOutsideAngular(() => {
          events.forEach(event => {
              window.addEventListener(event, () => this.updateActivityTimestamp());
          });
      });
  }

  private updateActivityTimestamp() {
      if (isPlatformBrowser(this.platformId) && this.currentUser()) {
          // Throttle slightly to avoid spamming localStorage
          const now = Date.now();
          // Only update if 1 minute has passed or it's the first time
          // Or just update. LocalStorage sync is fast enough for low freq.
          // Let's just update every time but throttle in memory?
          // Simplest: direct update.
          localStorage.setItem(this.lastActivityKey, now.toString());
      }
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

    this.saveUsers(users);
    this.currentUser.set(user);
    this.updateActivityTimestamp();
    return true;
  }

  login(alias: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.alias === alias && u.password === password);
    if (user) {
      this.currentUser.set(user);
      this.updateActivityTimestamp();
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.lastActivityKey);
    }
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
      this.updateActivityTimestamp();
    }
  }
}
