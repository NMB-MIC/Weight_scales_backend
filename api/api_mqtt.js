const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");
const mqtt = require('mqtt');

router.get('/weight', async (req, res) => {
    try {
        var client = await mqtt.connect("http://192.168.100.55:1883/");
        client.on("connect", function () {
            const connectResult = client.connected

            var topic_s = "weight";
            client.subscribe(topic_s, { qos: 2 });

            client.on('message', function (topic, message, packet) {
                client.end();
                res.json({
                    api_result: constants.kResultOk,
                    connectResult,
                    topic,
                    message: parseFloat(message.toString()),
                    unit: 'kg'
                })
            });
        })
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constants.kResultNok })
    }
})

module.exports = router;
