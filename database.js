const sqlite3 = require('sqlite3').verbose();
let db = null;

function start() {
  console.log("DB start");
  db = new sqlite3.Database('./database/PortaPet.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the PortaPet.db SQlite database.');
  });
}


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

function getAllDoors(){
  return new Promise((resolve, reject) => {
    db.all(`SELECT identification FROM door`, 
    [], 
    (err, rows) => {
        if(err) {
            reject(err);
        }
        resolve(rows);
    })
  });
}

function getDoors(userId){
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM door
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

function getDoorInfo(doorIdentification, fillInfo=false){
  let extraFields = ""
  if(fillInfo){
    extraFields = "P.name, P.id,"
  }
  
  return new Promise((resolve, reject) => {
    db.all(`SELECT P.bluetooth_address, ${extraFields}
        IFNULL(strftime('%H:%M', s1_start_at) || '/' || strftime('%H:%M', s1_end_at), '') AS e,
        IFNULL(strftime('%H:%M', s2_start_at) || '/' || strftime('%H:%M', s2_end_at), '') AS s 
      FROM pet AS P
      CROSS JOIN door AS D
      LEFT JOIN door_access AS DA ON P.id = DA.pet_id AND D.id = DA.door_id
      WHERE D.identification = ?`, 
    [doorIdentification], 
    (err, rows) => {
        if(err) {
            reject(err);
        }
        resolve(rows);
    })
  });
}

async function saveDoorPet(userId, pet, doorId){
  pet_access = await getDoorPet(pet['id'], doorId);

  if(pet_access.length != 0){
    db.run(`
      UPDATE door_access
        SET s1_start_at = ?,
          s1_end_at = ?,
          s2_start_at = ?,
          s2_end_at = ?,
          updated_at = DATE('now')
        WHERE pet_id = ? and DOOR_ID = ?
      `, [pet['sideOneStarsAt'], pet['sideOneEndsAt'], pet['sideTwoStarsAt'], pet['sideTwoEndsAt'], pet['id'], doorId]
    , function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been updated`);
    });
  }else{
    db.run(`
      insert into door_access (pet_id, door_id, s1_start_at, s1_end_at, s2_start_at, s2_end_at, created_at, updated_at)
        values (?, ?, ?, ?, ?, ?, DATE('now'), DATE('now'))
      `, [pet['id'], doorId, pet['sideOneStarsAt'], pet['sideOneEndsAt'], pet['sideTwoStarsAt'], pet['sideTwoEndsAt']]
    , function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  }
  
}

function getDoorPet(pet_id, door_id){
  return new Promise((resolve, reject) => {
    db.all(`SELECT id
      FROM door_access
      WHERE pet_id = ? AND door_id = ?`, 
    [pet_id, door_id], 
    (err, rows) => {
        if(err) {
            reject(err);
        }
        resolve(rows);
    })
  });
}

module.exports = { start, createPet, editPet, getPets, deletePet, getAllDoors, getDoors, getDoorInfo, saveDoorPet }