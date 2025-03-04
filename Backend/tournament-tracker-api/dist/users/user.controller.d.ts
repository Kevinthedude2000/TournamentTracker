import { UserService } from 'src/users/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: number): Promise<User | null>;
    createUser(createUserDto: CreateUserDto): Promise<User>;
    updateUser(): void;
    replaceUser(): void;
    deleteUser(): void;
}
