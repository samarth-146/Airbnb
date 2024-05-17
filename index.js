const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing=require('./models/listing');
const path=require('path');
let methodOverride = require('method-override');
let engine=require('ejs-mate');


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
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public/css")));
app.use(express.static(path.join(__dirname,"public/js")));
app.engine('ejs',engine);

app.get('/',(req,res)=>{
    res.send("Root");
});

app.get('/listings',async(req,res)=>{
    const data=await Listing.find();
    res.render("listings/index.ejs",{data});
});

app.get('/listings/new',(req,res)=>{
    res.render('listings/new_form.ejs');
});

app.get('/listings/:id',async(req,res)=>{
    const {id}=req.params;
    const data=await Listing.find({_id:id});
    res.render("listings/show.ejs",{data});
});

app.post('/listings',async(req,res)=>{
    const insertData=new Listing(req.body.listings);
    await insertData.save();  
    res.redirect("/listings");
});

app.get('/listings/edit/:id',async(req,res)=>{
    const {id}=req.params;
    const data=await Listing.find({_id:id});
    res.render("listings/edit_form.ejs",{data});
});

app.patch('/listings/:id',async(req,res)=>{
    const {id}=req.params;
    const updatedData=req.body.listings;
    await Listing.updateOne({_id:id},updatedData);
    res.redirect(`/listings/${id}`);
});

app.delete('/listings/:id',async(req,res)=>{
    const {id}=req.params;
    await Listing.deleteOne({_id:id});
    res.redirect('/listings');
})

app.listen(8080);