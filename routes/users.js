const express=require('express');
const User = require('../models/user');
const router=express.Router();
const LocalStrategy=require('passport-local');
const passport=require('passport');
const wrapAsync = require('../utils/wrapAsync');


router.get('/signup/new',(req,res)=>{
    res.render('users/signup.ejs');
});
router.post('/signup',wrapAsync(async(req,res)=>{
        let {email,username,password}=req.body;
        let checkexistemail=await User.findOne({email:email});
        let checkusername=await User.findOne({username:username});
        if(checkexistemail){
            req.flash("error","Email already exists");
            return res.redirect('/signup/new');
        }
        else if(checkusername){
            req.flash("error","Username already exists.Try another");
            return res.redirect('/signup/new');
        }
        let user=new User({
            email:email,
            username:username,
        });
        let result=await User.register(user,password);
        req.login(result,(err)=>{
            if(err){
                return next(err);  
            }
            req.flash("success","User registered successfully");
            res.redirect('/listings');
        });

}));

router.get('/login',(req,res)=>{
    res.render('users/signin.ejs');
});

router.use((req,res,next)=>{
    if(req.session.originalUrl){
        res.locals.originalUrl=req.session.originalUrl;
    }
    next();
})
router.post('/login', passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),(req,res)=>{
    req.flash("success","You are logged in");
    const redirecturl=res.locals.originalUrl || '/listings'
    res.redirect(redirecturl);
});

router.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You are logged out");
        res.redirect('/login');
    });
})
module.exports=router;