const express=require("express");

const User=require("../models/user.model");
const Course=require("../models/course.model");
const Store=require("../models/store.model");

const router = express.Router();
const middleware=require("../middlewares/authMiddleware");

router.use(middleware);

router.get("/profile",async(req,res)=>{
    const id=req.user;
    try{
        const user=await User.findById(id).populate("mycourses").populate("mystore").populate("purchasedcourses").populate("purchaseditems");
        if(!user) return res.status(400).json({message:"No User Found"});
        return res.status(200).json({message:"Successful",user:{name:user.username,followers:user.followers,following:user.following.length,mycourses:user.mycourses,mystore:user.mystore,coins:user.coins,boughtcourses:user.purchasedcourses,boughtitems:user.purchaseditems}});         
    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }   
})

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
        const storeitems=(await Store.find().populate({
            path:"bids.user",
            select:"username"
        })).filter((data)=>data.postedby!=id);
        res.status(200).json({message:"Successful",items:storeitems,id});
    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

router.get("/getallcourses",async(req,res)=>{
    const id=req.user;
    try{
        const courses=(await Course.find()).filter((data)=>data.postedby!=id);
        res.status(200).json({message:"Successful",courses});

    }catch(e){
        console.log(e);
        res.status(500).json({message:"Server Error"});
    }
})

// Helper: parse "Apr 2, 2026 from 14:00" -> Date
function parseTimeslot(str) {
    try {
        // e.g. "Apr 2, 2026 from 14:00"
        const cleaned = str.replace(" from ", " "); // "Apr 2, 2026 14:00"
        const d = new Date(cleaned);
        if (isNaN(d.getTime())) return null;
        return d;
    } catch {
        return null;
    }
}

router.post("/buycourse", async (req, res) => {
    const buyer_id = req.user;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "Send courseId" });
    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });
        if (course.assignedto) return res.status(400).json({ message: "Course already booked" });
        if (String(course.postedby) === String(buyer_id))
            return res.status(400).json({ message: "Cannot buy your own course" });

        // Server-side timeslot expiry check
        const slotDate = parseTimeslot(course.timeslot);
        if (slotDate && slotDate < new Date()) {
            return res.status(400).json({ message: "This course's time slot has already passed" });
        }

        const buyer = await User.findById(buyer_id);
        if (!buyer) return res.status(404).json({ message: "User not found" });
        if (buyer.coins < course.cost)
            return res.status(400).json({ message: "Insufficient coins" });

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Deduct coins from buyer
        buyer.coins -= course.cost;
        buyer.purchasedcourses.push(course._id);
        await buyer.save();

        // Assign student & store OTP
        course.assignedto = buyer._id;
        course.otp = otp;
        await course.save();

        return res.status(200).json({
            message: "Course booked successfully",
            coins: buyer.coins,
            timeslot: course.timeslot,
            dormitary: course.dormitary,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/getotp/:courseId", async (req, res) => {
    const buyer_id = req.user;
    const { courseId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });
        if (String(course.assignedto) !== String(buyer_id))
            return res.status(403).json({ message: "Not your course" });

        if (course.otpverified) {
            return res.status(200).json({ verified: true });
        }

        const slotDate = parseTimeslot(course.timeslot);
        if (!slotDate) return res.status(400).json({ message: "Cannot parse timeslot" });

        const now = new Date();
        const diffMs = slotDate - now;
        const diffMin = diffMs / 60000; // positive = slot is in the future

        // OTP visible from 10 min before until 60 min after
        if (diffMin > 10) {
            return res.status(425).json({
                message: "OTP not available yet",
                minutesLeft: Math.ceil(diffMin - 10),
            });
        }
        if (diffMin < -60) {
            return res.status(410).json({ message: "Session window has passed" });
        }

        return res.status(200).json({ verified: false, otp: course.otp });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/verifyotp", async (req, res) => {
    const teacher_id = req.user;
    const { courseId, otp } = req.body;
    if (!courseId || !otp) return res.status(400).json({ message: "Send courseId and otp" });
    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });
        if (String(course.postedby) !== String(teacher_id))
            return res.status(403).json({ message: "Not your course" });
        if (course.otpverified || course.coinstransferred)
            return res.status(400).json({ message: "OTP already verified" });
        if (course.otp !== String(otp))
            return res.status(400).json({ message: "Incorrect OTP" });

        // Transfer coins to teacher
        const teacher = await User.findById(teacher_id);
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });
        teacher.coins += course.cost;
        await teacher.save();

        course.otpverified = true;
        course.coinstransferred = true;
        await course.save();

        return res.status(200).json({ message: "OTP verified! Coins transferred.", coins: teacher.coins });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

