const express=require('express');
const router=express.Router({mergeParams:true});//by default cant read null cause req.params cut off
const catchAsync=require('../utils/catchAsync');
const Review=require('../models/review');
const Campground=require('../models/campground');
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware');
const ExpressError=require('../utils/ExpressError');

//controllers
const reviews=require('../controllers/reviews')

//review adding
router.post('/',isLoggedIn,validateReview ,catchAsync(reviews.createReview));
    //deleting reviews
router.delete('/:reviewId',isLoggedIn,isReviewAuthor ,catchAsync(reviews.deleteReview));

module.exports=router;