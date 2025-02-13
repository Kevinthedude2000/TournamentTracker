import { User } from "./models/user";
import "reflect-metadata";
import { injectable, inject, Container } from "inversify";
import { IUserService } from "./services/interfaces/i-user-service";
import { UserService } from "./services/implementations/user_service";
const TYPES = {
  UserService: Symbol.for("IUserService"),
};

const container = new Container();

// Bindings - Services
container.bind<IUserService>(TYPES.UserService).to(UserService);
