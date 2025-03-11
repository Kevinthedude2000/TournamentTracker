import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteResult } from 'typeorm/driver/mongodb/typings';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async get(userId: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ userId });
  }

  public async getBy(emailAddress: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ emailAddress });
  }

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.emailAddress = createUserDto.email;

    return await this.userRepository.save(user);
  }

  public async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    const user = new User();
    console.log('updateUserDto: ', updateUserDto);
    console.log('user: ', user);
    user.firstName = updateUserDto.firstName;
    user.lastName = updateUserDto.lastName;

    return await this.userRepository.update(userId, user);
  }

  public async delet(userId: number): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
