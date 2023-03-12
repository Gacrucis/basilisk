import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'HTML Guide for starters', url: '/chat/HTML Guide for starters', icon: 'chatbox' },
    // { title: 'Outbox', url: '/chat/Outbox', icon: 'paper-plane' },
    // { title: 'Favorites', url: '/chat/Favorites', icon: 'heart' },
    // { title: 'Archived', url: '/chat/Archived', icon: 'archive' },
    // { title: 'Trash', url: '/chat/Trash', icon: 'trash' },
    // { title: 'Spam', url: '/chat/Spam', icon: 'warning' },
  ];
  public labels = ['Gacrucis'];
  constructor() {}
}
