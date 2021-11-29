const express = require("express");
const router = express.Router();
const constants = require("../constant/constant");
const user = require("../database/model/user");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { verifyToken } = require("../passport/jwtHandler");

//Models
const weightScales = require('../database/model/weightScales')
const weightModelMaster = require('./../database/model/weightModelMaster');

router.get("/devicess", async (req, res) => {
    try {
        // weightScales.hasMany(weightModelMaster, { foreignKey: 'model' })
        // weightModelMaster.belongsTo(weightScales, { foreignKey: 'running_model' })

        weightModelMaster.hasMany(weightScales, { foreignKey: 'running_model' })
        weightScales.belongsTo(weightModelMaster, { foreignKey: 'running_model' })

        let result = await weightScales.findAll({
            include: [weightModelMaster],
        });
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        console.log(error);
        res.json({
            error,
            api_result: constants.kResultNok,
        });
    }
});

router.get("/devices", async (req, res) => {
    try {

        let result = await weightScales.findAll({});
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        console.log(error);
        res.json({
            error,
            api_result: constants.kResultNok,
        });
    }
});

router.get("/find_device/:device_id", async (req, res) => {
    try {
        weightModelMaster.hasMany(weightScales, { foreignKey: 'running_model' })
        weightScales.belongsTo(weightModelMaster, { foreignKey: 'running_model' })

        const { device_id } = req.params
        let result = await weightScales.findOne({ where: { device_id }, include: [weightModelMaster], });
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        res.json({
            error,
            api_result: constants.kResultNok,
        });
    }
});

router.post("/devices", verifyToken, async (req, res) => {
    try {
        let result = await weightScales.create(req.body);
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        res.json({
            error,
            api_result: constants.kResultNok,
        });
    }
});

router.get("/find_devices/:keyword", async (req, res) => {
    try {
        const { keyword } = req.params;
        let result = await weightScales.findAll({
            where: {
                [Op.or]: [
                    // { device_id: { [Op.like]: `%${keyword}%` } },
                    { device_ip: { [Op.like]: `%${keyword}%` }, },
                    { device_name: { [Op.like]: `%${keyword}%` } },
                    { device_detail: { [Op.like]: `%${keyword}%` } },
                ],
            },
        });
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        console.log(error);
        res.json({
            error: JSON.stringify(error),
            api_result: constants.kResultNok,
        });
    }
});

router.put("/devices", verifyToken, async (req, res) => {
    try {
        //check updater class
        let { updater } = req.body
        let userLevel = await user.findOne({ where: { username: updater } })
        if (userLevel.levelUser === 'admin' || userLevel.levelUser === 'power') {
            let updateDetail = {}
            if (req.body.device_ip) {
                updateDetail.device_ip = req.body.device_ip
            }
            if (req.body.device_name) {
                updateDetail.device_name = req.body.device_name
            }
            if (req.body.device_detail) {
                updateDetail.device_detail = req.body.device_detail
            }
            if (req.body.running_model) {
                updateDetail.running_model = req.body.running_model
            }

            let result = await weightScales.update(updateDetail, { where: { device_id: req.body.device_id } });
            console.log(result);
            res.json({
                result,
                api_result: constants.kResultOk,
            });
        } else {
            res.json({
                api_result: constants.kResultNok,
                error: 'permission denied',
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

router.delete("/devices", verifyToken, async (req, res) => {
    try {
        let { device_id, updater } = req.body
        const userLevel = await user.findOne({ where: { username: updater } })
        if (userLevel.levelUser === 'admin' || userLevel.levelUser === 'power') {
            let result = await weightScales.destroy({
                where: { device_id },
            });
            res.json({
                result,
                api_result: constants.kResultOk,
            });
        } else {
            res.json({
                api_result: constants.kResultNok,
                error: 'permission denied',
            });
        }
    } catch (error) {
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

module.exports = router;

