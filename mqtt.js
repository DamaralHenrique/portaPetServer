const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://broker.hivemq.com");

const MqttStart = () => {
  client.on("connect", () => {
    console.log("Conectado nos topicos...");
    subscribeToTopic("portapet/1/info");
  });

  client.on("message", (topic, message) => {
    // message is Buffer
    console.log(message.toString());
    // client.end();
  });
}

const subscribeToTopic = (topic) => {
  client.subscribe("topic", (err) => {
    if (!err) {
      console.log("Conectado em " + topic);
    }else{
      console.log("Erro ao conectar em " + topic);
    }
  });
}

module.exports = MqttStart;

