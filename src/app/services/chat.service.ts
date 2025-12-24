import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client: Client;
  private connected = signal(false);  // ???
  private privateMessages$ = new BehaviorSubject<any[]>([]);
  private groupMessages$ = new BehaviorSubject<Message & { groupId?: string }>({} as Message & { groupId?: string });

  private baseUrl = 'localhost:8080';

  constructor(private http: HttpClient, private auth: AuthService) {
    this.client = new Client({
      brokerURL: `http://${this.baseUrl}/ws/chat`,
      connectHeaders: {
        Authorization: `Bearer ${this.auth.getToken()}`
      },
      onConnect: () => {
        console.log("Connected to chat server");
        this.connected.set(true);
        this.subscribeToPrivate();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      debug: () => { console.log("Disconnected, retrying in 5s.") },
      reconnectDelay: 5000
    });

    this.client.activate(); // handles handshake
  }

  subscribeToPrivate() {
    this.client.subscribe('/user/queue/private', (msg: Message) => {
      if (msg.body) {
        const nwMessage = JSON.parse(msg.body);
        const currentMessages = this.privateMessages$.getValue();
        this.privateMessages$.next([...currentMessages, nwMessage]);
      }
    });
  }

  sendPrivate(to: string, content: string) {
    this.client.publish({
      destination: '/app/private.send', // Matches MessageMapping 
      body: JSON.stringify({ to, content })
    });
  }

  subscribeToGroup(groupId: string) {
    this.client.subscribe(`/topic/group.${groupId}`, (msg: Message) => {
      if (msg.body) {
        const newMessage = JSON.parse(msg.body);
        const currentMessages = this.privateMessages$.getValue();
        this.privateMessages$.next([...currentMessages, newMessage]);
      }
    });
  }

  sendGroup(groupId: string, content: string) {
    this.subscribeToGroup(groupId);
    this.client.publish({
      destination: '/app/group.send', // Matches MessageMapping 
      body: JSON.stringify({ groupId, content })
    });
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected.set(false);
  }

  getPrivate() {
    return this.privateMessages$.asObservable();
  }

  getGroup() {
    return this.groupMessages$.asObservable();
  }

  getOnlineUsers(): Observable<string[]> {
    return this.http.get<string[]>(`http://${this.baseUrl}/online-users`, { headers: this.auth.getAuthHeaders() });
  }

  getActiveGroups(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`http://${this.baseUrl}/active-groups`, { headers: this.auth.getAuthHeaders() });
  }
}