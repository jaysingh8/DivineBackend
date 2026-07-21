import eventModel from "../models/eventBooking.js";
import profileModel from "../models/profile.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";

export const expirePendingEventBookings = async () => {
    try {
        const now = new Date();
        return await eventModel.updateMany(
            {
                bookingStatus: "pending",
                eventDate: { $lte: now },
            },
            { $set: { bookingStatus: "expired" } }
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const eventBooking = async (req, res) => {
    try {
        await expirePendingEventBookings();

        const serviceProvider = await profileModel
            .find({
                profession: { $in: ["photographer", "videographer"] },
            })
            .populate({
                path: "user",
                select: "_id fullname email role profileImage",
            });

        const filterProfile = serviceProvider
            .filter((p) => p.user)
            .map((p) => ({
                profileId: p._id,
                userId: p.user._id,
                name: p.user.fullname,
                email: p.user.email,
                profession: p.profession,
                profileImage: p.user.profileImage,
                city: p.city,
                experience: p.experience,
                price: p.pricePerHour,
                bio: p.bio,
            }));

        return res.status(200).json({
            success: true,
            message: "All profiles fetched successfully",
            serviceProvider: filterProfile,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const createBooking = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { provider, bookingType, eventType, eventDate, venue, city } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!provider || !bookingType || !eventType || !eventDate || !venue || !city) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(provider)) {
            return res.status(400).json({
                success: false,
                message: "Invalid provider id",
            });
        }

        const providerUser = await userModel.findById(provider);
        if (!providerUser) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        if (!["photographer", "videographer"].includes(bookingType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking type",
            });
        }

        const parsedDate = new Date(eventDate);
        if (isNaN(parsedDate.getTime()) || parsedDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or past event date",
            });
        }

        const newBooking = await eventModel.create({
            user: userId,
            provider,
            bookingType,
            eventType,
            eventDate: parsedDate,
            venue,
            city,
        });

        return res.status(201).json({
            success: true,
            message: "Booking request sent successfully",
            booking: newBooking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const myBooking = async (req, res) => {
    try {
        await expirePendingEventBookings();

        const booking = await eventModel
            .find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "provider",
                select: "fullname email profileImage",
            })
            .populate("user", "fullname email profileImage");

        return res.json({ success: true, bookings: booking, booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const providerBookings = async (req, res) => {
    try {
        await expirePendingEventBookings();

        const bookings = await eventModel
            .find({ provider: req.user._id })
            .sort({ createdAt: -1 })
            .populate("user", "fullname email profileImage")
            .populate({
                path: "provider",
                select: "fullname email profileImage",
            });

        return res.json({ success: true, bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const acceptBooking = async (req, res) => {
    try {
        await expirePendingEventBookings();

        const booking = await eventModel.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (booking.bookingStatus !== "pending") {
            return res.status(400).json({ success: false, message: "Booking is no longer pending" });
        }

        booking.bookingStatus = "accepted";
        await booking.save();

        const populatedBooking = await eventModel
            .findById(booking._id)
            .populate("user", "fullname email profileImage")
            .populate({
                path: "provider",
                select: "fullname email profileImage",
            });

        return res.json({ success: true, message: "Booking accepted", booking: populatedBooking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const declineBooking = async (req, res) => {
    try {
        await expirePendingEventBookings();

        const booking = await eventModel.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (booking.bookingStatus !== "pending") {
            return res.status(400).json({ success: false, message: "Booking is no longer pending" });
        }

        booking.bookingStatus = "declined";
        await booking.save();

        const populatedBooking = await eventModel
            .findById(booking._id)
            .populate("user", "fullname email profileImage")
            .populate({
                path: "provider",
                select: "fullname email profileImage",
            });

        return res.json({ success: true, message: "Booking declined", booking: populatedBooking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
