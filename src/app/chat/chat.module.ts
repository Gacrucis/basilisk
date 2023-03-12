import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { chatPageRoutingModule } from './chat-routing.module';

import { chatPage } from './chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    chatPageRoutingModule
  ],
  declarations: [chatPage]
})
export class chatPageModule {}
