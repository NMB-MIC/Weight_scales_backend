const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const json2xls = require('json2xls');
const { getToken, verifyToken } = require('./passport/jwtHandler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }));
app.use(json2xls.middleware);
app.use(express.static(path.join(__dirname, "./files")));
app.use(cors());

app.use("/api/weightScales/authen/", require("./api/api_authen"));
app.use("/api/weightScales/manage_user/", verifyToken, require("./api/api_manage_user"));
app.use("/api/weightScales/mqtt/", require("./api/api_mqtt"));
app.use("/api/weightScales/master_devices/", require("./api/api_weight_scales"));
app.use("/api/weightScales/weight_models/", verifyToken, require("./api/api_weight_models"));

app.listen(2009, () => {
  console.log("Backend is running...");
});
