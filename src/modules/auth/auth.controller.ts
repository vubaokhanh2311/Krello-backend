import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  LoginGoogleDto,
  ResetPasswordDto,
} from './dtos/auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtTokenService } from './jwt-token.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('auth')
@ApiSecurityAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  @Post('register')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterDto })
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('google')
  async loginWithGoogle(@Body() dto: LoginGoogleDto) {
    return this.authService.loginWithGoogle(dto);
  }

  @Post('login')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout the current user' })
  async logout(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.logout(req.user);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.jwtTokenService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
