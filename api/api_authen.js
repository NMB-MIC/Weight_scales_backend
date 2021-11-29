const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const constants = require("./../constant/constant");
const Sequelize = require("sequelize");
const { getToken, verifyToken } = require('../passport/jwtHandler');
const mailer = require("nodemailer");
const moment = require('moment');

//Models
const user = require("./../database/model/user");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    let result = await user.findOne({ where: { username } });
    if (result != null) {
      if (
        result.levelUser == "user" ||
        result.levelUser == "power" ||
        result.levelUser == "admin" ||
        result.levelUser == "MIC_Member" ||
        result.levelUser == "MIC_Head"
      ) {
        if (bcrypt.compareSync(password, result.password)) {
          //update last logon
          await user.update(
            { lastLogOn: moment().format('YYYY-MM-DD HH:mm:ss') },
            { where: { username } })
          var token = await getToken({ username })
          res.json({
            result,
            token,
            api_result: constants.kResultOk,
          });
        } else {
          console.log("Incorrect password");
          res.json({
            error: "Incorrect password",
            api_result: constants.kResultNok,
          });
        }
      } else {
        console.log("Please validate email");
        res.json({
          error: "Please validate email",
          api_result: constants.kResultNok,
        });
      }
    } else {
      console.log("Username not found please register");
      res.json({
        error: "Username not found please register",
        api_result: constants.kResultNok,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      error,
      api_result: constants.kResultNok,
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const approverEmail = 'tarin.n@minebea.co.th'
    req.body.levelUser = "guest"

    // encrypt password
    req.body.password = bcrypt.hashSync(req.body.password, 8);

    //create registerKey
    const registerKey = makeid(10);
    req.body.registerKey = registerKey;

    //Insert to db
    let result = await user.create(req.body);

    if (false) {
      try {
        var smtp = {
          host: "10.121.1.22", //set to your host name or ip
          port: 25, //25, 465, 587 depend on your
          secure: false, // use SSL
        };

        var smtpTransport = mailer.createTransport(smtp);
        var mail = {
          from: "mic_messenger@minebea.co.th", //from email (option)
          to: approverEmail, //to email (require)
          subject: `Please verify account (${req.body.empNumber}) [Weight scales]`, //subject
          html:
            `<h3>Please click below this link to verify this account</h3>
          <p>Username : ${req.body.username}</p>
          <p>Emp number : ${req.body.empNumber}</p>
        <a href='${constants.apiUrl}authen/verifyEmail/` +
            req.body.username +
            `/` +
            registerKey +
            `'>Approve</a>`,
        };

        await smtpTransport.sendMail(mail, function (error, _response) {
          smtpTransport.close();
          if (error) {
            //error handler
            console.log(error);
            res.json({
              error,
              api_result: constants.kResultNok,
            });
          } else {
            res.json({
              result,
              api_result: constants.kResultOk,
            });
          }
        });

      } catch (error) {
        console.log(error);
        res.json({
          error,
          api_result: constants.kResultNok,
        });
      }
    }

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

router.patch("/forgot", async (req, res) => {
  try {

    const { email } = req.body
    const newPassword = await makeid(12)
    const password = await bcrypt.hashSync(newPassword, 8);
    await user.update({ password }, { where: { email } })
    let result = await user.findOne({ where: { email } });
    try {
      var smtp = {
        host: "10.121.1.22", //set to your host name or ip
        port: 25, //25, 465, 587 depend on your
        secure: false, // use SSL
      };

      var smtpTransport = mailer.createTransport(smtp);
      var mail = {
        from: "mic_messenger@minebea.co.th", //from email (option)
        to: result.email, //to email (require)
        subject: "<Forgot password> re-created your new password", //subject
        html: `
        <p>Username : ${result.username}</p>
        <p>new password : ${newPassword}</p>
        <p>Please use this new password to log in again</p>`,
      };

      await smtpTransport.sendMail(mail, function (error, _response) {
        smtpTransport.close();
        if (error) {
          //error handler
          console.log(error);
          res.json({
            error,
            api_result: constants.kResultNok,
          });
        } else {
          res.json({
            api_result: constants.kResultOk,
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.json({
        error,
        api_result: constants.kResultNok,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      error,
      api_result: constants.kResultNok,
    });
  }
})

router.get("/verifyEmail/:username/:registerKey", async (req, res) => {
  try {
    console.log("verify");
    const { username, registerKey } = req.params;
    let result = await user.update(
      { levelUser: "user" },
      { where: { username, registerKey } }
    );

    if (result[0] >= 1) {
      res.send(`<html>
    <body style="text-align:center">
    <h1 style="color:green">Register completed</h1>
    <p>Please inform to ${username}</p>
    </body>
    </html>`)
    } else {
      res.send(`<html>
    <body style="text-align:center">
    <h2 style="color:red">Register failed</h2>
    <p>Register key not match , please contact administrator</p>

    </body>
    </html>`)
    }

  } catch (error) {
    res.send(`<html>
    <body>
    <h2>Error</h2>
    <p>${error}</p>
    </body>
    </html>`)
  }
});

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;
