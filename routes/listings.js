const express=require('express');
const router=express.Router({mergeParams:true});
const wrapAsync=require('../utils/wrapAsync');
const CustomError=require('../utils/customerr');
const {listingSchema}=require('../schemavalidator');
const Listing=require('../models/listing');
const {storage}=require('../cloudconfig');
const multer  = require('multer');
const upload = multer({ storage });
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

//Server Side Validation
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
    if(!req.isAuthenticated()){
        req.session.originalUrl=req.originalUrl;
        req.flash("error","You must be logged in");
        return res.redirect('/listings');
    }
    res.render('listings/new_form.ejs');
});

//Show Route
router.get('/:id',wrapAsync(async(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.originalUrl=req.originalUrl;
    }
    const {id}=req.params;
    const data=await Listing.find({_id:id}).populate({
        path:"reviews",
        populate:{
            path:"owner"
        },
    })
    .populate("owner");
    res.render("listings/show.ejs",{data});
}));

//Add Route
router.post('/',upload.single('listings[image]'),validateListings,wrapAsync(async(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in");
        return res.redirect('/listings');
    }
    const forwardgeocoding=await geocodingClient.forwardGeocode({
        query: req.body.listings.location,
        limit: 1
      })
        .send()
    const url=req.file.path;
    const filename=req.file.filename;
    const insertData=new Listing(req.body.listings);
    insertData.owner=req.user._id;
    insertData.image={url,filename};
    insertData.geometry=forwardgeocoding.body.features[0].geometry
    await insertData.save(); 
    req.flash("success","New Listing Created"); 
    res.redirect("/listings");
}));

//Render Edit Form
router.get('/edit/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params;
    if(!req.isAuthenticated()){
        req.session.originalUrl=req.originalUrl;
        req.flash("error","You must be logged in");
        return res.redirect(`/listings/${id}`);
    }
    const data=await Listing.find({_id:id}).populate("owner");
    const owner=data[0].owner._id;
    if(req.user._id.toString()!==owner.toString()){
        req.flash("error","You do not have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    res.render("listings/edit_form.ejs",{data});
}));

//Edit Route
router.patch('/:id',upload.single('listings[image]'),validateListings,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    if(!req.isAuthenticated()){
        req.session.originalUrl=req.originalUrl;
        req.flash("error","You must be logged in");
        return res.redirect(`/listings/${id}`);
    }
    const data=await Listing.find({_id:id}).populate("owner");
    const owner=data[0].owner._id;
    if(req.user._id.toString()!==owner.toString()){
        req.flash("error","You do not have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    const updatedData=req.body.listings;
    let result=await Listing.findOneAndUpdate({_id:id},updatedData);
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        result.image={url,filename};
        await result.save();
    }
    req.flash('success',"Listing is updated");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete('/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params;
    if(!req.isAuthenticated()){
        req.session.originalUrl=req.originalUrl;
        req.flash("error","You must be logged in");
        return res.redirect(`/listings/${id}`);
    }
    const data=await Listing.find({_id:id}).populate("owner");
    const owner=data[0].owner._id;
    if(req.user._id.toString()!==owner.toString()){
        req.flash("error","You do not have permission to delete");
        return res.redirect(`/listings/${id}`);
    }
    let result=await Listing.findByIdAndDelete(id);
    req.flash('success',"Listing is deleted");
    res.redirect('/listings');
}));



module.exports=router;
