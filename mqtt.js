const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://broker.hivemq.com");
// const client = mqtt.connect("mqtt://test.mosquitto.org");
const { getAllDoors, getDoorInfo } = require("./database.js");

function start() {
  console.log("MQTT start");
  client.on("connect", async () => {
    console.log("Conectado nos topicos...");
    let doors = await getAllDoors();
    doors.forEach((door) => {
      subscribeToTopic('portapet/'+door.identification+'/update');
    })
    console.log("Topicos conectados");
  });

  client.on("message", async (topic, message) => {
    var topicArray = topic.split("/");
    if(topicArray[2] == "update"){
      let door_identification = topicArray[1];
      let door = await getDoorInfo(door_identification);
      if(door){
        client.publish('portapet/'+door_identification+'/info', JSON.stringify(door));
      }
    }
  });

  client.on('error', (error) => {
    console.error('Erro de conexão:', error);
  });
}


const subscribeToTopic = (topic) => {
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log("Conectado em " + topic);
    }else{
      console.log("Erro ao conectar em " + topic);
    }
  });
}

// const updateDoorInfo = (doorId) => {
  
// }

module.exports = { start, subscribeToTopic };

