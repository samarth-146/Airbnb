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
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1714572877812-7b416fbd4314?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1714572877812-7b416fbd4314?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v
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
    ]
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