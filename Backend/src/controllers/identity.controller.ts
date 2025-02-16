import * as express from "express";
import {
  interfaces,
  controller,
  httpGet,
  httpPost,
  httpDelete,
  request,
  queryParam,
  response,
  requestParam,
} from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { TYPES } from "../dependency_injection";
import { UserService } from "../services/implementations/user.service";
import { IdentityService } from "../services/implementations/identity.service";

@controller("/identity")
export class IdentityController implements interfaces.Controller {
  constructor(
    @inject(TYPES.IdentityService) private identityService: IdentityService,
  ) {}

  @httpPost("/generateJWT")
  private async create(
    @request() req: express.Request,
    @response() res: express.Response,
  ) {
    const { username, password } = req.body;
    const jwt = await this.identityService.generateJWT(username, password);

    // This was an example. Can remove once controller is working as expected.
    // try {
    //   await this.fooService.create(req.body);
    //   res.sendStatus(201);
    // } catch (err) {
    //   res.status(400).json({ error: err.message });
    // }
  }

  @httpDelete("/:id")
  private delete(
    @requestParam("id") id: string,
    @response() res: express.Response,
  ): Promise<void> {
    return this.fooService
      .delete(id)
      .then(() => res.sendStatus(204))
      .catch((err: Error) => {
        res.status(400).json({ error: err.message });
      });
  }
}
