import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullname:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:false
    },
    contact:{
        type:String,
        required:false
    },
    role:{
        type:String,
        enum:["user","getter"],
        default:"user"
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    profileCompleted:{
        type:Boolean,
        default:false
    }
})


userSchema.pre("save", async function () {
    if(!this.isModified("password") || !this.password) return;
    const hash = await bcryptjs.hash(this.password,10)
    this.password = hash
    
})

userSchema.methods.comparePassword = async function(password) {
    return await bcryptjs.compare(password, this.password)   
}

const userModel = mongoose.model("User",userSchema)
export default userModel