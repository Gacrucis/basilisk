import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { chatPage } from './chat.page';

describe('chatPage', () => {
  let component: chatPage;
  let fixture: ComponentFixture<chatPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [chatPage],
      imports: [IonicModule.forRoot(), RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(chatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
