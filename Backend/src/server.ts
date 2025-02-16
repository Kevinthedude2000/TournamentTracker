import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/protected", authenticateJWT, (req, res) => {
  res.send("This is a protected route");
});
