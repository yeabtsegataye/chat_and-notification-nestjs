import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

interface user {
  id: string;
}

interface messaging extends user {
  socketId: string;
}
@Injectable()
@WebSocketGateway({ cors: '*' }) //OnGatewayInit  
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  messaging = new Map<string, messaging>();

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      client.disconnect(true);
      console.log('Returned');
      return;
    }
    try {
      const payload = this.jwt.verify(token);
     
        this.messaging.set(payload.id, {
          ...payload,
          socketId: client.id,
        });
      
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.log('Token expired');
      } else {
        console.error('Error verifying token:', error);
      }
      return;
    }
    console.log(`Client connected: ${client.id}`);
    // this.clients.set(client.id, { id: client.id, socket: client }); // Store the client
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.messaging.delete(client.id); // Remove the client on disconnect
  }

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, c_id: string) {
    console.log(`Client ${client.id} joining room ${c_id}`);
    client.join(c_id); // Join the room specified by c_id
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(payload: { roomId: any, message: any }) {
    const { roomId,message } = payload;
    console.log(roomId, message,'12qw' );
    
    console.log(
      `Sending message "${message}" to room ${roomId}`,
    );

    // Emit the message to all clients in the specified room
    this.server.to(roomId).emit('message', message);
  }

  @SubscribeMessage('notification')
  handleNotification(client: Socket, payload: {message: any }) {
    const { message } = payload;

    // Check if the sender exists in the clients map
    if (this.messaging.has(message.N_receiver)) {
      console.log(message, 'receiver');
      // Retrieve the recipient's client object from the map
      const recipientClient = this.messaging.get(message.N_receiver);
      console.log(recipientClient, 'recipientClient');

      // Emit the notification to the recipient's socket
      if (recipientClient) {
        this.server
          .to(recipientClient.socketId)
          .emit("Gnotification", message);
      } else {
        console.log(`Client with ID ${message.N_receiver} not found.`);
      }
    } else {
      console.log(`Client with ID ${message.receiver} not found.`);
    }
  }
}
