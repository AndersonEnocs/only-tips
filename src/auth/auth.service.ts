import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly adminPassword = 'onlytips2026';

  constructor(private jwtService: JwtService) {}

  async validateAdmin(password: string): Promise<boolean> {
    return password === this.adminPassword;
  }

  async login(password: string): Promise<{ access_token: string }> {
    if (!(await this.validateAdmin(password))) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload = { role: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}