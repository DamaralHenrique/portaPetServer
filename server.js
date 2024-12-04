const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { start: mqttStart, updateDoorInfo, updateUserDoorsInfo } = require("./mqtt.js");
const { start, createPet, editPet, getPets, deletePet, getDoors, getDoorInfo, saveDoorPet } = require("./database.js");

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

  updateUserDoorsInfo(userId);

  response.send({ message: "Ok" });
});

app.get("/listPets/:userId", async (request, response) => {
  // const userId = request.user.id;
  let userId = request.params.userId;

  let pets = await getPets(userId);
  response.send(pets);
});

app.get("/listDoors/:userId", async (request, response) => {
  let userId = request.params.userId;

  let pets = await getDoors(userId);
  response.send(pets);
});

app.get("/listDoorPets/:doorId", async (request, response) => {
  let doorId = request.params.doorId;

  let pets = await getDoorInfo(doorId, true);
  response.send(pets);
});

app.post("/saveDoorPet", async (request, response) => {
  const body = request.body;

  let userId = body.userId;
  let pet = body.pet;
  let doorId = body.doorId;
  let doorIdentification = body.doorIdentification;

  await saveDoorPet(userId, pet, doorId);
  updateDoorInfo(doorIdentification);
  response.send({ message: "Ok" });
});

app.listen(port);
console.log("Server started at http://localhost:" + port);