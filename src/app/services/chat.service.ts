import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { ChatMessage } from '../models/chat-message';
import { AuthService } from './auth.service';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client!: Client;
  private connected = signal(false);
  public messages = signal<ChatMessage[]>([]);

  private baseUrl = 'localhost:8080';

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  connect() {
    this.client = new Client({
      brokerURL: `http://${this.baseUrl}/ws/chat`,
      // stomp vs sockjs fallback
      // webSocketFactory: () => new SockJS('http://${this.baseUrl}/ws/chat'),
      connectHeaders: {
        Authorization: `Bearer ${this.auth.getToken()}`
      },
      onConnect: () => {
        console.log("Connected to chat server");
        this.connected.set(true);
        this.subscribeToPrivate();

      },
      reconnectDelay: 5000
    });

    this.client.activate(); // handles handshake
  }

  appendMessage(from: string, content: string, timeStamp: string, type: string) {
    const newMessage: ChatMessage = { from, content, timeStamp, type };
    this.messages.update(msgs => [...msgs, newMessage]);
  }

  subscribeToPrivate() {
    this.client.subscribe('/user/queue/private', (msg: Message) => {
      if (msg.body) {
        const body = JSON.parse(msg.body);
        this.appendMessage(body.from, body.content, body.timeStamp, 'private');
      }
    });
  }

  subscribeToGroup(groupId: string) {
    this.client.subscribe(`/topic/group.${groupId}`, (msg: Message) => {
      if (msg.body) {
        const body = JSON.parse(msg.body);
        this.appendMessage(body.from, body.content, body.timeStamp, 'Group');
      }
    });
  }

  sendPrivate(id: string, content: string) {
    this.client.publish({
      destination: '/app/private.send', // Matches MessageMapping | private / group
      body: JSON.stringify({ id, content })
    });
  }

  sendGroup(id: string, content: string, isSub: boolean) {
    // if (!isSub) {
      this.subscribeToGroup(id);
    // }
    this.client.publish({
      destination: '/app/group.send', // Matches MessageMapping | private / group
      body: JSON.stringify({ id, content })
    });
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected.set(false);
  }

  getOnlineUsers(): Observable<string[]> {
    return this.http.get<string[]>(`http://${this.baseUrl}/online-users`, { headers: this.auth.getAuthHeaders() });
  }

  getActiveGroups(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`http://${this.baseUrl}/active-groups`, { headers: this.auth.getAuthHeaders() });
  }
}