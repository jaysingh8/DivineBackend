import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken"

async function sendToken(user , res, message) {
    const token = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:"7d"})

    res.cookie("token", token/*, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }*/)

    res.status(200).json({
        message,
        success:true,
        token,
        user:{
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
            isVerified: user.isVerified,
        }
    })
}

export const register = async (req,res)=>{
   const {fullname , email , password , isGetter,contact}= req.body

   try {
    
       const isUserExist = await userModel.findOne({
        $or:[
            {email},
            {contact}
        ]
       })

       if(isUserExist){
        return res.status(401).json({
            success:false,
            message:"user already exist"
        })
       }

       const user = await userModel.create({
        fullname,
        email,
        password,
        contact,
        role:isGetter?"getter":"user"
       })

       await sendToken(user,res,"Register successfully")
   } catch (error) {
    console.log(error);
    
    return res.status(500).json({message:"server error"})
   }
}


export const login = async (req,res)=>{ 
    const {email , password}=req.body;

    try {
        
        const user = await userModel.findOne({email})
    
        if(!user){
            return res.status(401).json({
                success:false,
                message:"email or password is incorrect"
            })
        }

        if (!user.password) {
            return res.status(401).json({
                success:false,
                message:"This account uses Google login. Please sign in with Google."
            })
        }

        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(401).json({
                success:false, 
                message:"email or password is incorrect"
            })
        }
        await sendToken(user,res,"user login successfully")
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message:"server error"})
    }
}

export const getMe = async(req,res)=>{
    const user = req.user

    console.log(user);
    
    try {
        res.status(200).json({
            message:"user fatch successfully",
            user:{
                id:user.id, 
                email:user.email,
                fullname:user.fullname,
                contact:user.contact,
                role:user.role,
                isVerified:user.isVerified
                
            },
            success:true

        })
    } catch (error) {
        console.log("something went wrong",error)
    }
}

export const googleCallback = async(req,res)=>{

    const { id ,displayName , emails , photos} = req.user
      
    const email = emails[0].value;
    const profilePic = photos[0].value

    let user = await userModel.findOne({email})

    if(!user){
        user = await userModel.create({
           email ,
           fullname:displayName,
           googleId:id,
           
        })
    } else {
        // Update existing user with Google info
        user.googleId = id;
        // Use fullname from Google if user didn't set one via email/password
        if (!user.fullname) {
            user.fullname = displayName;
        }
        await user.save();
    }

    const token = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:"7d"})

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    
    // Redirect with token and user data as query params so frontend can pick them up
    res.redirect(`${config.FRONTEND_URL}/?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        contact: user.contact,
        role: user.role,
        isVerified: user.isVerified
       
    }))}`)
}