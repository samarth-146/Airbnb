const express=require('express');
const router=express.Router({ mergeParams: true });
const wrapAsync=require('../utils/wrapAsync');
const CustomError=require('../utils/customerr');
const {reviewSchema}=require('../schemavalidator');
const Listing=require('../models/listing');
const Review=require('../models/review');
const User = require('../models/user');

function validateReview(req,res,next){
    let result=reviewSchema.validate(req.body);
    if(result.error){
        throw new CustomError(400,result.error)
    }else{
        next();
    }
};

//Add Review
router.post('/',validateReview,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const data=req.body.reviews;
    const insertReview=new Review(data);
    insertReview.owner=req.user._id;
    const listing=await Listing.findById(id);
    listing.reviews.push(insertReview);
    await insertReview.save();
    await listing.save();
    req.flash('success',"Review is added");
    res.redirect(`/listings/${id}`);
}));

//Delete Review
router.delete('/:reviewid',wrapAsync(async(req,res)=>{
    let {id,reviewid}=req.params;
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to delete the reviews");
        return res.redirect(`/listings/${id}`);
    }
    const review = await Review.findById(reviewid);
    if(req.user._id.toString()!==review.owner.toString()){
        req.flash("error","You do not have permission to delete it!");
        return res.redirect(`/listings/${id}`);
    }
    let delreview=await Review.findByIdAndDelete(reviewid);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    req.flash('success',"Review is deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;
