import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { container } from "../dependency_injection";
import { UserService } from "../services/implementations/user.service";
import { inject } from "inversify";

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (user && bcrypt.compareSync(password, user.password)) {
    const accessToken = jwt.sign({ username: user.username }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ accessToken });
  } else {
    res.send("Username or password incorrect");
  }
});
