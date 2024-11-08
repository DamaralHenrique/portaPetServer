const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require('sqlite3').verbose();
const MqttStart = require("./mqtt.js");

let db = new sqlite3.Database('./database/PortaPet.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
      return console.error(err.message);
  }
  console.log('Connected to the PortaPet.db SQlite database.');
});

MqttStart()

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

function createPet(userId, pet){
  db.run(`
    insert into pet (user_id, name, bluetooth_address, created_at, updated_at)
    values (?, ?, ?, DATE('now'), DATE('now'));
  `, [userId, pet['name'], pet['bluetooth_address']]
  , function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
}

function editPet(userId, pet){
  db.run(`
    UPDATE pet
      SET name = ?,
        updated_at = DATE('now')
      WHERE id = ? AND User_id = ?
    `, [pet['name'], pet['id'], userId]
  , function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been updated`);
  });
}

function getPets(userId){
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM pet
        WHERE user_id = ?`, 
    [userId], 
    (err, rows) => {
        if(err) {
            reject(err);
        }
        resolve(rows);
    })
  });
}

function deletePet(userId, petId){
  db.run(`
    DELETE FROM pet
      WHERE id = ? AND User_id = ?
    `, [petId, userId]
  , function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been deleted`);
  });
}