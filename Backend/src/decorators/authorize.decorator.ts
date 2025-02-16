import { withMiddleware } from "inversify-express-utils";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = "secret-key-here";

export function authenticate() {
  return withMiddleware((req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (token) {
      jwt.verify(token, secretKey, (err, user) => {
        if (err) {
          // Unauthorized
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
    next();
  });
}
