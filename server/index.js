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

const secretcode=process.env.SECRET_CODE;

mongoose.connect("mongodb://localhost:27017/studentpeer").then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});

const app = express();

async function middleware(req,res,next){
    const token=req.headers.authorization;
    if(token){
        try{
            const data=jwt.verify(token,secretcode);
            req.user=data.id;
            next();
        }catch(e){
            return res.status(400).json({message:"Authentication Failed"});
        }
    }else{
        return res.status(500).json({message:"Server Error"});
    }
    
}

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
        const token=await jwt.sign({id:user._id},secretcode);
        return res.status(200).json({ message: 'Login successful', user,token });
    }catch(err){
        console.log(err)
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

app.post("/api/user/addcourse",middleware,async(req,res)=>{
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

app.get("/api/user/mycourses",middleware,async(req,res)=>{
    const id=req.user;
    try{
        const user=await User.findById(id).populate("mycourses");
        res.status(200).json({message:"Successful",mycourses:user.mycourses});
        

    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

app.post("/api/user/additem",middleware,async(req,res)=>{
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

app.get("/api/user/myitems",middleware,async(req,res)=>{
    const id=req.user;
    try{
        const user=await User.findById(id).populate("mystore");
        res.status(200).json({message:"Successful",mystore:user.mystore});

    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

app.listen(8000, () => {
    console.log(`Server is running on port http://localhost:8000`);
});