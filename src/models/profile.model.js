import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    profileImage: {
      type: String,
      default:
        "https://tse4.mm.bing.net/th/id/OIP.3U017h9GAnFM3aRkV-WLiwHaHa?r=0&cb=thfc1falcon2&rs=1&pid=ImgDetMain&o=7&rm=3",
    },

    profession: {
      type: [String],
      enum: ["photographer", "videographer", "editor"],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one profession is required",
      },
    },

    bio: {
      type: String,
      maxlength: 500,
    },

    experience: {
      type: Number,
      default: 0,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    equipments: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one equipment is required",
      },
    },

    pricePerHour: {
      type: Number,
      default: 0,
    }, 

   location: {
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
    default: [0, 0],
  },
},
    // Available for Instant Booking
    isAvailable: {
      type: Boolean,
      default: false,
    },

    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },

    portfolioImages: [
      {
        url: String,
        fileId: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "busy", "offline"],
      default: "offline",
    },

    completedProfile: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Required for geo queries
profileSchema.index({
  location: "2dsphere",
});

const profileModel = mongoose.model("Profile", profileSchema);

export default profileModel;