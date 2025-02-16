import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Move to the service layer
  // users.push({ username, password: hashedPassword });
  res.send("User registered");
});
