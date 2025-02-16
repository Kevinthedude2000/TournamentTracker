import * as express from "express";
import {
  controller,
  httpPost,
  httpDelete,
  request,
  response,
  requestParam,
  BaseHttpController,
} from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { TYPES } from "../dependency_injection";
import { IdentityService } from "../services/implementations/identity.service";
import { authenticate } from "../decorators/authorize.decorator";

@controller("/identity")
export class IdentityController extends BaseHttpController {
  constructor(
    @inject(TYPES.IdentityService) private identityService: IdentityService,
  ) {
    super();
  }

  @httpPost("/generateJWT")
  @authenticate()
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
}
