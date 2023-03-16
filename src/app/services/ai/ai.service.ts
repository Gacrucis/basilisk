import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Configuration, OpenAIApi } from "openai";

export interface Message {
  role: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private model: string = 'gpt-3.5-turbo';
  private temperature: number = 1;
  private maxTokens: number = 1024;
  private user: string = 'Gacrucis';
  private api = new OpenAIApi(new Configuration({apiKey: environment.OPENAI_SECRET}));
  private systemMessage!: Message;

  constructor() {
    // this.systemMessage = {
    //   role: 'user',
    //   content: 'Write any example in code format with backticks followed by a newline. For example: ```\nprint("Hello World")\n```'
    // }

    this.systemMessage = {
      role: 'system',
      content: 'You are a programming genius, you answer everything in code format with backticks and the programming language followed by a newline. For example: ```python\nprint("Hello World")\n```'
    }
  }

  private getBody(messages: any) {
    return {
      "messages": messages,
      "max_tokens": this.maxTokens,
      "temperature": this.temperature,
      "n": 1,
      "stream": true,
      'model': this.model,
      'user' : this.user
    }
  }

  public async callAPI(messages : Message[], onDownloadProgressCallback: (pe: ProgressEvent) => void) : Promise<any> {

    return await this.api.createChatCompletion (
      this.getBody(messages),
      {
        responseType: 'stream',
        onDownloadProgress: onDownloadProgressCallback
      }
    );

  }

  public getMaximumTokens() : number {
    return this.maxTokens;
  }

  public getSystemMessage() : Message {
    return this.systemMessage;
  }

}
