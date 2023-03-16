import { AiService, Message } from './../services/ai/ai.service';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { ChatSession } from '../app.component';
import { ToastController } from '@ionic/angular';

interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  error?: string | undefined;
  choices: {
    delta: {
      content: string;
    },
    index: number,
    finish_reason?: string | null,
  }[];
}

interface LocalStorageSession {
  firstMessageIndex: number;
  messages: Message[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class chatPage implements OnInit {
  public id!: string;
  public firstMessageIndex = 0;
  public messages: Message[] = [];
  public lst!: string[];
  private isLoading!: boolean;
  private hasManuallyScrolled = false;
  private maxTokenUsage = 3096;
  private lastMessageId! : string;
  private whiteHighlight = '#ffffff40';

  @ViewChild('textbox', { static: false }) textbox!: ElementRef;
  @ViewChild('conversation', { static: false }) conversation!: ElementRef<HTMLElement>;
  @ViewChild('downButton', { static: false, read: ElementRef  }) downButton!: ElementRef;
  @ViewChild('stopButton', { static: false, read: ElementRef  }) stopButton!: ElementRef;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private AiService: AiService, 
    private router: Router, 
    private toastController: ToastController,
    ) { }

  ngOnInit() {

    this.id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    const data = localStorage.getItem(this.id);

    
    if (!data || data == '[]'){
      this.saveSessionData();
      return
    }
    
    let parsedData = JSON.parse(data) as LocalStorageSession;

    this.messages = parsedData.messages;
    this.firstMessageIndex = parsedData.firstMessageIndex;
  }

  ngAfterViewInit() {

    let chatSessionsRaw = localStorage.getItem('chatSessions');
    let chatSessions: ChatSession[] = chatSessionsRaw ? JSON.parse(chatSessionsRaw) : [];

    if (chatSessions && !chatSessions.find(x => x.id === this.id)) {
      this.router.navigateByUrl('/chat/default');
    }

    var textBoxNative = this.textbox.nativeElement;
    let height = '100px';

    if (textBoxNative != null) {
      textBoxNative.style.height = height;
      let max = 300;

      textBoxNative.addEventListener('keydown', (event: KeyboardEvent) => {
        const inputValue = textBoxNative.value.trim();
        const key = event.key;

        // Check for empty space or newline character
        if ((key === ' ' || key === 'Enter') && !inputValue) {
          event.preventDefault();
        }
      });

      textBoxNative.addEventListener('input', () => {
        const textValue : string = textBoxNative.value;

        if (textValue.charAt(0) == '\n'){
          textBoxNative.value = textValue.substring(1);
        }
      });

      textBoxNative.addEventListener('input', () => {
        const textValue : string = textBoxNative.value;

        if (textValue.charAt(0) == '\n'){
          textBoxNative.value = textValue.substring(1);
        }
      });

      textBoxNative.addEventListener('input', () => {
        textBoxNative.style.height = height;
        textBoxNative.style.height = (textBoxNative.scrollHeight > max ? max : textBoxNative.scrollHeight) + 'px';

        if (textBoxNative.scrollHeight > max) {
          textBoxNative.style.overflowY = 'scroll';
        } else {
          textBoxNative.style.overflowY = 'hidden';
        }

        let downButtonNative = this.downButton.nativeElement;
        downButtonNative.style.bottom = (parseInt(textBoxNative.style.height) + 10) + 'px';

      });

    }

    this.conversation.nativeElement.addEventListener('wheel', () => {
      this.hasManuallyScrolled = true;
    }, { passive: true });

    this.conversation.nativeElement.addEventListener('touchmove', () => {
      this.hasManuallyScrolled = true;
    }, { passive: true });

    setInterval(() => {
      if (this.isLoading && !this.hasManuallyScrolled) {
        this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
      }
    }, 100);

    // Load messages
    this.loadMessages();
  }
  
  ionViewDidEnter(){
    setTimeout(() => {
      this.textbox.nativeElement.focus();
      this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
      // this.conversation.nativeElement.scrollTo({ top: this.conversation.nativeElement.scrollHeight, behavior: 'smooth'})
    }, 100);
    
    this.stopLoading()
  }

  setLoading(){
    this.isLoading = true
    this.stopButton.nativeElement.disabled = false;
  }

  stopLoading(){
    this.isLoading = false
    this.stopButton.nativeElement.disabled = true;
    // this.stopButton.nativeElement.style.color = '#ffffff40';
  }

  loadMessages() {
    const parentElement = this.conversation.nativeElement;

    for (let i = 0; i < this.messages.length; i++) {

      const messageBubble = this.processMessageContent(this.messages[i]);

      if (i == this.firstMessageIndex - 1) {
        this.processFirstMessage(messageBubble);
      }

      parentElement.appendChild(messageBubble);
      
    }

  }

  processMessageContent(message: Message) {
      const messageBubble = document.createElement('div');
      messageBubble.classList.add('message-bubble');
      messageBubble.classList.add(message.role == 'user' ? 'user-bubble' : 'assistant-bubble');

      const text = message.content;
      const dividedText = text.split('```');

      for (let j = 0; j < dividedText.length; j++) {
        const textPart = dividedText[j];

        if (j % 2 == 1) {
          messageBubble.appendChild(this.processCodeBlock(textPart));
        } else {
          messageBubble.appendChild(this.processTextBlock(textPart));
        }
      }

      const codeBlock = document.createElement('div');
      codeBlock.classList.add('code');

      return messageBubble;
  }

  processCodeBlock(codeText: string){
    const codeBlock = document.createElement('div');
    codeBlock.classList.add('code');
    codeBlock.classList.add('code-text');
    // textBlock.classList.add('text');
    // codeBlock.innerText = codeText;

    const headerRegex = /^(\w*)\n(.+)/s;
    const blockHeader = document.createElement('div');
    const blockContent = document.createElement('div');
    const regex = codeText.match(headerRegex);

    blockHeader.classList.add('code-header');
    blockContent.classList.add('code-content');

    if (regex){
      blockHeader.innerText = regex[1]? regex[1] : 'code';
      blockContent.innerText = regex[2];
    } else {
      blockHeader.innerText = 'code';
      blockContent.innerText = codeText;
    }

    codeBlock.appendChild(blockHeader);
    codeBlock.appendChild(blockContent);

    return codeBlock;
  }

  processTextBlock(text: string){
    const textBlock = document.createElement('p');

    const textChunks = text.split('`');

    for (let i = 0; i < textChunks.length; i++){
      const textSpan = document.createElement('span');

      if (i % 2 == 1) {
        textSpan.classList.add('code-text');
      }
      
      textSpan.innerText = textChunks[i];
      textBlock.appendChild(textSpan);
    }

    return textBlock;
  }

  processFirstMessage(messageBubble: HTMLElement){
    messageBubble.style.borderBottom = `1px solid ${this.whiteHighlight}`;
    // messageBubble.style.paddingBottom = '30px';
  }

  showFirstMessage() {
    const messageBubbles = document.querySelectorAll(".message-bubble");
    let lastBubble = messageBubbles[this.firstMessageIndex - 1] as HTMLElement;

    if (lastBubble.classList.contains('user-bubble')) {
      lastBubble = messageBubbles[this.firstMessageIndex - 2] as HTMLElement;
    }

    this.processFirstMessage(lastBubble);
  }

  getSessionData() {
    const chatSession : LocalStorageSession = {
      firstMessageIndex: this.firstMessageIndex,
      messages: this.messages
    } 

    return chatSession;
  }

  saveSessionData() {
    localStorage.setItem(this.id, JSON.stringify(this.getSessionData()));
  }

  extractContext() : Message[] {
    let messagesContext = this.messages.slice(this.firstMessageIndex)
    return messagesContext;
  }

  handleDownAction() {
    this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
    this.hasManuallyScrolled = false;
  }

  handleStopAction() {
    this.stopLoading();
  }

  handleClearAction() {
    this.handleStopAction();
    // this.firstMessageIndex = this.messages? this.messages.length - 1 : 0;
    this.presentToast('Context cleared', 1000, 'top', 'dark-toast');
    
    if (this.firstMessageIndex == this.messages.length){
      return;
    }

    this.firstMessageIndex = this.messages.length;
    this.saveSessionData();
    this.showFirstMessage();
    this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
  }

  async handleSentAction() {
    if (this.isLoading) {
      return;
    }

    if (!this.textbox.nativeElement.value.trim()) {
      this.textbox.nativeElement.value = '';
      return;
    }

    const userMessage = { role: 'user', content: this.textbox.nativeElement.value.trim() };
    const AIMessage = { role: 'assistant', content: '' };

    const userMessageBubble = this.processMessageContent(userMessage);
    const AIMessageBubble = this.processMessageContent(AIMessage);

    this.conversation.nativeElement.appendChild(userMessageBubble);
    this.conversation.nativeElement.appendChild(AIMessageBubble);

    this.textbox.nativeElement.value = '';
    
    this.messages.push(userMessage);
    this.saveSessionData();

    this.messages.push(AIMessage);
    
    this.hasManuallyScrolled = false;
    this.setLoading()
    
    let index = 0;
    let currentId : string = '';
    
    try {

      await this.AiService.callAPI(
        this.pruneMessages([this.AiService.getSystemMessage(), ...this.extractContext().slice(0, -1)]),
        (pe: ProgressEvent) => {
          if (!this.isLoading) {
            return
          }

          const target = pe.target as any;

          const res = target['response'];
          const newReturnedData = res.split('data:');
          const newIndex = newReturnedData.length - 1;

          while (index <= newIndex) {
            const rawData = newReturnedData[index++].trim();

            // try {
            //   console.log(JSON.parse(rawData));
            // } catch (e) {
            //   console.log(rawData);
            // }

            if (rawData === '[DONE]') {
              console.log('Finished stream');
              return;
            }

            const data = JSON.parse(rawData) as ChatCompletionChunk;
            
            // Verifies if API has thrown an error
            if (data.hasOwnProperty('error')) {
              this.handleAPIError(data);
              return;
            }
            
            // If this is the first stream of data, set the current id
            if (!currentId) {
              this.lastMessageId = data.id;
              currentId = data.id;
            }

            // console.log('data id: ' + data.id)
            // console.log('lastMessage id: ' + this.lastMessageId)

            // If the current id is different from the one in the stream, ignore the data
            if (data.id != currentId || data.id != this.lastMessageId) {
              console.log('Ignored old data')
              return
            }

            // If the stream has finished, stop the completion
            if (data.choices[0]?.finish_reason){
              this.stopLoading();
              console.log('Stopped completion');
              return;
            }

            // If it has not stopped, add text to the messagle bubble
            const chunkContent = data.choices[0]?.delta.content;
            // console.log(chunkContent)

            if (chunkContent && data.id == this.lastMessageId) {
              AIMessage.content += chunkContent;
              AIMessage.content = AIMessage.content.charAt(0).toUpperCase() + AIMessage.content.slice(1);

              AIMessageBubble.innerHTML = this.processMessageContent(AIMessage).innerHTML;
            }
          }

        }
      );
    } catch (error) {
      this.messages.push({ role: 'assistant', content: '```error\n' + error + '```' });
      return;
    }

    this.saveSessionData();
    await this.addTitle()

  }

  // TODO: There is a more efficient way to do this, but i was too lazy
  pruneMessages(messages: Message[]): Message[] {
    let totalWords = 0;

    for (const message of messages) {
      const words = message.content.trim().split(/\s+/);
      totalWords += words.length;
    }

    let allotedTokens = this.maxTokenUsage - this.AiService.getMaximumTokens();

    let prevTokens = Math.round(totalWords * 1.5);

    if (prevTokens > allotedTokens) {
      console.log('Too many tokens!');
      return this.pruneMessages(messages.slice(1));

    }

    return messages;
  }

  // Add title to chat on first message
  async addTitle() {
    // Search this chatSession in localStorage
    var chatSessionsRaw = localStorage.getItem('chatSessions');
    var chatSessions: ChatSession[] = chatSessionsRaw ? JSON.parse(chatSessionsRaw) : [];
    var chatIndex = chatSessions.findIndex(x => x.id == this.id);

    if (chatIndex < 0 || chatSessions[chatIndex].title){
      // console.log('Skipped chat title update');
      return;
    }

    let chatButton = document.getElementById(`${this.id}`);

    if (!chatButton){
      return;
    }

    let chatButtonTitle = chatButton.querySelector('ion-label') as HTMLElement;
    console.log(chatButtonTitle)
    let firstPrompt = this.messages[0].content;

    const buttonParent = chatButton.parentElement;

    if (!buttonParent) {
      return;
    }

    const originalColor = buttonParent.style.backgroundColor;
    buttonParent.style.backgroundColor = this.whiteHighlight;
    buttonParent.style.transition = 'background-color 0.5s ease-out';
    setTimeout(() => {
      buttonParent.style.backgroundColor = originalColor;
    }, 1000);

    // Limit firstPrompt to 10 words
    // firstPrompt = firstPrompt.split(' ').slice(0, 10).join(' ');
    // console.log(firstPrompt)
    chatButtonTitle.textContent = '';
    let chunkIndex = 0;
    var text;
    await this.AiService.callAPI(
      [{'role' : 'user', 'content' : `you are a keyword generator, write one summary keyword with no dots or puctuation for: " ${firstPrompt}", use no more than 15 letters`}],
      (pe: ProgressEvent) => {

        const target = pe.target as any;

          const res = target['response'];
          const newReturnedData = res.split('data:');
          const newIndex = newReturnedData.length - 1;

          while (chunkIndex <= newIndex) {
            const rawData = newReturnedData[chunkIndex++].trim();

            if (!rawData){
              // console.log('Started chat title stream');
              return;
            }

            if (rawData === '[DONE]') {
              // console.log('Finished chat title stream');
              return;
            }

            const data = JSON.parse(rawData) as ChatCompletionChunk;
            
            // Verifies if API has thrown an error
            if (data.hasOwnProperty('error')) {
              this.handleAPIError(data);
              return;
            }
            
            const chunkContent = data.choices[0]?.delta.content;

            if (chunkContent) {
              text = chatButtonTitle.textContent + chunkContent;
              
              text = text.trim();
              text = text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
              text = text.replace(/\"/, '');
              text = text.replace(/\./, '');
              
              chatButtonTitle.textContent = text;
            }
          }
      }
    )
    
    // Writing this again so i dont get blinsided by the async
    console.log(`Adding title ${text} to chat ${this.id}`);
    
    var chatSessionsRaw = localStorage.getItem('chatSessions');
    var chatSessions: ChatSession[] = chatSessionsRaw ? JSON.parse(chatSessionsRaw) : [];
    var chatIndex = chatSessions.findIndex(x => x.id == this.id);

    chatSessions[chatIndex].title = text;
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));

    console.log(`Added title ${text} to chat ${this.id}`);
  }

  handleAPIError(data: ChatCompletionChunk) {
    console.log(data.error);
    this.messages.push({ role: 'assistant', content: '```API error\n' + JSON.stringify(data.error, null, 2) + '```' });
  }

  async presentToast(message: string, duration: number, position: 'top' | 'middle' | 'bottom', cssClass?: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration? duration : 1000,
      position: position,
      cssClass: cssClass,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ],
    });

    await toast.present();
  }

  // Guard para evitar navegaciones a chats que no han sido creados
  canDeactivate(nextRoute: RouterStateSnapshot): boolean {
    let routeId: string = nextRoute.url.split('/').slice(-1)[0];
    let chatSessionsRaw = localStorage.getItem('chatSessions');
    let chatSessions: ChatSession[] = chatSessionsRaw ? JSON.parse(chatSessionsRaw) : [];

    if (chatSessions && !chatSessions.find(x => x.id === routeId)) {
      console.log('NO HAY');
      return false;
    }

    return true;
  }

}
