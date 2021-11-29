const { Sequelize, DataTypes } = require("sequelize");
const database = require("../instance/weight_instance");

const user = database.define(
    "weightModelMaster",
    {
        // attributes
        model: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        model_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        target_product_count: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        weight_per_product: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        weight_tray: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        }
    },
    {
        //option
    }
);

(async () => {
    await user.sync({ force: false });
})();

module.exports = user;
