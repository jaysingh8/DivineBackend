import mongoose from "mongoose";

const instantBookingSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    provider:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required:true
    },

    bookingType:{
        type:String,
        enum:[
            "photographer",
            "videographer"
           
        ],
        required:true
    },

    status:{
        type:String,
        enum:[
            "pending",
            "accepted",
            "declined",
            "expired",
            "completed"
        ],
        default:"pending"
    },

    expiresAt:{
        type:Date,
        required:true
    }

},
{
    timestamps:true
}
);



const instantBookingModel = mongoose.model("InstantBooking" , instantBookingSchema)
export default instantBookingModel