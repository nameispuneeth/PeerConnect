const mongoose=require("mongoose");

const courseScheme=new mongoose.Schema({
    postedby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        required:true,
    },
    cost:{
        type:Number,
        required:true
    },
    dormitary:{
        type:String,
        required:true
    },
    topics:[String],
    timeslot:{
        type:Date,
        required:true
    },
    duration:{
        type:string,
        required:true
    }
});

module.exports=mongoose.model("Course",courseScheme);