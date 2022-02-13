if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
//console.log(process.env.SECRET);

const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
//session//flash
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');
//const MongoDBStore=require('connect-mongo');

//const Campground=require('./models/campground');
//const Review=require('./models/review')
const ejsMate=require('ejs-mate')
const methodOverride=require('method-override');
const ExpressError=require('./utils/ExpressError');
//const catchAsync=require('./utils/catchAsync');
// const Joi=require('joi'); //cause we are exporting through other file.. the exact line below
//const {campgroundSchema,reviewSchema}=require('./schemas.js')//is there any reason to specify that its a js file?
const mongoSanitize = require('express-mongo-sanitize')

//security
const helmet = require("helmet");

const campgroundRoutes=require('./routes/campground');
const reviewRoutes=require('./routes/reviews');
const userRoutes=require('./routes/users');
//passowrds
const passport=require('passport');
const LocalStrategy=require('passport-local');

const User=require('./models/user');

const app=express();

//db live
//const dbUrl=process.env.DB_URL;
const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';

//db.local
//const dbUrl='mongodb://localhost:27017/yelp-camp'

//db
//const MongoDBStore=require('connect-mongo')(session);

//colt OLD
// mongoose.connect(dbUrl,{
//     useNewUrlParser:true,
//     useCreateIndex: true,
//     useUnifiedTopology:true,
//     useFindAndModify:false,
//  });
//database connection new way

mongoose.connect(dbUrl);
//mongoose.connect(dbUrl); //db live
const db=mongoose.connection;
 db.on("error",console.error.bind(console, "DB Connection Error:"));
 db.once("open",()=>{
     console.log("Database Connected");
 })


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
//for /public route hello.js
//app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')));
// To remove data///// mongo INJECTION:
app.use(mongoSanitize({
    replaceWith: '_',
}));

const secret=process.env.SECRET ||'thisshouldbeabettersecret!'
//mongo session
const store=MongoStore.create({
    mongoUrl:dbUrl,
    //secret:'thisshouldbeasecre!',//faulty
    touchAfter:24*60*60,
    crypto:{
        secret,
    }
})
store.on("error",function(e){
    console.log("Session STORE ERROR",e)
})
//session
const sessionConfig={
    store,
    name:'session',//otherwise it will show up on inspect application browser with blah instead of connect seesion id
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,//only runs on https not on http.. localhost is an example it wont run on localhost. you basically cant log in//make it true on deployment
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
//flash


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dhebzizsv/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dhebzizsv/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/dhebzizsv/", 
];
const fontSrcUrls = ["https://res.cloudinary.com/dhebzizsv/"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhebzizsv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(flash());
//passport password
app.use(passport.initialize());
app.use(passport.session());//must be used after app.use session
passport.use(new LocalStrategy(User.authenticate())) //adding ther user model//using local starety for local model user
passport.serializeUser(User.serializeUser())//how to serialize a user. how do we store user in the session
passport.deserializeUser(User.deserializeUser())//how to deserialize a user. how do we remove user from the session

//flash middleware before route hanlders
app.use((req,res,next)=>{
    if(!['/login','/'].includes(req.originalUrl)){
        req.session.returnTo=req.originalUrl;
    }
    console.log(req.query);
    // console.log(req.session);
    res.locals.currentUser=req.user;//it is not exclusive to flash but to get the req.user
    res.locals.success= req.flash('success');//we will have automatic access to res.locals.success or res.locals.aNyThInG
    res.locals.error=req.flash('error');
    next();
});


//routes
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get('/',(req,res)=>{
    res.render('home')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not Found!!',404))
})

//error handling
app.use((err,req,res,next)=>{
    if(!err.message) err.message='oH No! Something went Wrong!!'
    const {statusCode=500}=err;
    res.status(statusCode).render('error',{err});
})
const port=process.env.PORT||3000
app.listen(port,()=>{
    console.log(`Serving on port ${port}`)
})