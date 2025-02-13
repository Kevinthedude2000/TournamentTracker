import express, { Request, Response } from "express";

const router = express.Router();

router.get("/:id", (req: Request, res: Response) => {
  res.send("TODO");
});

router.post("/", (req: Request, res: Response) => {
  res.send("TODO");
});

router.patch("/:id", (req: Request, res: Response) => {
  res.send("TODO");
});
