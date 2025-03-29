import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateResult } from 'typeorm';

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  public getUser(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<User | null> {
    return this.usersService.get(userId);
  }

  @Post()
  public createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  public updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':id')
  public deleteUser(@Param('id') userId: number): Promise<void> {
    return this.usersService.delet(userId);
  }
}
