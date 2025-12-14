import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Message, PrivateMessageDTO } from '../models/private-message';
import { GroupMessageDTO } from '../models/group-message';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getOnlineUsers(): Observable<string[]> {
    return this.http.get<string[]>('/online-users', { headers: this.auth.getAuthHeaders() });
  }

  getActiveGroups(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>('/active-groups', { headers: this.auth.getAuthHeaders() });
  }

  sendPrivate(dto: PrivateMessageDTO) {
    return this.http.post('/app/private.send', dto, { headers: this.auth.getAuthHeaders() });
  }

  sendGroup(dto: GroupMessageDTO) {
    return this.http.post('/app/group.send', dto, { headers: this.auth.getAuthHeaders() });
  }
}
