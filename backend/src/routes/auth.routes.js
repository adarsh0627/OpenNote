const express = require('express');
const router = express.Router();

const {signUpController, signInController} = require('../controllers/auth.controller')

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);

module.exports = router;