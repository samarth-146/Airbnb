const express=require('express');
const router=express.Router({mergeParams:true});
const wrapAsync=require('../utils/wrapAsync');
const CustomError=require('../utils/customerr');
const {listingSchema}=require('../schemavalidator');
const Listing=require('../models/listing');

router.get('/villa',wrapAsync(async(req,res)=>{
    const data=await Listing.find({category:"villa"});
    res.render('listings/category.ejs',{data});
}));

router.get('/cabin',wrapAsync(async(req,res)=>{
    const data=await Listing.find({category:"cabins"});
    res.render('listings/category.ejs',{data});
}));


router.get('/mountain',wrapAsync(async(req,res)=>{
    const data=await Listing.find({category:"mountains"});
    res.render('listings/category.ejs',{data});
}))

router.get('/farm',wrapAsync(async(req,res)=>{
    const data=await Listing.find({category:"farms"});
    res.render('listings/category.ejs',{data});
}))

router.get('/listings/:id',wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    res.redirect(`/listings/${id}`);
}));



module.exports=router;