const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();

// app.get("/home", (req, res) => {
//   res.json({ message: "Server Connection Complete!" });
// });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});