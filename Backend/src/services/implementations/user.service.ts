import { User } from "../../models/user";
import { IUserService } from "../interfaces/i-user.service";
import { injectable } from "inversify";

@injectable()
export class UserService implements IUserService {
  constructor() {
    console.log("UserService");
  }

  async get(id: string): Promise<User | undefined> {
    return Promise.resolve(undefined);
  }

  private async validateLogin(
    username: string,
    password: string,
  ): Promise<boolean> {
    return Promise.resolve(true);
  }
}
