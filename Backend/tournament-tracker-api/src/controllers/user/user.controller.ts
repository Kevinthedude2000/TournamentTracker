import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Get()
  public getUser() {

  }
}
