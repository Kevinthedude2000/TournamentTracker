
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(
    emailAddress: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.getBy(emailAddress);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.emailAddress };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
