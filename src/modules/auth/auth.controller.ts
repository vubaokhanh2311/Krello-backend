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
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account with email, password, and name. Returns access token and refresh token.',
  })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('google')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: LoginGoogleDto })
  @ApiOperation({
    summary: 'Login with Google',
    description:
      'Authenticate using Google OAuth token. Returns access token and refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated with Google',
  })
  @ApiResponse({ status: 400, description: 'Invalid Google token' })
  async loginWithGoogle(@Body() dto: LoginGoogleDto) {
    return this.authService.loginWithGoogle(dto);
  }

  @Post('login')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: LoginDto })
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticate with email and password. Returns access token and refresh token. Optionally accepts FCM token and device ID for push notifications.',
  })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'Logout the current user',
    description:
      'Logout the authenticated user and invalidate the current session.',
  })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async logout(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.logout(req.user);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token using refresh token',
    description:
      'Generate a new access token using a valid refresh token. Returns new access token and refresh token.',
  })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.jwtTokenService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Send a password reset email to the user. The email contains a reset token that can be used to reset the password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({ status: 404, description: 'User with this email not found' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ResetPasswordDto })
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Reset user password using the token received from forgot-password email. Requires token, email, and new password.',
  })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
