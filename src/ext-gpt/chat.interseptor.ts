import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ChatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((chat) => this.filterChatMessages(chat)));
  }

  private filterChatMessages(chat) {
    if (Array.isArray(chat)) {
      return chat.map(this.filterMessages);
    }
    if (Array.isArray(chat?.analysis)) {
      chat.analysis = chat.analysis.map(this.filterMessages);
    }
    return this.filterMessages(chat);
  }

  private filterMessages(chat) {
    if (chat && chat.messages && Array.isArray(chat.messages)) {
      chat.messages = chat.messages.filter(
        (message) => message.date !== undefined,
      );
    }
    return chat;
  }
}
