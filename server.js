const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { start: mqttStart, subscribeToTopic } = require("./mqtt.js");
const { start, createPet, editPet, getPets, deletePet } = require("./database.js");

start();
mqttStart();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/test", (request, response) => {
  response.send({ message: "Ok" });
});

app.post("/savePet", async (request, response) => {
  // const userId = request.user.id;
  const body = request.body;

  let userId = body.userId;
  let pet = body.pet;

  if(pet['id'] == null){
    await createPet(userId, pet);
  }else{
    await editPet(userId, pet);
  }

  response.send({ message: "Ok" });
});

app.post("/deletePet", async (request, response) => {
  // const userId = request.user.id;
  const body = request.body;

  let userId = body.userId;
  let petId = body.petId;

  await deletePet(userId, petId);

  response.send({ message: "Ok" });
});

app.get("/listPets/:userId", async (request, response) => {
  // const userId = request.user.id;
  let userId = request.params.userId;

  let pets = await getPets(userId);
  response.send(pets);
});

app.listen(port);
console.log("Server started at http://localhost:" + port);