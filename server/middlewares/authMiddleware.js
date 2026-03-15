const dotenv=require("dotenv");
const jwt=require("jsonwebtoken");


dotenv.config();
const secretcode=process.env.SECRET_CODE;


const middleware=async(req,res,next)=>{
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

module.exports=middleware;