const express = require('express')
const authController = require('../controllers/authController');
const router = express.Router();

router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/getAll').get(authController.getAllUsers);

module.exports = router;