import express, { Request, Response } from "express";

const router = express.Router();

router.get("/:id", (req: Request, res: Response) => {
  res.send("Tournament route");
});
