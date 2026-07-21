import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { acceptBooking, createBooking, declineBooking, getNearBy, goAvailable, markBookingCompleted, myBooking, providerBookings } from "../controllers/instantBooking.controller.js";

const router = Router();

router.post("/nearby", authenticateUser, authorizeRoles("user"), getNearBy)

router.post("/create", authenticateUser, authorizeRoles("user"), createBooking)

router.get("/my-bookings", authenticateUser, authorizeRoles("user"), myBooking)

router.get("/provider-bookings", authenticateUser, authorizeRoles("getter"), providerBookings);

router.put("/accept/:id",authenticateUser,authorizeRoles("getter"), acceptBooking);

router.put("/decline/:id", authenticateUser, authorizeRoles("getter"), declineBooking);

router.patch("/complete/:id", authenticateUser, authorizeRoles("getter"), markBookingCompleted);

router.patch("/go-available", authenticateUser, authorizeRoles("getter"), goAvailable);
export default router;