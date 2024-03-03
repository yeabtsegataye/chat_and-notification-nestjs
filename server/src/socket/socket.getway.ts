import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Client {
  id: string;
  socket: Socket;
}

@WebSocketGateway({ cors: '*' })//OnGatewayInit
export class NotificationGateway implements  OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Client>(); // Map to store clients

  constructor() { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, { id: client.id, socket: client }); // Store the client
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id); // Remove the client on disconnect
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
  handleSendMessage(client: Socket, payload: { roomId: string, message: any }) {
    const { roomId } = payload;
    console.log(`Sending message "${payload.message.message }" to room ${roomId}`);
    
    // Emit the message to all clients in the specified room
    this.server.to(roomId).emit('message', payload.message);
  }

  @SubscribeMessage('notification')
  handleNotification(client: Socket, payload: { message: any }) {
    const { message } = payload;
    
    // Check if the sender exists in the clients map
    if (this.clients.has(message.receiver)) {
      console.log(message.receiver, "receiver")
      // Retrieve the socket of the recipient
      const recipientSocket = this.clients.get(message.receiver).socket;
  console.log(recipientSocket,"resipiacnt")
      // Emit the notification to the recipient
      recipientSocket.emit('getNotification', message);
    } else {
      console.log(`Client with ID ${message.receiver} not found.`);
    }
  }
  
}
