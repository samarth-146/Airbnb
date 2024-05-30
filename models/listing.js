const mongoose = require('mongoose');
const Review = require('./review');

const ListSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image:{
        url:String,
        filename:String,
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    reviews:[
        {type:mongoose.Schema.Types.ObjectId,ref:'Review'}
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type: {
            type: String, 
            enum: ['Point'],
            required:true
            
          },
          coordinates: {
            type: [Number],
            required:true
          }
    },
    category:{
        type:String,
        enum:["villa","cabins","mountains","farms"],
        required:true,
    },
});

//Middleware if listing is deleted..
ListSchema.post('findOneAndDelete',async(listing)=>{
    if(listing.reviews.length && listing){
        console.log(listing);
        let res=await Review.deleteMany({_id:{$in:listing.reviews}});
        console.log(res);
    }
});

const Listing = mongoose.model("Listing", ListSchema);
module.exports=Listing;