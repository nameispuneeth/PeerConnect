const mongoose=require("mongoose");

const storeSchema=new mongoose.Schema({
    postedby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        required:true
    },
    images:[
        {
            type:String,
        }
    ],
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
    currcost:{
        type:Number,
        required:true,
    }
});

module.exports=mongoose.model("Store",storeSchema);