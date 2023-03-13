import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface ChatSession {
  id: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public chatSessions : ChatSession[] = localStorage.getItem('chatSessions') ? JSON.parse(localStorage.getItem('chatSessions') as any) : [];
  public labels = ['Gacrucis'];
  private currentChatId : string = 'default';

  constructor(private router: Router) {}

  ngOnInit() {
    if (!this.chatSessions.find(cs => cs.id == 'default')){
      this.handleNewChatAction('default');
    }
  }

  getDefaultChatSession() {
    let defaultSession = this.chatSessions.find(chat => chat.id === 'default');
    if (!defaultSession) {
      defaultSession = { id: 'default', url: '/chat/default', icon: 'chatbox' };
    }
    return defaultSession;
  }

  getNonDefaultChatSessions() {
    return this.chatSessions.filter(chat => chat.id !== 'default');
  }

  generateRandomId() {
    return Math.floor(Math.random() * 10000).toString();
  }

  handleDeleteChatAction(chatId: string) {
    this.chatSessions = this.chatSessions.filter(chat => chat.url !== `/chat/${chatId}`);
    localStorage.setItem('chatSessions', JSON.stringify(this.chatSessions));

    if (this.currentChatId === chatId) {
      this.router.navigateByUrl(`/chat/default`);
    }
  }

  handleNewChatAction(chatId: string) {
    this.chatSessions.push({ id: chatId, url: `/chat/${chatId}`, icon: 'chatbox' });
    localStorage.setItem('chatSessions', JSON.stringify(this.chatSessions));
    this.currentChatId = chatId.toString();
    this.router.navigateByUrl(`/chat/${chatId}`);
  }
}
