const express = require('express')
const authController = require('../controllers/authController');
const router = express.Router();

router.route('/signUp').post(authController.signUp);
router.route('/verify-email/:token').get(authController.verifyEmail);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.route('/getAll').get(authController.protect,authController.getAllUsers);
router.route('/updatePassword').patch(authController.protect,authController.updatePassword);
router.route('/updateData').patch(authController.protect,authController.updateData);

module.exports = router;