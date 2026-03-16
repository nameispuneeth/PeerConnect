const express=require("express");
const router=express.Router();
const dotenv=require("dotenv");

const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const User=require("../models/user.model");

dotenv.config();

const secretcode=process.env.SECRET_CODE;

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'User not found' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token=await jwt.sign({id:user._id},secretcode);
        return res.status(200).json({ message: 'Login successful',token });
    }catch(err){
        console.log(err)
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post("/register",async(req,res)=>{
    const {email,password,username}=req.body;
    try{
        const user=await User.findOne({email:email});
        if(user) return res.status(400).json({message:"User Exists"});
        const newpassword=await bcrypt.hash(password,10);
        const newuser=await User.create({email:email,password:newpassword,username:username});
        if(newuser) return res.status(200).json({message:"User Registered Succesfully"});
        else return res.status(400).json({message:"Registration Failed"});
    }catch(e){
        res.status(500).json({message:"Server Error"});
    }
})

module.exports=router;