import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponseDto } from '../shared/dtos/api-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { password: string }): Promise<ApiResponseDto<{ access_token: string }>> {
    const token = await this.authService.login(body.password);
    return {
      statusCode: 1000,
      message: 'Login successful',
      data: token,
    };
  }
}