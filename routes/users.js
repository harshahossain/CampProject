const express=require('express');
const router=express.Router();
const passport=require('passport');
const User=require('../models/user');
const catchAsync=require('../utils/catchAsync')

//controllers
const users=require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));


router.get('/logout',users.logout)

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)

module.exports=router;