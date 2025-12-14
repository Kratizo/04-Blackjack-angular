import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PvpService {
  private socket: Socket | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  connect(playerInfo: any): void {
    if (isPlatformBrowser(this.platformId)) {
      // Connect to server on the same hostname but port 3000
      const url = `http://${window.location.hostname}:3000`;

      this.socket = io(url, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to PvP server');
        this.socket?.emit('join_game', playerInfo);
      });

      this.socket.on('connect_error', (err) => {
        console.error('Connection Error:', err);
      });
    }
  }

  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      if (this.socket) {
        this.socket.on(eventName, (data: any) => {
          subscriber.next(data);
        });
      }
    });
  }

  emit(eventName: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}
