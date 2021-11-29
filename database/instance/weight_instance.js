const Sequelize = require("sequelize");
const sequelize = new Sequelize("weightScales", "postgres", "sa@admin", {
  host: "127.0.0.1",
  dialect: "postgres",
  // dialectOptions: {
  //   options: {
  //     instanceName: "FDBFAN",
  //   },
  // }, 
}); 

(async () => {
  await sequelize.authenticate();
})();

module.exports = sequelize;
