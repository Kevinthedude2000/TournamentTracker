import { injectable } from "inversify";
import { IIdentityService } from "../interfaces/i-identity.service";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

@injectable()
export class IdentityService implements IIdentityService {
  // TODO: inject configuration service once created
  constructor() {}

  public generateJWT(
    username: string,
    password: string,
  ): Promise<string | undefined> {
    // See if user exist for username password combo
    // If yes, then generate JWT
    // If no, then send 401

    // const user = users.find((u) => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
      // TODO: Use config servie to get secret key
      const accessToken = jwt.sign({ username: user.username }, secretKey, {
        expiresIn: "1h",
      });
      return Promise.resolve(accessToken);
    } else {
      return Promise.resolve(undefined);
    }
  }
}
