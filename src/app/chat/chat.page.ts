import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class chatPage implements OnInit {
  public chat!: string;
  public lst!: string[];
  @ViewChild('textbox', {static: false}) textbox!: ElementRef;

  constructor(private activatedRoute: ActivatedRoute) { }

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
    this.lst = [
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
    ]
  }

}
