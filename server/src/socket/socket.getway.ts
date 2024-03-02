// notification.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Client {
  id: string;
  socket: Socket;
}

@WebSocketGateway({cors : '*'})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Client>(); // Map to store clients

  constructor() {}

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

  public sendMessageToClient(clientId: string, message: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.socket.emit('notification', message);
    } else {
      console.log(`Client with ID ${clientId} not found.`);
    }
  }
}
