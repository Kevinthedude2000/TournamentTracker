import { User } from "../../models/user";

export interface IUserService {
  get(id: string): Promise<User | undefined>;
}
