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

  private userSockets = new Map<string, Set<string>>();

  private socketUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(' Connection without token');
        client.disconnect();
        return;
      }

      const secret =
        this.configService.get<string>('ACCESS_TOKEN_KEY') ||
        this.configService.get<string>('JWT_SECRET') ||
        'your-secret-key';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      const userId = payload?.uid;

      if (!userId) {
        this.logger.warn('Invalid token payload');
        client.disconnect();
        return;
      }

      const isFirstConnection = !this.userSockets.has(userId);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }

      this.userSockets.get(userId)!.add(client.id);
      this.socketUsers.set(client.id, userId);

      client.join(`user:${userId}`);

      this.logger.log(` Client connected: ${client.id} (User: ${userId})`);

      if (isFirstConnection) {
        this.logger.log(` User online: ${userId}`);
        this.server.emit('user:online', { userId });
      }
    } catch (error) {
      this.logger.error(` Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      this.logger.log(` Client disconnected: ${client.id}`);
      return;
    }

    const sockets = this.userSockets.get(userId);
    sockets?.delete(client.id);

    this.socketUsers.delete(client.id);

    if (!sockets || sockets.size === 0) {
      this.userSockets.delete(userId);

      this.logger.log(` User offline: ${userId}`);
      this.server.emit('user:offline', { userId });
    }

    this.logger.log(` Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('board:join')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    if (!data?.boardId) return;

    client.join(`board:${data.boardId}`);
    this.logger.log(` Client ${client.id} joined board ${data.boardId}`);
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

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getOnlineUsers(): string[] {
    return [...this.userSockets.keys()];
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; cardId: string },
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId || !data?.boardId || !data?.cardId) return;

    client.to(`board:${data.boardId}`).emit('user:typing', {
      cardId: data.cardId,
      userId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; cardId: string },
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId || !data?.boardId || !data?.cardId) return;

    client.to(`board:${data.boardId}`).emit('user:stopped-typing', {
      cardId: data.cardId,
      userId,
    });
  }
}
