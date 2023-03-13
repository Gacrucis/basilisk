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

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class chatPage implements OnInit {
  public id!: string;
  public messages: Message[] = [];
  public lst!: string[];
  private isLoading = false;
  private hasManuallyScrolled = false;
  private maxTokenUsage = 3096;

  @ViewChild('textbox', { static: false }) textbox!: ElementRef;
  @ViewChild('conversation', { static: false }) conversation!: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private AiService: AiService, private router: Router) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.messages = localStorage.getItem(this.id) ? JSON.parse(localStorage.getItem(this.id) as string) : [];
  }

  ngAfterViewInit() {

    let chatSessionsRaw = localStorage.getItem('chatSessions');
    let chatSessions : ChatSession[] = chatSessionsRaw ? JSON.parse(chatSessionsRaw) : [];
    
    if (chatSessions && !chatSessions.find(x => x.id === this.id)) {
      this.router.navigateByUrl('/chat/default');
    }

    var textBoxNative = this.textbox.nativeElement;
    let height = '100px';

    if (textBoxNative != null) {
      textBoxNative.style.height = height;
      let max = 300;

      setInterval(() => {
        textBoxNative.style.height = height;
        textBoxNative.style.height = (textBoxNative.scrollHeight > max ? max : textBoxNative.scrollHeight) + 'px';

        if (textBoxNative.scrollHeight > max) {
          textBoxNative.style.overflowY = 'scroll';
        } else {
          textBoxNative.style.overflowY = 'hidden';
        }
      }, 100);

    }

    this.conversation.nativeElement.addEventListener('wheel', () => {
      this.hasManuallyScrolled = true;
    }, { passive: true });

    this.conversation.nativeElement.addEventListener('touchmove', () => {
      this.hasManuallyScrolled = true;
    }, { passive: true });

    setInterval(() => {
      if (this.isLoading && !this.hasManuallyScrolled){
        this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
      }
    }, 100);

    setTimeout(() => {
      textBoxNative.focus();
      this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
    }, 100);

  }
  
  handleExample(){
    alert('hola');
  }

  handleDownAction() {
    this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
    this.hasManuallyScrolled = false;
  }

  handleStopAction() {
    this.isLoading = false;
  }

  handleClearAction() {
    this.handleStopAction();
    localStorage.clear();
    this.messages = [];
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
    this.messages.push(AImessage);
    this.isLoading = true;
    this.hasManuallyScrolled = false;

    try {

      await this.AiService.callAPI(this.pruneMessages(this.messages.slice(0, -1)),
      (pe: ProgressEvent) => {
        if (!this.isLoading){
          return
        }
        
        const target = pe.target as any;
        
        const res = target['response'];
        const newReturnedData = res.split('data:');
        const newIndex = newReturnedData.length - 1;

        while (index <= newIndex) {
          const rawData = newReturnedData[index++].trim();
          console.log(rawData);

          if (!rawData) {
            this.isLoading = true;
            return;
          }
          
          if (rawData === '[DONE]'){
            console.log('Finished stream');
            this.isLoading = false;
            return;
          }

          const data = JSON.parse(rawData) as ChatCompletionChunk;

          if (data.hasOwnProperty('error')) {
            this.messages.push({ role: 'assistant', content: '```API error\n' + JSON.stringify(data.error, null, 2) + '```' });
            return;
          }
          
          const chunkContent = data.choices[0]?.delta.content;
          
          if (chunkContent) {
            AImessage.content += chunkContent;
          }
        }

      }
      );
    } catch (error) {
      this.messages.push({ role: 'assistant', content: '```error\n' + error + '```' });
      return;
    }
      
    localStorage.setItem(this.id, JSON.stringify(this.messages));

  }

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

    return processedText;
  }

  canDeactivate(nextRoute : RouterStateSnapshot): boolean {
    let routeId : string = nextRoute.url.split('/').slice(-1)[0];
    let chatSessionsRaw = localStorage.getItem('chatSessions');
    let chatSessions : ChatSession[] = chatSessionsRaw ? JSON.parse(chatSessionsRaw) : [];

    console.log(localStorage.getItem('chatSessions'));
    console.log(chatSessions);
    console.log(routeId);

    if (chatSessions && !chatSessions.find(x => x.id === routeId)) {
      // console.log(localStorage.getItem(routeId));
      console.log('NO HAY');
      return false;
    }

    // console.log(localStorage.getItem(routeId));
    return false;
  }

}
