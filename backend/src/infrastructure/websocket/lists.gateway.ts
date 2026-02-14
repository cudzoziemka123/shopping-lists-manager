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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
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

  private serializeItemForWs(item: {
    id: string;
    listId: string;
    name: string;
    quantity: number;
    unit: string | null;
    status: string;
    priority: string;
    addedById: string;
    purchasedById?: string | null;
    purchasedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Record<string, unknown> {
    return {
      ...item,
      purchasedAt: item.purchasedAt
        ? (item.purchasedAt as Date).toISOString?.() ?? item.purchasedAt
        : null,
      createdAt:
        (item.createdAt as Date).toISOString?.() ??
        (item.createdAt as unknown as string),
      updatedAt:
        (item.updatedAt as Date).toISOString?.() ??
        (item.updatedAt as unknown as string),
    };
  }

  // Методы для отправки событий (вызываются из Use Cases)
  emitItemCreated(listId: string, item: any): void {
    const payload = this.serializeItemForWs(item);
    this.server.to(`list-${listId}`).emit('item-created', payload);
    this.logger.log(`Emitted item-created to list-${listId}`);
  }

  emitItemUpdated(listId: string, item: any): void {
    const payload = this.serializeItemForWs(item);
    this.server.to(`list-${listId}`).emit('item-updated', payload);
    this.logger.log(`Emitted item-updated to list-${listId}`);
  }

  emitItemDeleted(listId: string, itemId: string): void {
    this.server.to(`list-${listId}`).emit('item-deleted', { itemId });
    this.logger.log(`Emitted item-deleted to list-${listId}`);
  }
}
