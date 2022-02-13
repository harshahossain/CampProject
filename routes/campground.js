const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const Campground=require('../models/campground');
//const passport=require('passport')
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware');

//multer for file uploading
const multer  = require('multer')
//const upload = multer({ dest: 'uploads/' })
const {storage}=require('../cloudinary')//cause node automatically loooks for index.js file
const upload = multer({storage })
const campgrounds=require('../controllers/campgrounds')


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));
   // .post(upload.single('image'),(req,res)=>{
      
//new     //THE ORDER MATTERS HERE CAUSE WE DONT WANT TO GET CONSUDED /new with :id
router.get('/new',isLoggedIn,campgrounds.renderNewForm)


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn ,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))    
    .delete( isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//the route to get the edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports=router;