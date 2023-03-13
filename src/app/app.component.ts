import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

export interface ChatSession {
  id: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnChanges{
  public chatSessions : ChatSession[] = localStorage.getItem('chatSessions') ? JSON.parse(localStorage.getItem('chatSessions') as any) : [];
  public labels = ['Gacrucis'];
  private currentChatId : string = 'default';
  private lastDeletedChatId : string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    if (!this.chatSessions.find(cs => cs.id == 'default')){
      this.handleNewChatAction('default');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentChatId'] && changes['currentChatId'].currentValue){
      console.log('Current chat id changed');
    }
  }

  getCurrentChatId() {
    return this.currentChatId;
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

  handleSelectChatAction(chatId: string) {
    this.currentChatId = chatId;
    this.router.navigateByUrl(`/chat/${chatId}`);
    // this.currentChatId.

    const selected = document.getElementById(chatId);

    if (selected) {
      // selected.style.backgroundColor = 'lightgray';
    }
  }

  handleDeleteChatAction(chatId: string, event: MouseEvent) {
    // TODO: Ver si sirve
    event.stopPropagation();

    this.chatSessions = this.chatSessions.filter(chat => chat.url !== `/chat/${chatId}`);
    localStorage.setItem('chatSessions', JSON.stringify(this.chatSessions));
    localStorage.removeItem(chatId);

    this.lastDeletedChatId = chatId;

    if (this.currentChatId === chatId) {
      setTimeout(() => {
        console.log('timeout');
        this.handleSelectChatAction(this.getDefaultChatSession().id);
      }, 1010);
    }
  }

  handleNewChatAction(chatId: string) {
    this.chatSessions.push({ id: chatId, url: `/chat/${chatId}`, icon: 'chatbox' });
    localStorage.setItem('chatSessions', JSON.stringify(this.chatSessions));
    localStorage.setItem(chatId, JSON.stringify([]));

    this.handleSelectChatAction(chatId);
  }

}
