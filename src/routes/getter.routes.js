import Router from 'express'
import { profileValidator } from '../validators/getter.validator.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import { getAllProfile, getProfile, isActive, portfolio, profile, profileDetail } from '../controllers/getter.controller.js';
import multer from 'multer'

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})

// profileImage is now a real file upload, not base64 in JSON
router.post(
    "/profile",
    authenticateUser,
    authorizeRoles("getter"),
    upload.single('profileImage'),
    profileValidator,
    profile
)

// fixed: was upload.array('images', 3) but frontend allows up to 6 (MAX_IMAGES)
router.post("/portfolio", authenticateUser, authorizeRoles("getter"), upload.array('images', 6), portfolio)

router.get("/getProfile", authenticateUser, getProfile)

router.get("/", getAllProfile)
router.get("/profile/:id", profileDetail)

router.patch("/isActive", authenticateUser, isActive)

export default router