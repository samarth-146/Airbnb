const sampleData=require('./data.js');
const Listing=require('../models/listing.js');
const mongoose=require('mongoose');

async function main(){
  await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
};

main()
.then((res)=>{
  console.log("Successful");
})
.catch((err)=>{
  console.log(err);
});

async function initData(){
  await Listing.deleteMany({});
  sampleData.data=sampleData.data.map((obj)=>({...obj,owner:"66544677d8419487c49f15d7"}));
  await Listing.insertMany(sampleData.data);
  console.log("Data initialised");
};
initData();
