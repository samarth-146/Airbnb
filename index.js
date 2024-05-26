const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
let methodOverride = require('method-override');
let engine=require('ejs-mate');
const CustomError=require('./utils/customerr');
const listings=require('./routes/listings');
const reviews=require('./routes/reviews');


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
};

main()
.catch((err)=>{
    console.log(err);
})

app.use(methodOverride('_method'))
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.engine('ejs',engine);

app.get('/',(req,res)=>{
    res.send("Root");
});

//Routes
app.use('/listings',listings);
app.use('/listings/reviews/:id',reviews);

//Error Handling Routes
app.all('*',(req,res,next)=>{
    next(new CustomError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {status=500,message="Something Went Something"}=err;
    res.status(status).render("error.ejs",{message,status});
});

app.listen(8080);