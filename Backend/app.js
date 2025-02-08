// Import dependencies
const express = require("express");
const app = express();
require("./routes/base")(app);

// Set up port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
