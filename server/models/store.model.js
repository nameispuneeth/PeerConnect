const mongoose=require("mongoose");

const storeSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    bids:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            bid:{
                type:Number,
            }
        }
    ],
    currCost:{
        type:Number,
        required:true,
    }
});

module.exports=mongoose.model("Store",storeSchema);