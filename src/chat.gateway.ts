import { WebSocketGateway, SubscribeMessage, WebSocketServer, ConnectedSocket, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

interface Sender {
  _id: string;
  name: string;
  role: string;
}

interface Message {
  _id: string;
  course_id: string;
  room_id: string;
  sender_id: Sender; 
  parent_id: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",  
    methods: ["GET", "POST"]
  }
})

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private activeClients: Map<string, Socket> = new Map();

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized!');
  }

  handleConnection(client: Socket, ...args: any[]) {
    if (this.activeClients.has(client.id)) {
        this.logger.log(`Client reconnected: ${client.id}`);
    } else {
        this.logger.log(`New client connected: ${client.id}`);
        this.activeClients.set(client.id, client);
    }
}

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeClients.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
      this.logger.log(`Trying to join room: ${room}`);
      client.join(room);
      this.server.to(room).emit('joinedRoom', { room, userId: client.id });
      this.logger.log(`Client ${client.id} joined room: ${room}`);
  }
  
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    if (room) {
      client.leave(room);
      this.server.to(room).emit('leftRoom', { room, userId: client.id });
      this.logger.log(`Client ${client.id} left room: ${room}`);
    } else {
      this.logger.error(`Failed to leave room: Room identifier is missing`);
    }
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: Message) {
    if (data.room_id && data.content.trim() !== '') {
        const message = {
            _id: data._id,
            course_id: data.course_id,
            room_id: data.room_id,
            sender_id: {
                _id: data.sender_id._id,
                name: data.sender_id.name,
                role: data.sender_id
            },
            parent_id: data.parent_id,
            content: data.content,
            createdAt: data.createdAt || new Date().toISOString(), // Assuming created_at might be optional
            updatedAt: new Date().toISOString()
        };
        this.server.to(data.room_id).emit('message', message); // Send the message to the specific room
        this.logger.log(`Message sent in room ${data.room_id}: ${JSON.stringify(message)}`);
    } else {
        this.logger.error(`Failed to send message: Missing room or content`);
    }
  }  
}