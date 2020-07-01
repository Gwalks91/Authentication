const router = require('express').Router();
const controller = require('../controllers/authentication_controller');

router.post("/login", controller.login);

router.post("/logout", controller.logout);

module.exports = router;