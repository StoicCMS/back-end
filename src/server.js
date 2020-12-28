const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

require("dotenv").config();

const rootRouter = require("./api");

const port = process.env.PORT || 4000;

// Setup database
const conn = require("./dbConfig");

(async function start() {
  app.use(bodyParser.json()); // for parsing application/json

  conn.connect();

  app.use("/static", express.static(path.join(__dirname, "public")));

  app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "/html/home.html"));
  });

  app.use("/api", rootRouter);

  // Listen the server
  app.listen(port, () =>
    console.log(`Server up and running on http://powerman:${port}! 🚀`)
  );
})();
