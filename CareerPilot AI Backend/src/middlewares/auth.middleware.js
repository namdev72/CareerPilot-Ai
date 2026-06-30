//to authenticate the user we can verify the token
import jwt, { decode } from "jsonwebtoken";
import tokenBlackListModel from "../models/blacklist.model.js";


async function authUser(req,res,next){
    const token=req.cookies?.token
    if(!token){
        return res.status(401).json({
            message:"Token not provided"
        })
    }
    const isTokenBlackListed=await tokenBlackListModel.findOne({token})
    if(isTokenBlackListed){
        return res.status(401).json({
            message:"token is blacklisted"
        })
    }


    //verify is correct then we get the payload of token that we
    // given whne we created it , if verifucation false then jwt send the error

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // created new property req.user which has token payload id and username
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Invalid token" });
    }
}

export default authUser