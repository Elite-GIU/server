import {MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse} from '@nestjs/websockets';

@WebSocketGateway(80, {namespace: 'chat'})   
export class ChatGateway {
  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): WsResponse<string> {
    return { event: 'message', data };
  }
}
