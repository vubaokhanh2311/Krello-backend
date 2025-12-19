import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocketEventsService } from './socket-events.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('ACCESS_TOKEN_KEY') ||
          configService.get<string>('JWT_SECRET') ||
          'your-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SocketGateway, SocketEventsService],
  exports: [SocketGateway, SocketEventsService],
})
export class SocketModule {}
