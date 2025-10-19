import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RedisService } from '../../shared/redis/redis.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { REFRESH_TOKEN_TTL } from '../../constants/cache.constant';
import {
  genRefreshTokenKey,
  genRevokeKey,
} from '../../helpers/gen-redis-key.helper';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokenPair(payload: { uid: string }) {
    const jti = randomUUID();
    const jwtPayload: JwtPayload = { uid: payload.uid, jti };

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
      genRefreshTokenKey(jti),
      refreshToken,
      'EX',
      REFRESH_TOKEN_TTL,
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
    await this.redisService.del(genRefreshTokenKey(jti));
  }

  async isRefreshTokenValid(jti: string): Promise<boolean> {
    const token = await this.redisService.get(genRefreshTokenKey(jti));
    return !!token;
  }

  async revokeToken(jti: string, expiresInSeconds = 3600) {
    const key = genRevokeKey(jti);
    await this.redisService.set(key, 'revoked', 'EX', expiresInSeconds);
  }

  async isAccessTokenRevoked(jti: string): Promise<boolean> {
    const key = genRevokeKey(jti);
    const exists = await this.redisService.get(key);
    return !!exists;
  }

  async refreshToken(oldRefreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.verifyToken(oldRefreshToken, 'refresh');
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
    }

    const isValid = await this.isRefreshTokenValid(payload.jti);
    if (!isValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
    }

    await this.revokeRefreshToken(payload.jti);

    const newPair = await this.generateTokenPair({ uid: payload.uid });
    return newPair;
  }
}
