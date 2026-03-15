const express=require("express");

const User=require("../models/user.model");
const Course=require("../models/course.model");
const Store=require("../models/store.model");

const router = express.Router();
const middleware=require("../middlewares/authMiddleware");

router.use(middleware);



router.post("/addcourse",async(req,res)=>{
    const id=req.user;
    const {title,cost,dormitary,timeslot,topics,duration}=req.body;
    if(!title || !cost || !dormitary || topics.length==0 || !timeslot || !duration) return res.status(400).json({message:"Send All Details"});
    try{
        const user=await User.findById(id);
        if(!user) return res.status(400).json({message:"No User Found"});

        let newCourse=await Course.create({postedby:user._id,title,cost,dormitary,timeslot,topics,duration});
        if(!newCourse) return res.status(400).json({message:"Unable to add Course. Try Again"});
        user.mycourses.push(newCourse._id);
        await user.save();
        return res.status(200).json({message:"Course Added Succesfully"});

    }catch(e){
        console.log(e)
        res.status(500).json({message:"Server Error"});

    }
})

router.get("/mycourses",async(req,res)=>{
    const id=req.user;
    try{
        const user=await User.findById(id).populate("mycourses");
        res.status(200).json({message:"Successful",mycourses:user.mycourses});
        

    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

router.post("/additem",async(req,res)=>{
    const id=req.user;
    const {title,images,currcost}=req.body;
    if(!title || !currcost || images.length==0) return res.status(400).json({message:"Send All Details"});
    try{
        const user=await User.findById(id);
        if(!user) return res.status(400).json({message:"No User Found"});

        let newItem=await Store.create({postedby:user._id,title,images,currcost});
        if(!newItem) return res.status(400).json({message:"Unable to add Course. Try Again"});
        user.mystore.push(newItem._id);
        await user.save();
        return res.status(200).json({message:"Item Added Succesfully"});

    }catch(e){
        console.log(e)
        res.status(500).json({message:"Server Error"});

    }
})

router.get("/myitems",async(req,res)=>{
    const id=req.user;
    try{
        const user=await User.findById(id).populate("mystore");

        res.status(200).json({message:"Successful",mystore:user.mystore});

    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

router.get("/getallitems",async(req,res)=>{
    const id=req.user;
    try{
        const storeitems=(await Store.find()).filter((data)=>data.postedby!=id);
        res.status(200).json({message:"Successful",items:storeitems});

    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

router.get("/getallcourses",async(req,res)=>{
    const id=req.user;
    try{
        const storeitems=(await Course.find()).filter((data)=>data.postedby!=id);
        res.status(200).json({message:"Successful",items:storeitems});

    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

router.post("/makebid",async(req,res)=>{
    const user_id=req.user;
    const {item_id,cost}=req.body;
    try{
        const item=await Store.findById(item_id);
        if(item.postedby==user_id) return res.status(400).json({message:"User cant bid his own item"});
        if(cost<=item.currcost) return res.status(400).json({message:"Bid has to be higher than current cost"});
        item.bids.push({user:user_id,bid:cost});
        item.currcost=cost;
        await item.save();
        res.status(200).json({message:"Successful"});
    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

module.exports=router;