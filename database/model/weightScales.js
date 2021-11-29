const { Sequelize, DataTypes } = require("sequelize");
const database = require("../instance/weight_instance");

const user = database.define(
    "weightScales",
    {
        // attributes
        device_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        device_ip: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isIPv4: true,
            }
        },
        device_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        running_model : {
            type: Sequelize.STRING,
        },
        device_detail: {
            type: Sequelize.STRING(65535) ,
        },
    },
    {
        //option
    }
);

(async () => {
    await user.sync({ force: false });
})();

module.exports = user;
