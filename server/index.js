import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    // try{
    //     const user = await User.findOne({ email });
    //     if(!user){
    //         return res.status(400).json({ message: 'User not found' });
    //     }
    //     const isPasswordCorrect = await bcrypt.compare(password, user.password);
    //     if(!isPasswordCorrect){
    //         return res.status(400).json({ message: 'Invalid password' });
    //     }
    //     return res.status(200).json({ message: 'Login successful', user });
    // }catch(err){
    //     return res.status(500).json({ message: 'Internal server error' });
    // }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});