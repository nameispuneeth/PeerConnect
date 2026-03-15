const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");

const userRoute=require("./routes/userRoute");
const authRoute=require("./routes/authRoute");


mongoose.connect("mongodb://localhost:27017/studentpeer").then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user",userRoute);
app.use("/api/auth",authRoute);



app.get('/', (req, res) => {
    res.send('Hello World');
});



app.listen(8000, () => {
    console.log(`Server is running on port http://localhost:8000`);
});