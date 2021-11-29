const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");

//models
const weightModelMaster = require('./../database/model/weightModelMaster');
const user = require("../database/model/user");

router.get("/models", async (req, res) => {
    try {
        let result = await weightModelMaster.findAll({ order: [["model", "ASC"]], });
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

router.get("/find_models/:keyword", async (req, res) => {
    try {
        const { keyword } = req.params;
        let result = await weightModelMaster.findAll({
            where: {
                [Op.or]: [
                    // { device_id: { [Op.like]: `%${keyword}%` } },
                    { model: { [Op.like]: `%${keyword}%` }, },
                    { model_name: { [Op.like]: `%${keyword}%` } },
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

router.get("/find_model/:model", async (req, res) => {
    try {
        const { model } = req.params
        let result = await weightModelMaster.findOne({ where: { model } });
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

router.post("/models",  async (req, res) => {
    try {
        let result = await weightModelMaster.create(req.body);
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

router.put("/models",  async (req, res) => {
    try {
        //check updater class
        let { updater } = req.body
        let userLevel = await user.findOne({ where: { username: updater } })
        if (userLevel.levelUser === 'admin' || userLevel.levelUser === 'power') {

            let result = await weightModelMaster.update(req.body, { where: { model: req.body.model } });
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
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

router.delete("/models",  async (req, res) => {
    try {
        let { model } = req.body
        const userLevel = await user.findOne({ where: { username: updater } })
        if (userLevel.levelUser === 'admin' || userLevel.levelUser === 'power') {
            let result = await weightModelMaster.destroy({ where: { model }, });
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