// Teacher updates the timeslot of an expired/available course
router.put("/updatetimeslot", async (req, res) => {
    const teacher_id = req.user;
    const { courseId, timeslot } = req.body;
    if (!courseId || !timeslot) return res.status(400).json({ message: "Send courseId and timeslot" });
    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });
        if (String(course.postedby) !== String(teacher_id))
            return res.status(403).json({ message: "Not your course" });
        if (course.assignedto)
            return res.status(400).json({ message: "Cannot edit timeslot of a booked course" });

        course.timeslot = timeslot;
        await course.save();
        return res.status(200).json({ message: "Timeslot updated successfully", timeslot: course.timeslot });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/mypurchases", async (req, res) => {
    const id = req.user;
    try {
        const user = await User.findById(id).populate("purchasedcourses");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "Successful", courses: user.purchasedcourses });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

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

// Seller assigns the highest bidder as the winner → deducts coins from winner, generates OTP
router.post("/assignwinner", async (req, res) => {
    const seller_id = req.user;
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ message: "Send itemId" });
    try {
        const item = await Store.findById(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });
        if (String(item.postedby) !== String(seller_id))
            return res.status(403).json({ message: "Not your item" });
        if (item.assignedto)
            return res.status(400).json({ message: "Winner already assigned" });
        if (!item.bids || item.bids.length === 0)
            return res.status(400).json({ message: "No bids placed yet" });

        // The highest bidder is the last bid (bids pushed in ascending order)
        const winningBid = item.bids[item.bids.length - 1];
        const winner = await User.findById(winningBid.user);
        if (!winner) return res.status(404).json({ message: "Winner user not found" });
        if (winner.coins < item.currcost)
            return res.status(400).json({ message: "Winner has insufficient coins" });

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Deduct coins from winner immediately
        winner.coins -= item.currcost;
        winner.purchaseditems.push(item._id);
        await winner.save();

        // Assign winner & store OTP
        item.assignedto = winner._id;
        item.otp = otp;
        await item.save();

        return res.status(200).json({
            message: "Winner assigned successfully",
            winnerName: winner.username,
            finalCost: item.currcost,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

// Winner fetches their delivery OTP (available any time after assignment)
router.get("/getitemotp/:itemId", async (req, res) => {
    const buyer_id = req.user;
    const { itemId } = req.params;
    try {
        const item = await Store.findById(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });
        if (String(item.assignedto) !== String(buyer_id))
            return res.status(403).json({ message: "You are not the winner of this item" });
        if (item.otpverified)
            return res.status(200).json({ verified: true });
        return res.status(200).json({ verified: false, otp: item.otp });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

// Seller enters OTP at delivery → coins transferred to seller
router.post("/verifyitemotp", async (req, res) => {
    const seller_id = req.user;
    const { itemId, otp } = req.body;
    if (!itemId || !otp) return res.status(400).json({ message: "Send itemId and otp" });
    try {
        const item = await Store.findById(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });
        if (String(item.postedby) !== String(seller_id))
            return res.status(403).json({ message: "Not your item" });
        if (item.otpverified || item.coinstransferred)
            return res.status(400).json({ message: "OTP already verified" });
        if (item.otp !== String(otp))
            return res.status(400).json({ message: "Incorrect OTP" });

        const seller = await User.findById(seller_id);
        if (!seller) return res.status(404).json({ message: "Seller not found" });
        seller.coins += item.currcost;
        await seller.save();

        item.otpverified = true;
        item.coinstransferred = true;
        await item.save();

        return res.status(200).json({ message: "OTP verified! Coins transferred.", coins: seller.coins });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

// Buyer: list items they have won
router.get("/myorders", async (req, res) => {
    const id = req.user;
    try {
        const user = await User.findById(id).populate("purchaseditems");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "Successful", items: user.purchaseditems });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

// Search: users, courses, items
router.post("/search", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Send search query" });
    try {
        const searchRegex = new RegExp(query, 'i');

        // Search users by username
        const users = await User.find({ username: searchRegex }).select('username followers');

        // Search courses by title
        const courses = await Course.find({
            title: searchRegex,
            assignedto: null
        }).populate('postedby', 'username');

        // Search items by title
        const items = await Store.find({
            title: searchRegex,
            assignedto: null
        }).populate('postedby', 'username');

        return res.status(200).json({
            message: "Search successful",
            users,
            courses,
            items
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports=router;