const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.use(cors());
// app.use(cookieParser());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/test", (request, response) => {
  response.send({ message: "Ok" });
});

app.listen(port);
console.log("Server started at http://localhost:" + port);