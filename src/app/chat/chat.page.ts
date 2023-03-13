import { AiService, Message } from './../services/ai/ai.service';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content: string;
    },
    index: number,
    finish_reason?: string | null
  }[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class chatPage implements OnInit {
  public chat!: string;
  public messages: Message[] = localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages') as string) : [];
  public lst!: string[];
  private isLoading = false;
  private hasManuallyScrolled = false;

  @ViewChild('textbox', { static: false }) textbox!: ElementRef;
  @ViewChild('conversation', { static: false }) conversation!: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private AiService: AiService) { }

  ngOnInit() {
    this.chat = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  ngAfterViewInit() {
    var element = this.textbox.nativeElement;
    let height = '100px';

    if (element != null) {
      element.style.height = height;
      let max = 300;

      setInterval(() => {
        element.style.height = height;
        element.style.height = (element.scrollHeight > max ? max : element.scrollHeight) + 'px';

        if (element.scrollHeight > max) {
          element.style.overflowY = 'scroll';
        } else {
          element.style.overflowY = 'hidden';
        }
      }, 100);

    }

    this.conversation.nativeElement.addEventListener('scroll', () => {
      this.hasManuallyScrolled = true;
    });

    setInterval(() => {
      if (this.isLoading && !this.hasManuallyScrolled){
        this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
      }
    }, 100);

    setTimeout(() => {
      element.focus();
      this.conversation.nativeElement.scrollTop = this.conversation.nativeElement.scrollHeight;
    }, 100);

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
      this.textbox.nativeElement.value = 'as';
      return;
    }

    const userMessage = { role: 'user', content: this.textbox.nativeElement.value };
    const AImessage = { role: 'assistant', content: '' };
    let index = 0;
    this.textbox.nativeElement.value = '';
    
    this.messages.push(userMessage);
    this.messages.push(AImessage);
    this.isLoading = true;

    await this.AiService.callAPI(this.messages.slice(0, -1),
      (pe: ProgressEvent) => {
        if (!this.isLoading){
          return
        }

        this.hasManuallyScrolled = true;
        const target = pe.target as any;

        const res = target['response'];
        const newReturnedData = res.split('data:');
        const newIndex = newReturnedData.length - 1;

        while (index <= newIndex) {
          const rawData = newReturnedData[index++].trim();
          console.log(rawData);

          if (!rawData || rawData === '[DONE]') {
            console.log('Finished stream');
            this.isLoading = false;
            return;
          }

          const { choices } = JSON.parse(rawData) as ChatCompletionChunk;
          const chunkContent = choices[0]?.delta.content;

          if (chunkContent) {
            AImessage.content += chunkContent;
          }
        }

      }
    );

    localStorage.setItem('messages', JSON.stringify(this.messages));

  }

  processText(text: string) {
    const codeRegex = /```(.*)\n([\s\S]+?)```/g;
    const incompleteCodeRegex = /```(.+)\n([\S\s]+)/g;
    const newlineRegex  = /\n/g;
    
    const codeReplacement = '<div class="code"> <div class="code-header">$1</div> <div class="code-content">$2</div> </div>';

    var processedText = text;


    processedText = processedText.replace(codeRegex, codeReplacement);
    processedText = processedText.replace(incompleteCodeRegex, codeReplacement);
    processedText = processedText.replace('<div class="code-header"></div>', '<div class="code-header">code</div>');
    // processedText = processedText.replace(newlineRegex, '<br />');

    return processedText;
  }

}
