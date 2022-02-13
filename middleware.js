const {campgroundSchema}=require('./schemas.js');
const ExpressError=require('./utils/ExpressError');
const Campground=require('./models/campground')
const {reviewSchema}=require('./schemas.js')
const Review=require('./models/review');
module.exports.isLoggedIn=(req,res,next)=>{ 
    console.log('req.user= ',req.user)
    if(!req.isAuthenticated()){
        //have to store the url they are requesting because we need it in here
       // console.log(req.path,req.originalUrl)
        //req.session.returnTo=req.originalUrl;//turnin it off we asign it in app.js app.use locals
        req.flash('error','You must be signed in!');
        return res.redirect('/login'); //cannot set header after the clent or someting
    }
    next();
}    

module.exports.validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
    // console.log(result);
}
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash('error','You do not have that permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
    // console.log(result);
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewID}=req.params;
    const review=await Review.findById(reviewID);
    if (!review.author.equals(req.user._id)){
        req.flash('error','You do not have that permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}