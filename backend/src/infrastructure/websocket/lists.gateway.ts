import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../http/types/jwt-payload.interface';

interface SocketData {
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // В production указать конкретный домен
  },
})
export class ListsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ListsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket<any, any, any, SocketData>): void {
    try {
      // Извлекаем токен из handshake
      const token = client.handshake.auth.token as string | undefined;
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Проверяем токен
      const payload = this.jwtService.verify<JwtPayload>(token);
      // Сохраняем userId в socket data
      client.data.userId = payload.sub;
      this.logger.log(`Client ${client.id} connected (user: ${payload.sub})`);
    } catch (error) {
      this.logger.error(`Client ${client.id} connection failed: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join-list')
  async handleJoinList(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { listId: string },
  ): Promise<{ event: string; data: { listId: string } }> {
    await client.join(`list-${data.listId}`);
    this.logger.log(`Client ${client.id} joined list-${data.listId}`);
    return { event: 'joined-list', data: { listId: data.listId } };
  }

  @SubscribeMessage('leave-list')
  async handleLeaveList(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { listId: string },
  ): Promise<{ event: string; data: { listId: string } }> {
    await client.leave(`list-${data.listId}`);
    this.logger.log(`Client ${client.id} left list-${data.listId}`);
    return { event: 'left-list', data: { listId: data.listId } };
  }

  // Методы для отправки событий (вызываются из Use Cases)
  emitItemCreated(listId: string, item: any): void {
    this.server.to(`list-${listId}`).emit('item-created', item);
    this.logger.log(`Emitted item-created to list-${listId}`);
  }

  emitItemUpdated(listId: string, item: any): void {
    this.server.to(`list-${listId}`).emit('item-updated', item);
    this.logger.log(`Emitted item-updated to list-${listId}`);
  }

  emitItemDeleted(listId: string, itemId: string): void {
    this.server.to(`list-${listId}`).emit('item-deleted', { itemId });
    this.logger.log(`Emitted item-deleted to list-${listId}`);
  }
}
