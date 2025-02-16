import "reflect-metadata";
import { injectable, inject, Container } from "inversify";
import { IUserService } from "./services/interfaces/i-user.service";
import { UserService } from "./services/implementations/user.service";
import { IdentityService } from "./services/implementations/identity.service";
import { IIdentityService } from "./services/interfaces/i-identity.service";
export const TYPES = {
  IdentityService: Symbol.for("IIdentityService"),
  UserService: Symbol.for("IUserService"),
};

export const container = new Container();

// Bindings - Services
container
  .bind<IUserService>(TYPES.UserService)
  .to(UserService)
  .inTransientScope();
container
  .bind<IIdentityService>(TYPES.IdentityService)
  .to(IdentityService)
  .inTransientScope();
