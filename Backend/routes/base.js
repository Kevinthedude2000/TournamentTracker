// Import dependencies
const express = require("express");

// Create a new router
module.exports = (app) => {
  const router = express.Router();

  // GET /users
  router.get("/users", async (req, res) => {
    const users = { test: 1, bad: 3 };
    res.json(users);
  });

  return router;
};
