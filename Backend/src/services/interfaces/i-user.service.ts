import { User } from "../../models/user";

export interface IUserService {
  // validateLogin(username: string, password: string): Promise<boolean>;
  get(id: string): Promise<User | undefined>;
}
