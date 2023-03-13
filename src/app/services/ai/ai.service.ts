import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Configuration, OpenAIApi } from "openai";

// export interface ChatCompletion {
//   choices: Choice[];
//   created: number;
//   id: string;
//   model: string;
//   object: string;
// }

// interface Delta {
//   content?: string;
// }

// interface Choice {
//   delta: Delta;
//   finish_reason: string | null;
//   index: number;
// }

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';
  private apiKey!: string;
  private model: string = 'gpt-3.5-turbo-0301';
  private temperature: number = 0.5;
  private max_tokens: number = 128;
  private user: string = 'Gacrucis';
  private api = new OpenAIApi(new Configuration({apiKey: environment.OPENAI_SECRET}));

  constructor() {
    this.apiKey = environment.OPENAI_SECRET;
  }

  private getHeaders() {
    return {
      'Authorization': 'Bearer ' + this.apiKey
    }
  }

  private getBody(messages: any) {
    return {
      "messages": messages,
      "max_tokens": this.max_tokens,
      "temperature": this.temperature,
      "n": 1,
      "stream": true,
      'model': this.model,
      'user' : this.user
    }
  }

  public async callAPI(messages: any, onDownloadProgressCallback: (pe: ProgressEvent) => void) : Promise<any> {

    return await this.api.createChatCompletion (
      this.getBody([{'role' : 'user', 'content' : 'three words that describe you'}]),
      {
        responseType: 'stream',
        onDownloadProgress: onDownloadProgressCallback
      }
    );

  }

}
