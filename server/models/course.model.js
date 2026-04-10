const mongoose=require("mongoose");

const courseScheme=new mongoose.Schema({
    postedby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    assignedto:{
        type:mongoose.Schema.Types.ObjectId,
        default:null,
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
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        default:null
    },
    otpverified:{
        type:Boolean,
        default:false
    },
    coinstransferred:{
        type:Boolean,
        default:false
    }
});

module.exports=mongoose.model("Course",courseScheme);