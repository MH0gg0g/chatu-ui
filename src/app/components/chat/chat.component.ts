import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';

@Component({
    standalone: true,
    selector: 'app-chat',
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
})

export class ChatComponent implements OnInit, OnDestroy {
    me: string = '';
    recipient: string = '';
    newMessage: string = '';

    users = signal<string[]>([]);
    groups = signal<Record<string, number>>({});
    groupKeys = signal<string[]>([]);
    msgCache;

    constructor(private auth: AuthService, private chat: ChatService, private router: Router) {
        this.msgCache = this.chat.messages;
    }

    ngOnInit(): void {
        this.auth.current$.subscribe(u => {
            this.me = u || '';
        });

        this.chat.connect();
        this.loadLists();
    }

    onPrivateSend() {
        if (this.recipient && this.newMessage) {
            this.chat.sendPrivate(this.recipient, this.newMessage);
            this.newMessage = '';
        }
    }

    onGroupSend() {
        if (this.recipient && this.newMessage) {
            const isSub = this.groupKeys().includes(this.recipient);
            this.chat.sendGroup(this.recipient, this.newMessage, isSub);
            this.newMessage = '';
            console.log('alerdy subscribed:', this.recipient);
        }

    }

    ngOnDestroy(): void {
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
