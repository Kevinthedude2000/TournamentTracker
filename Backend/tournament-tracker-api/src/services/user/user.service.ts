import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async get(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  public async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  public async patch(user: User): Promise<UpdateResult> {
    return await this.userRepository.update(user.id, user);
  }
}
