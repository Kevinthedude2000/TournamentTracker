import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateResult } from 'typeorm';

@Controller('user')
export class UserController {

  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  public getUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.get(id);
  }

  @Post()
  public createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  public updateUser(
    @Param('id', ParseIntPipe) id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put()
  public replaceUser() {}

  @Delete(':id')
  public deleteUser(@Param('id') id: number): Promise<void> {
    return this.usersService.delet(id);
  }
}
