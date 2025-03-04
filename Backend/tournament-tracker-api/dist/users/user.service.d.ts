import { User } from './user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    get(id: number): Promise<User | null>;
    create(createUserDto: CreateUserDto): Promise<User>;
    patch(user: User): Promise<UpdateResult>;
}
