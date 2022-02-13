const mongoose = require('mongoose');
const cities = require('./cities');
const{ places, descriptors }= require('./seedHelpers');
const Campground = require('../models/campground');
const axios=require('axios').default;

mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db = mongoose.connection;
 db.on("error",console.error.bind(console, "DB Connection Error:"));
 db.once("open",()=>{
     console.log("Database Connected");
 });

const sample= array => array[Math.floor(Math.random() * array.length)];


const seedDB= async() =>{
     await Campground.deleteMany({});
     for (let i = 0; i <300; i++){
         const random1000= Math.floor(Math.random()*1000); 
         const price=Math.floor(Math.random()*20)+10;
         const camp= new Campground({
           //use the admin author or the author u want to be admin 
             author:'61f28d2a2e0a47a436a2b068',
             location:`${cities[random1000].city}, ${cities[random1000].state}`,
             title:`${sample(descriptors)} ${sample(places)}`,
             description:'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis, et deserunt dolorum ipsum id accusamus blanditiis eveniet asperiores totam voluptatem aut voluptatum tempora enim repellat distinctio rem itaque suscipit voluptate.',
             price,
             geometry: { 
               type: 'Point',
               coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]//longitude first and latitude second
            },
             images:[
                {
                  url: 'https://res.cloudinary.com/dhebzizsv/image/upload/v1644496245/lamp-camping_jaxkdd.jpg',
                  filename: 'YelpCamp/lamp-camping_jaxkdd',
                }
              ]
         })
         await camp.save();
    }
 }

 seedDB().then(()=>{
     mongoose.connection.close();
 })