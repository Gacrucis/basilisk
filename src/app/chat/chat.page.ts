import { AiService, Message } from './../services/ai/ai.service';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { ChatSession } from '../app.component';

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
  private isLoading = false;
  private hasManuallyScrolled = false;
  private maxTokenUsage = 3096;
  private lastMessageId! : string;
  private whiteHighlight = '#ffffff40';

  @ViewChild('textbox', { static: false }) textbox!: ElementRef;
  @ViewChild('conversation', { static: false }) conversation!: ElementRef;
  @ViewChild('downButton', { static: false, read: ElementRef  }) downButton!: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private AiService: AiService, private router: Router) { }

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

    setTimeout(() => {
      textBoxNative.focus();
      this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;

      if (this.firstMessageIndex != 0){
        this.showFirstMessage();
      }
    }, 100);
    
  }

  showFirstMessage() {
    const messageBubbles = document.querySelectorAll(".message-bubble");
    const lastBubble = messageBubbles[this.firstMessageIndex - 1] as HTMLElement;
    lastBubble.style.borderBottom = `1px solid ${this.whiteHighlight}`;
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

  handleExample() {
    alert('hola');
  }

  handleDownAction() {
    this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
    this.hasManuallyScrolled = false;
  }

  handleStopAction() {
    this.isLoading = false;
    this.addCopyButton()
  }

  handleClearAction() {
    this.handleStopAction();
    // this.firstMessageIndex = this.messages? this.messages.length - 1 : 0;
    
    if (this.firstMessageIndex == this.messages.length){
      return;
    }

    this.firstMessageIndex = this.messages.length;
    this.saveSessionData();
    this.showFirstMessage();
  }

  async handleSentAction() {
    if (this.isLoading) {
      return;
    }

    if (!this.textbox.nativeElement.value.trim()) {
      this.textbox.nativeElement.value = '';
      return;
    }

    const userMessage = { role: 'user', content: this.textbox.nativeElement.value };
    const AImessage = { role: 'assistant', content: '' };
    let index = 0;
    this.textbox.nativeElement.value = '';

    this.messages.push(userMessage);
    this.saveSessionData();

    this.messages.push(AImessage);

    this.isLoading = true;
    this.hasManuallyScrolled = false;
    let currentId : string = '';

    try {

      await this.AiService.callAPI(this.pruneMessages([this.AiService.getSystemMessage(), ...this.extractContext().slice(0, -1)]),
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

            if (!rawData) {
              this.isLoading = true;
              return;
            }

            if (rawData === '[DONE]') {
              console.log('Finished stream');
              // this.isLoading = false;
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
              this.isLoading = false;
              console.log('Stopped completion');
              return;
            }

            // If it has not stopped, add text to the messagle bubble
            const chunkContent = data.choices[0]?.delta.content;

            if (chunkContent && data.id == this.lastMessageId) {
              AImessage.content += chunkContent;
              AImessage.content = AImessage.content.charAt(0).toUpperCase() + AImessage.content.slice(1);
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

  processText(text: string) {
    var processedText = text;

    // Prevenir que se renderize HTML
    processedText = processedText.replace(/</g, '<span><</span>');

    // Cuadros especiales para codigo
    const incompleteCodeRegex = /```(.*)\n*([\S\s]+)/g;
    const codeRegex = /```(.*)\n*([\s\S]+?)```/g;
    const codeReplacement = '<div class="code"> <div class="code-header">$1</div> <div class="code-content">$2</div></div>';

    processedText = processedText.replace(codeRegex, codeReplacement);
    processedText = processedText.replace(incompleteCodeRegex, codeReplacement);
    processedText = processedText.replace('<div class="code-header"></div>', '<div class="code-header">code</div>');

    // this.addCopyButton()
    return processedText;
  }

  addCopyButton() {
    // const elements = document.querySelectorAll('.code-header');
    const elements = document.querySelectorAll('.user-bubble');

    elements.forEach((element) => {
      if (!element.hasAttribute('data-button-added')) {
        let button = document.createElement('ion-button');
        button.textContent = 'Click me';

        // Add event listener to button here...
        button.addEventListener('click', () => {
          alert('Button clicked!');
        });
        // element.append(button);
        // element.insertAdjacentHTML('afterend', '<ion-button>Click me</ion-button>');
        element.setAttribute('data-button-added', 'true');
      }
    });
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
            // console.log(chunkContent)

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
