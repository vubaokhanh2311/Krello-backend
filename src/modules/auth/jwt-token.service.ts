import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RedisService } from '../shared/redis/redis.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokenPair(payload: { uid: string }) {
    const jti = randomUUID();

    const jwtPayload: JwtPayload = {
      uid: payload.uid,
      jti,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret:
        this.config.get<string>('ACCESS_TOKEN_KEY') ?? 'default_access_secret',
      expiresIn: (this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN') ??
        '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(jwtPayload, {
      secret:
        this.config.get<string>('REFRESH_TOKEN_KEY') ??
        'default_refresh_secret',
      expiresIn: (this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN') ??
        '7d') as any,
    });

    await this.redisService.set(
      `refresh_token:${jti}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60,
    );

    return { accessToken, refreshToken, jti };
  }

  async verifyToken(
    token: string,
    type: 'access' | 'refresh',
  ): Promise<JwtPayload> {
    const secret =
      type === 'access'
        ? (this.config.get<string>('ACCESS_TOKEN_KEY') ??
          'default_access_secret')
        : (this.config.get<string>('REFRESH_TOKEN_KEY') ??
          'default_refresh_secret');

    return this.jwtService.verifyAsync<JwtPayload>(token, { secret });
  }

  async revokeRefreshToken(jti: string) {
    await this.redisService.del(`refresh_token:${jti}`);
  }

  async isRefreshTokenValid(jti: string): Promise<boolean> {
    const token = await this.redisService.get(`refresh_token:${jti}`);
    return !!token;
  }
}
