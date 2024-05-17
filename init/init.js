const sampleData=require('./data.js');
const Listing=require('../models/listing.js');
const mongoose=require('mongoose');

async function main(){
  await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
};

main()
.catch((err)=>{
  console.log(err);
});

Listing.deleteMany({});
Listing.insertMany(sampleData.data);