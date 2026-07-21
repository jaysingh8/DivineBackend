import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
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
    eventType:{
        type:String,
        required:true
    },
    eventDate:{
        type:Date,
        required:true
    },
      venue: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "accepted", "declined", "rejected", "completed", "cancelled", "expire", "expired"],
      default: "pending",
    },

},{
    timestamps:true
})


const eventModel = mongoose.model("events",eventSchema)

export default eventModel