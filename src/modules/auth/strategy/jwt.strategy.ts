import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ERROR_MESSAGES } from '../../../constants/error-messages.constant';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('ACCESS_TOKEN_KEY') || 'default_access_secret',
    });
  }

  async validate(payload: JwtPayload) {
    const isRevoked = await this.redis.get(`bl_${payload.jti}`);
    if (isRevoked) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.uid },
    });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      jti: payload.jti,
    };
  }
}
