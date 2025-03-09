const router = require('express').Router();
const authController = require('./controller');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({ usernameField: 'email' }, authController.localStrategy));
router.post('/register', authController.register);
router.post('/login', authController.login);


module.exports = router;