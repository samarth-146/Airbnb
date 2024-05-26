const express=require('express');
const router=express.Router({mergeParams:true});
const wrapAsync=require('../utils/wrapAsync');
const CustomError=require('../utils/customerr');
const {listingSchema}=require('../schemavalidator');
const Listing=require('../models/listing');


function validateListings(req,res,next){
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errormsg=error.details.map((el)=>el.message).join(",");
        throw new CustomError(400,errormsg);
    }else{
        next();
    }
};

//All Listings
router.get('/',wrapAsync(async(req,res)=>{
    const data=await Listing.find();
    res.render("listings/index.ejs",{data});
}));

//Form rendering for new listings
router.get('/new',(req,res)=>{
    res.render('listings/new_form.ejs');
});

//Show Route
router.get('/:id',wrapAsync(async(req,res,next)=>{
    const {id}=req.params;
    const data=await Listing.find({_id:id}).populate('reviews');
    res.render("listings/show.ejs",{data});
}));

//Add Route
router.post('/',validateListings,wrapAsync(async(req,res)=>{
    const insertData=new Listing(req.body.listings);
    await insertData.save();  
    res.redirect("/listings");
}));

//Render Edit Form
router.get('/edit/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const data=await Listing.find({_id:id});
    res.render("listings/edit_form.ejs",{data});
}));

//Edit Route
router.patch('/:id',validateListings,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const updatedData=req.body.listings;
    await Listing.updateOne({_id:id},updatedData);
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete('/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

module.exports=router;
