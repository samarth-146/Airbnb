const { date } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema=new Schema({
    comment:{
        type:String,
    },
    rating:{
        type:Number,
        min:1,
        max:5,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
});

const Review=mongoose.model("Review",reviewSchema);
module.exports=Review;