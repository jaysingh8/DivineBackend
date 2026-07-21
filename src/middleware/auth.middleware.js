import jwt from 'jsonwebtoken'
import userModel from "../models/user.model.js"
import {config} from "../config/config.js"

export const authenticateUser = async (req,res,next)=>{
    try {
        const token = req.cookies.token

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorised"
            })
        }
        const decode = jwt.verify(token,config.JWT_SECRET)
        const user = await userModel.findById(decode.id)

        if(!user){
            return res.status(401).json({
                
                message:"user not found"
            })
        }
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ message: error.message })

    }
}