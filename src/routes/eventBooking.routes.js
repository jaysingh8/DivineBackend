import { Router } from 'express';
import { acceptBooking, createBooking, declineBooking, eventBooking, myBooking, providerBookings } from '../controllers/eventBooking.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = Router();

router.get('/eventBooking', eventBooking);

router.post('/create-booking', authenticateUser, createBooking);

router.get('/my-booking', authenticateUser, authorizeRoles('user'), myBooking);
router.get('/provider-bookings', authenticateUser, authorizeRoles('getter'), providerBookings);
router.patch('/accept/:id', authenticateUser, authorizeRoles('getter'), acceptBooking);
router.patch('/decline/:id', authenticateUser, authorizeRoles('getter'), declineBooking);



export default router;