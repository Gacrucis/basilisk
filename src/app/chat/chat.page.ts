import { AiService } from './../services/ai/ai.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
})
export class chatPage implements OnInit {
  public chat!: string;
  public lst!: string[];
  @ViewChild('textbox', {static: false}) textbox!: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private AiService: AiService) { }

  ngAfterViewInit() {
    var element = this.textbox.nativeElement;
    let height = '100px';

    if (element != null) {
      element.style.height = height;
      let max = 300;

      setInterval(() => {
        element.focus();
      }, 100);

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

  }

  ngOnInit() {
    this.chat = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.lst = new Array(20).fill('a');
  }

  async handleSendButton() {
    const result = await this.AiService.callAPI({}, 
      (pe: ProgressEvent) => {
        const target = pe.target as any;
        const res = target['response'];
        const newReturnedData = res.split('data:');
        let lastPart = newReturnedData[newReturnedData.length - 1];
        lastPart = lastPart.trim()

        if (lastPart == '[DONE]') {
          console.log('Finished stream');
          return
        }

        console.log(JSON.parse(lastPart));
      }
    );
  }

}
