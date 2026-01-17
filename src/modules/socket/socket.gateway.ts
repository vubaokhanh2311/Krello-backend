import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/redis/redis.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('SocketGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('Connection without token');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret:
          this.configService.get<string>('ACCESS_TOKEN_KEY') ??
          this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload?.uid;
      if (!userId) {
        client.disconnect();
        return;
      }

      const socketId = client.id;

      await this.redisService.sadd(`socket:user:${userId}`, socketId);

      await this.redisService.set(`socket:client:${socketId}`, userId);

      client.join(`user:${userId}`);

      const socketCount = await this.redisService.scard(
        `socket:user:${userId}`,
      );

      if (socketCount === 1) {
        this.logger.log(`User online: ${userId}`);
        this.server.emit('user:online', { userId });
      }

      this.logger.log(`Client connected: ${socketId} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const socketId = client.id;

    const userId = await this.redisService.get(`socket:client:${socketId}`);

    if (!userId) {
      this.logger.log(`Client disconnected: ${socketId}`);
      return;
    }

    await this.redisService.srem(`socket:user:${userId}`, socketId);
    await this.redisService.del(`socket:client:${socketId}`);

    const socketCount = await this.redisService.scard(`socket:user:${userId}`);

    if (socketCount === 0) {
      await this.redisService.del(`socket:user:${userId}`);
      this.logger.log(`User offline: ${userId}`);
      this.server.emit('user:offline', { userId });
    }

    this.logger.log(`Client disconnected: ${socketId}`);
  }

  @SubscribeMessage('board:join')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    if (!data?.boardId) return;

    client.join(`board:${data.boardId}`);
    this.logger.log(`Client ${client.id} joined board ${data.boardId}`);
  }

  @SubscribeMessage('board:leave')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    if (!data?.boardId) return;

    client.leave(`board:${data.boardId}`);
  }

  emitToBoard(boardId: string, event: string, data: any) {
    this.server.to(`board:${boardId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const count = await this.redisService.scard(`socket:user:${userId}`);
    return count > 0;
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; cardId: string },
  ) {
    const userId = await this.redisService.get(`socket:client:${client.id}`);

    if (!userId || !data?.boardId || !data?.cardId) return;

    client.to(`board:${data.boardId}`).emit('user:typing', {
      cardId: data.cardId,
      userId,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; cardId: string },
  ) {
    const userId = await this.redisService.get(`socket:client:${client.id}`);

    if (!userId || !data?.boardId || !data?.cardId) return;

    client.to(`board:${data.boardId}`).emit('user:stopped-typing', {
      cardId: data.cardId,
      userId,
    });
  }
}
