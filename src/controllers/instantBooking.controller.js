import instantBookingModel from "../models/instantBooking.model.js";
import profileModel from "../models/profile.model.js";
import userModel from "../models/user.model.js";

export const expirePendingBookings = async () => {
    try {
        const now = new Date();
        const expiredBookings = await instantBookingModel.find({
            status: "pending",
            expiresAt: { $lte: now },
        });

        if (!expiredBookings.length) return [];

        const updatedBookings = await Promise.all(
            expiredBookings.map(async (booking) => {
                booking.status = "expired";
                await booking.save();

                const populatedBooking = await instantBookingModel
                    .findById(booking._id)
                    .populate({
                        path: "provider",
                        populate: { path: "user", select: "fullname email profileImage" }
                    })
                    .populate("user", "fullname email");

                return populatedBooking;
            })
        );

        return updatedBookings;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const markBookingCompleted = async (req, res) => {
    try {
        await expirePendingBookings();

        const booking = await instantBookingModel.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const profile = await profileModel.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(403).json({ success: false, message: "Provider profile not found" });
        }

        if (booking.provider.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (booking.status !== "accepted") {
            return res.status(400).json({ success: false, message: "Only accepted bookings can be marked complete" });
        }

        booking.status = "completed";
        await booking.save();

        const populatedBooking = await instantBookingModel
            .findById(booking._id)
            .populate({
                path: "provider",
                populate: { path: "user", select: "fullname email profileImage" }
            })
            .populate("user", "fullname email");

        res.json({ success: true, message: "Booking marked complete", booking: populatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /bookings/nearby
export const getNearBy = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const providers = await profileModel.find({
            isAvailable: true,
            status: "active",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000
                }
            }
        }).populate("user", "fullname email");

        res.status(200).json({ success: true, providers });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /bookings/create
export const createBooking = async (req, res) => {
    try {
        await expirePendingBookings();

        const { providerId, bookingType } = req.body;
        const userId = req.user._id;

        // Fetch provider profile with user populated (single query — reused below)
        const providerProfile = await profileModel
            .findById(providerId)
            .populate("user", "fullname email");

        if (!providerProfile) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        if (!providerProfile.isAvailable || providerProfile.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Provider is currently busy or unavailable"
            });
        }

        // Prevent duplicate booking with the same provider
        const existingBooking = await instantBookingModel.findOne({
            user: userId,
            provider: providerId,
            status: { $in: ["pending", "accepted"] }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending or accepted booking with this provider"
            });
        }

        // Prevent spam — one pending booking at a time
        const userPendingBooking = await instantBookingModel.findOne({
            user: userId,
            status: "pending"
        });

        if (userPendingBooking) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending booking request. Please wait for a response."
            });
        }

        const booking = await instantBookingModel.create({
            user: userId,
            provider: providerId,
            bookingType,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });

        // Single populate for the response
        const populatedBooking = await instantBookingModel
            .findById(booking._id)
            .populate("user", "fullname email")
            .populate({
                path: "provider",
                populate: { path: "user", select: "fullname email profileImage" }
            });

        res.status(201).json({ success: true, booking: populatedBooking });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /bookings/my
export const myBooking = async (req, res) => {
    try {
        await expirePendingBookings();

        const bookings = await instantBookingModel
            .find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "provider",
                populate: { path: "user", select: "fullname email profileImage" }
            });

        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /bookings/provider
export const providerBookings = async (req, res) => {
    try {
        await expirePendingBookings();

        const profile = await profileModel.findOne({ user: req.user._id });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found" });
        }

        const bookings = await instantBookingModel
            .find({ provider: profile._id })
            .sort({ createdAt: -1 })
            .populate("user", "fullname email");

        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /bookings/:id/accept
export const acceptBooking = async (req, res) => {
    try {
        await expirePendingBookings();

        // Authorization: ensure the requesting user owns this provider profile
        const profile = await profileModel.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(403).json({ success: false, message: "Provider profile not found" });
        }

        const booking = await instantBookingModel.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.provider.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({ success: false, message: "Booking is no longer pending" });
        }

        // Reject expired bookings
        if (new Date() > booking.expiresAt) {
            booking.status = "expired";
            await booking.save();
            return res.status(400).json({ success: false, message: "Booking has expired" });
        }

        booking.status = "accepted";
        await booking.save();

        // Mark provider as busy
        await profileModel.findByIdAndUpdate(booking.provider, {
            status: "busy",
            isAvailable: false
        });

        // Decline all other pending bookings for this provider
        await instantBookingModel.updateMany(
            { provider: booking.provider, status: "pending", _id: { $ne: booking._id } },
            { status: "declined" }
        );

        const populatedBooking = await instantBookingModel
            .findById(booking._id)
            .populate({
                path: "provider",
                populate: { path: "user", select: "fullname email profileImage" }
            });

        res.json({ success: true, message: "Booking accepted", booking: populatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /bookings/:id/decline
export const declineBooking = async (req, res) => {
    try {
        await expirePendingBookings();

        // Authorization: ensure the requesting user owns this provider profile
        const profile = await profileModel.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(403).json({ success: false, message: "Provider profile not found" });
        }

        const booking = await instantBookingModel.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.provider.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({ success: false, message: "Booking is no longer pending" });
        }

        booking.status = "declined";
        await booking.save();

        const populatedBooking = await instantBookingModel
            .findById(booking._id)
            .populate({
                path: "provider",
                populate: { path: "user", select: "fullname email profileImage" }
            });

        res.json({ success: true, message: "Booking declined", booking: populatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /bookings/go-available
export const goAvailable = async (req, res) => {
    try {
        const profile = await profileModel.findOneAndUpdate(
            { user: req.user._id },
            { status: "active", isAvailable: true },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found" });
        }

        res.json({ success: true, message: "You are now available", profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};