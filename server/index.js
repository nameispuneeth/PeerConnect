const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const User=require("./models/user.model");
const Course=require("./models/course.model");
const Store=require("./models/store.model");

dotenv.config();

mongoose.connect("mongodb://localhost:27017/studentpeer").then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post("/api/auth/login", async (req, res) => {
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
        return res.status(200).json({ message: 'Login successful', user });
    }catch(err){
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/api/auth/register",async(req,res)=>{
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

app.listen(8000, () => {
    console.log(`Server is running on port http://localhost:8000`);
});