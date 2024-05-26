const express=require('express');
const router=express.Router({ mergeParams: true });
const wrapAsync=require('../utils/wrapAsync');
const CustomError=require('../utils/customerr');
const {reviewSchema}=require('../schemavalidator');
const Listing=require('../models/listing');
const Review=require('../models/review');


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
    const listing=await Listing.findById(id);
    listing.reviews.push(insertReview);
    await insertReview.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));

//Delete Review
router.delete('/:reviewid',wrapAsync(async(req,res)=>{
    let {id,reviewid}=req.params;
    let delreview=await Review.findByIdAndDelete(reviewid);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    res.redirect(`/listings/${id}`);
}));

module.exports=router;
