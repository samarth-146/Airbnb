if(process.env.NODE_ENV!='production'){
    require('dotenv').config();
}
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
let methodOverride = require('method-override');
let engine=require('ejs-mate');
const CustomError=require('./utils/customerr');
const listings=require('./routes/listings');
const reviews=require('./routes/reviews');
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const users=require('./routes/users');
const category=require('./routes/category');

const atlasUrl=process.env.ATLAS_DB;
async function main(){
    await mongoose.connect(atlasUrl);
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

//Store session in mongoAtlas
const store=MongoStore.create({
    mongoUrl:atlasUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("Error in mongostore");
})
//Session
app.use(session({
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+2*24*3600*1000,
        maxAge:2*24*3600*1000,
        httpOnly:true,
    }
}));
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
//passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.engine('ejs',engine);

app.get('/',(req,res)=>{
    res.send("Root");
});

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.user=req.user;
    next();
});

//Routes    
app.use('/listings',listings);
app.use('/listings/reviews/:id',reviews);
app.use('/',users);
app.use('/listings/category',category);

//Error Handling Routes
app.all('*',(req,res,next)=>{
    next(new CustomError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {status=500,message="Something Went Something"}=err;
    res.status(status).render("error.ejs",{message,status});
});

app.listen(8080);