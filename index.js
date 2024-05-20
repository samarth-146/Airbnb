const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing=require('./models/listing');
const path=require('path');
let methodOverride = require('method-override');
let engine=require('ejs-mate');
const wrapAsync=require('./utils/wrapAsync');
const CustomError=require('./utils/customerr');
const {listingSchema}=require('./schemavalidator');


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
};

main()
.catch((err)=>{
    console.log(err);
})

//Server-Side Validation
function validateSchema(req,res,next){
    let result=listingSchema.validate(req.body);
    if(result.error){
        throw new CustomError(400,result.error)
    }else{
        next();
    }
};

app.use(methodOverride('_method'))
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.engine('ejs',engine);

app.get('/',(req,res)=>{
    res.send("Root");
});

app.get('/listings',wrapAsync(async(req,res)=>{
    const data=await Listing.find();
    res.render("listings/index.ejs",{data});
}));

app.get('/listings/new',(req,res)=>{
    res.render('listings/new_form.ejs');
});

app.get('/listings/:id',wrapAsync(async(req,res,next)=>{
    const {id}=req.params;
    const data=await Listing.find({_id:id});

    res.render("listings/show.ejs",{data});
}));

app.post('/listings',validateSchema,wrapAsync(async(req,res)=>{
    const insertData=new Listing(req.body.listings);
    await insertData.save();  
    res.redirect("/listings");
}));

app.get('/listings/edit/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const data=await Listing.find({_id:id});
    res.render("listings/edit_form.ejs",{data});
}));

app.patch('/listings/:id',validateSchema,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const updatedData=req.body.listings;
    await Listing.updateOne({_id:id},updatedData);
    res.redirect(`/listings/${id}`);
}));

app.delete('/listings/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params;
    await Listing.deleteOne({_id:id});
    res.redirect('/listings');
}));

app.all('*',(req,res,next)=>{
    next(new CustomError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {status=500,message="Something Went Something"}=err;
    res.status(status).render("error.ejs",{message,status});
});

app.listen(8080);