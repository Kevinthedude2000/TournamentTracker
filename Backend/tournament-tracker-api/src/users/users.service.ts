import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public async get(userId: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ userId });
  }

  public async getBy(emailAddress: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ emailAddress });
  }

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.emailAddress = createUserDto.email;

    return await this.usersRepository.save(user);
  }

  public async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    if (updateUserDto.firstName || updateUserDto.lastName) {
      const user = new User();
      if (updateUserDto.firstName) {
        user.firstName = updateUserDto.firstName;
      }
      if (updateUserDto.lastName) {
        user.lastName = updateUserDto.lastName;
      }

      return await this.usersRepository.update(userId, user);
    } else {
      // Create an empty update result for when no fields to update
      const emptyResult = new UpdateResult();
      emptyResult.affected = 0;
      emptyResult.raw = {};
      emptyResult.generatedMaps = [];
      return emptyResult;
    }
  }

  public async delet(userId: number): Promise<void> {
    await this.usersRepository.delete(userId);
  }
}
