import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtTokenService } from './jwt-token.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.logout(req.user);
  }

  @Post('refresh-token')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.jwtTokenService.refreshToken(refreshToken);
  }
}
