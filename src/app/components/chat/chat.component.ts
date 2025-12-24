import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    selector: 'app-chat',
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
})

export class ChatComponent implements OnInit, OnDestroy {
    me = '';

    recipient = '';
    privateMessage = '';

    groupId = '';
    groupMessage = '';

    users = signal<string[]>([]);
    groups = signal<Record<string, number>>({});
    groupKeys = signal<string[]>([]);

    onlineUsers;
    messages$: Observable<any[]>;

    private subscriptions: Subscription = new Subscription();

    constructor(private auth: AuthService, private chat: ChatService, private router: Router) {
        this.messages$ = this.chat.getPrivate();
        this.onlineUsers = toSignal(this.chat.getOnlineUsers(), { initialValue: [] });
    }
    
    ngOnInit(): void {
        this.auth.current$.subscribe(u => {
            this.me = u || '';
        });
        
        this.loadLists();
    }

    sendPrivate() {
        this.chat.sendPrivate(this.recipient, this.privateMessage);
        this.privateMessage = '';
    }

    sendGroup() {
        this.chat.sendGroup(this.groupId, this.groupMessage);
        this.groupMessage = '';
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.chat.disconnect();
        this.auth.logout();
    }

    loadLists() {
        this.chat.getOnlineUsers().subscribe(u => { console.log(u); this.users.set(u || []); });
        this.chat.getActiveGroups().subscribe(g => { this.groups.set(g || {}); this.groupKeys.set(Object.keys(this.groups())); });
    }

    refresh() { this.loadLists(); }

    logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
